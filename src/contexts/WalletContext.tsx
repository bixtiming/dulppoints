import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  startAfter,
  setDoc,
} from 'firebase/firestore';
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// Local Storage Keys
const STORAGE_KEYS = {
  BALANCE: 'dulp_wallet_balance',
  TRANSACTIONS: 'dulp_wallet_transactions',
  PENDING_SYNC: 'dulp_wallet_pending_sync',
  LAST_SYNC: 'dulp_wallet_last_sync',
} as const;

// Local Storage Interface
interface LocalStorageData {
  balance: number;
  transactions: Transaction[];
  pendingSync: PendingSyncItem[];
  lastSync: number;
}

interface PendingSyncItem {
  id: string;
  type: 'balance_update' | 'transaction_add';
  data: any;
  timestamp: number;
  retryCount: number;
}

//
// --- Local Storage Utilities ---
//
class LocalStorageManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private getKey(key: string): string {
    return `${key}_${this.userId}`;
  }

  // Get data from local storage
  getData(): LocalStorageData {
    try {
      const balance = Number(localStorage.getItem(this.getKey(STORAGE_KEYS.BALANCE))) || 0;
      const transactions = JSON.parse(localStorage.getItem(this.getKey(STORAGE_KEYS.TRANSACTIONS)) || '[]').map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
      const pendingSync = JSON.parse(localStorage.getItem(this.getKey(STORAGE_KEYS.PENDING_SYNC)) || '[]');
      const lastSync = Number(localStorage.getItem(this.getKey(STORAGE_KEYS.LAST_SYNC))) || 0;

      return { balance, transactions, pendingSync, lastSync };
    } catch (error) {
      return { balance: 0, transactions: [], pendingSync: [], lastSync: 0 };
    }
  }

  // Save data to local storage
  saveData(data: Partial<LocalStorageData>): void {
    try {
      if (data.balance !== undefined) {
        localStorage.setItem(this.getKey(STORAGE_KEYS.BALANCE), data.balance.toString());
      }
      if (data.transactions !== undefined) {
        localStorage.setItem(this.getKey(STORAGE_KEYS.TRANSACTIONS), JSON.stringify(data.transactions));
      }
      if (data.pendingSync !== undefined) {
        localStorage.setItem(this.getKey(STORAGE_KEYS.PENDING_SYNC), JSON.stringify(data.pendingSync));
      }
      if (data.lastSync !== undefined) {
        localStorage.setItem(this.getKey(STORAGE_KEYS.LAST_SYNC), data.lastSync.toString());
      }
    } catch (error) {
      // Silent fail for localStorage errors
    }
  }

  // Add pending sync item
  addPendingSync(item: PendingSyncItem): void {
    try {
      const current = this.getData();
      current.pendingSync.push(item);
      this.saveData({ pendingSync: current.pendingSync });
    } catch (error) {
      // Silent fail for localStorage errors
    }
  }

  // Remove pending sync item
  removePendingSync(id: string): void {
    try {
      const current = this.getData();
      current.pendingSync = current.pendingSync.filter(item => item.id !== id);
      this.saveData({ pendingSync: current.pendingSync });
    } catch (error) {
      // Silent fail for localStorage errors
    }
  }

  // Clear all data for user
  clearData(): void {
    try {
      localStorage.removeItem(this.getKey(STORAGE_KEYS.BALANCE));
      localStorage.removeItem(this.getKey(STORAGE_KEYS.TRANSACTIONS));
      localStorage.removeItem(this.getKey(STORAGE_KEYS.PENDING_SYNC));
      localStorage.removeItem(this.getKey(STORAGE_KEYS.LAST_SYNC));
    } catch (error) {
      // Silent fail for localStorage errors
    }
  }
}

//
// --- Types ---
//
export type TransactionType = 'earn' | 'spend' | 'referral' | 'bonus';

export interface FirestoreTransaction {
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: any; // Firestore Timestamp
  gameId?: string;
  referralId?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: Date;
  gameId?: string;
  referralId?: string;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  updateBalance: (
    amount: number,
    description: string,
    type?: TransactionType,
    extras?: { gameId?: string; referralId?: string }
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
  loadMoreTransactions: () => Promise<void>;
  isOnline: boolean;
  pendingSyncCount: number;
  syncPendingData: () => Promise<void>;
}

//
// --- Context Setup ---
//
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

//
// --- Provider ---
//
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [storageManager, setStorageManager] = useState<LocalStorageManager | null>(null);

  // Initialize storage manager when user changes
  useEffect(() => {
    if (currentUser) {
      const manager = new LocalStorageManager(currentUser.uid);
      setStorageManager(manager);
      
      // Load initial data from localStorage
      const localData = manager.getData();
      setBalance(localData.balance);
      setTransactions(localData.transactions);
      setPendingSyncCount(localData.pendingSync.length);
    } else {
      setStorageManager(null);
      setBalance(0);
      setTransactions([]);
      setPendingSyncCount(0);
    }
  }, [currentUser]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (storageManager) {
        syncPendingData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storageManager]);

