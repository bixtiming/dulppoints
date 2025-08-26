import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
  let inactivityTimer: number | undefined;

  async function register(email: string, password: string, username: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      username,
      email,
      createdAt: new Date(),
      points: 0,
      level: 1,
      referralCode: generateReferralCode(),
      referredBy: null,
      totalEarnings: 0,
      gamesPlayed: 0,
      referralsCount: 0
    });
  }

  function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    // Ensure auth state persists across reloads
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Ensure user profile exists to support wallet updates
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then((snapshot) => {
          if (!snapshot.exists()) {
            setDoc(userRef, {
              email: user.email ?? '',
              createdAt: serverTimestamp(),
              points: 0,
              level: 1,
              experience: 0,
              referralCode: generateReferralCode(),
              referredBy: null,
              totalEarnings: 0,
              gamesPlayed: 0,
              referralsCount: 0
            }, { merge: true });
          }
        }).catch((error) => {
          // Silent fail for user profile creation
        }).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Inactivity auto-logout
  useEffect(() => {
    if (!currentUser) return;

    const resetTimer = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        signOut(auth).catch(() => {});
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      events.forEach((e) => window.removeEventListener(e, resetTimer as EventListener));
    };
  }, [currentUser]);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}