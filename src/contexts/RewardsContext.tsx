import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  pointsReward: number;
}

interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  lastPlayed?: Date;
}

interface RewardsContextType {
  level: number;
  experience: number;
  experienceToNext: number;
  achievements: Achievement[];
  gameStats: GameStats;
  addExperience: (amount: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateGameStats: (score: number) => Promise<void>;
  loading: boolean;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { updateBalance } = useWallet();
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [experienceToNext, setExperienceToNext] = useState(100);
  const [achievements] = useState<Achievement[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0
  });
  const [loading, setLoading] = useState(true);

  // Calculate experience needed for next level
  const calculateExperienceToNext = (currentLevel: number) => {
    return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
  };

  // Check for level up
  const checkLevelUp = async (newExperience: number, currentLevel: number) => {
    const expNeeded = calculateExperienceToNext(currentLevel);
    if (newExperience >= expNeeded) {
      const newLevel = currentLevel + 1;
      setLevel(newLevel);
      setExperienceToNext(calculateExperienceToNext(newLevel));
      
      // Add level up bonus
      const bonus = newLevel * 50;
      await updateBalance(bonus, `Level ${newLevel} Bonus!`, 'bonus');

      // Update user document
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          level: newLevel,
          experience: newExperience - expNeeded
        });
      }
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLevel(data.level || 1);
        setExperience(data.experience || 0);
        setExperienceToNext(calculateExperienceToNext(data.level || 1));
        setGameStats({
          gamesPlayed: data.gamesPlayed || 0,
          totalScore: data.totalScore || 0,
          averageScore: data.averageScore || 0,
          bestScore: data.bestScore || 0,
          lastPlayed: data.lastPlayed?.toDate()
        });
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  async function addExperience(amount: number) {
    if (!currentUser) return;

    const newExperience = experience + amount;
    setExperience(newExperience);
    
    // Check for level up
    await checkLevelUp(newExperience, level);

    // Update user document
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      experience: newExperience
    });
  }

  async function unlockAchievement(achievementId: string) {
    if (!currentUser) return;

    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      // Add achievement reward
      await updateBalance(achievement.pointsReward, `Achievement: ${achievement.name}`, 'bonus');

      // Update achievement
      const achievementRef = doc(db, 'users', currentUser.uid, 'achievements', achievementId);
      await updateDoc(achievementRef, {
        unlocked: true,
        unlockedAt: new Date()
      });
    }
  }

  async function updateGameStats(score: number) {
    if (!currentUser) return;

    const newStats = {
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalScore: gameStats.totalScore + score,
      averageScore: Math.round((gameStats.totalScore + score) / (gameStats.gamesPlayed + 1)),
      bestScore: Math.max(gameStats.bestScore, score),
      lastPlayed: new Date()
    };

    setGameStats(newStats);

    // Update user document
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, newStats);
  }

  const value = {
    level,
    experience,
    experienceToNext,
    achievements,
    gameStats,
    addExperience,
    unlockAchievement,
    updateGameStats,
    loading
  };

  return (
    <RewardsContext.Provider value={value}>
      {children}
    </RewardsContext.Provider>
  );
}