  //
  // --- Firestore Listeners (Only when online) ---
  //
  useEffect(() => {
    if (!currentUser || !isOnline || !storageManager) {
      setLoading(false);
      return;
    }

    // Listen to user's balance in real-time
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreBalance = docSnap.data().points || 0;
        setBalance(firestoreBalance);
        storageManager.saveData({ balance: firestoreBalance, lastSync: Date.now() });
      }
    }, (error) => {
      const localData = storageManager.getData();
      setBalance(localData.balance);
    });

    // Initial transaction fetch
    const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
    const transactionsQuery = query(transactionsRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const newTransactions: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as FirestoreTransaction),
        timestamp: doc.data().timestamp?.toDate?.() ?? new Date(),
      }));
      setTransactions(newTransactions);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.size === 20);
      setLoading(false);
      storageManager.saveData({ transactions: newTransactions, lastSync: Date.now() });
    }, (error) => {
      const localData = storageManager.getData();
      setTransactions(localData.transactions);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [currentUser, isOnline, storageManager]);



  //
  // --- Sync Pending Data ---
  //
  const syncPendingData = useCallback(async () => {
    if (!currentUser || !storageManager || !isOnline) return;

    const localData = storageManager.getData();
    const pendingItems = localData.pendingSync;

    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      try {
        if (item.type === 'balance_update') {
          await updateBalanceOnFirestore(item.data.amount, item.data.description, item.data.type, item.data.extras);
        } else if (item.type === 'transaction_add') {
          await addTransactionToFirestore(item.data);
        }
        
        storageManager.removePendingSync(item.id);
        setPendingSyncCount(prev => prev - 1);
      } catch (error) {
        item.retryCount++;
        if (item.retryCount > 3) {
          storageManager.removePendingSync(item.id);
          setPendingSyncCount(prev => prev - 1);
        }
      }
    }
  }, [currentUser, storageManager, isOnline]);

  //
  // --- Load More Transactions (Pagination) ---
  //
  async function loadMoreTransactions() {
    if (!currentUser || !lastDoc || !hasMore) return;

    try {
      const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
      const nextQuery = query(
        transactionsRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(20)
      );

      const snapshot = await (await import('firebase/firestore')).getDocs(nextQuery);

      const newTransactions: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as FirestoreTransaction),
        timestamp: doc.data().timestamp?.toDate?.() ?? new Date(),
      }));

      setTransactions((prev) => [...prev, ...newTransactions]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.size === 20);
    } catch (err) {
      setError('Failed to load more transactions');
    }
  }

  //
  // --- Update Balance (Local Storage First + Background Sync) ---
  //
  async function updateBalance(
    amount: number,
    description: string,
    type: TransactionType = amount > 0 ? 'earn' : 'spend',
    extras: { gameId?: string; referralId?: string } = {}
  ) {
    if (!currentUser) throw new Error('User not authenticated');
    if (!storageManager) throw new Error('Storage manager not initialized');

    const prevBalance = balance;
    const newBalance = prevBalance + amount;

    // Validate balance
    if (newBalance < 0) throw new Error('Insufficient balance');

    // Update local state immediately (optimistic UI)
    setBalance(newBalance);

    // Create transaction object
    const transaction: Transaction = {
      id: `local_${Date.now()}_${Math.random()}`,
      type,
      amount,
      description,
      timestamp: new Date(),
      ...(extras.gameId && { gameId: extras.gameId }),
      ...(extras.referralId && { referralId: extras.referralId }),
    };

    // Update localStorage immediately
    const localData = storageManager.getData();
    localData.balance = newBalance;
    localData.transactions.unshift(transaction);
    storageManager.saveData(localData);

    // Try to sync with Firestore if online
    if (isOnline) {
      try {
        await updateBalanceOnFirestore(amount, description, type, extras);
        setError(null);
      } catch (error) {
        const pendingItem: PendingSyncItem = {
          id: `sync_${Date.now()}_${Math.random()}`,
          type: 'balance_update',
          data: { amount, description, type, extras },
          timestamp: Date.now(),
          retryCount: 0,
        };
        storageManager.addPendingSync(pendingItem);
        setPendingSyncCount(prev => prev + 1);
        setError('Changes saved locally. Will sync when connection is restored.');
      }
    } else {
      const pendingItem: PendingSyncItem = {
        id: `sync_${Date.now()}_${Math.random()}`,
        type: 'balance_update',
        data: { amount, description, type, extras },
        timestamp: Date.now(),
        retryCount: 0,
      };
      storageManager.addPendingSync(pendingItem);
      setPendingSyncCount(prev => prev + 1);
      setError('Changes saved locally. Will sync when connection is restored.');
    }
  }

  // Helper function to update balance on Firestore
  async function updateBalanceOnFirestore(
    amount: number,
    description: string,
    type: TransactionType,
    extras: { gameId?: string; referralId?: string }
  ) {
    if (!currentUser) throw new Error('User not authenticated');

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        transaction.set(userRef, {
          email: currentUser.email || '',
          createdAt: serverTimestamp(),
          points: 0,
          level: 1,
          experience: 0,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referredBy: null,
          totalEarnings: 0,
          gamesPlayed: 0,
          referralsCount: 0
        });
      }

      const currentPoints = userDoc.exists() ? (userDoc.data().points || 0) : 0;
      const newPoints = currentPoints + amount;

      if (newPoints < 0) throw new Error('Insufficient balance');

      transaction.update(userRef, { points: newPoints });

      // Save transaction
      const transactionData: FirestoreTransaction = {
        type,
        amount,
        description,
        timestamp: serverTimestamp(),
        ...(extras.gameId && { gameId: extras.gameId }),
        ...(extras.referralId && { referralId: extras.referralId }),
      };

      const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
      transaction.set(doc(transactionsRef), transactionData);
    });
  }

  // Helper function to add transaction to Firestore
  async function addTransactionToFirestore(transactionData: any) {
    if (!currentUser) throw new Error('User not authenticated');

    const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
    await setDoc(doc(transactionsRef), {
      ...transactionData,
      timestamp: serverTimestamp(),
    });
  }

  //
  // --- Context Value ---
  //
  const value: WalletContextType = {
    balance,
    transactions,
    updateBalance,
    loading,
    error,
    loadMoreTransactions,
    isOnline,
    pendingSyncCount,
    syncPendingData,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
