import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Gift, 
  Coins, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface RewardTask {
  id: string;
  name: string;
  description: string;
  reward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  icon: string;
  color: string;
}

interface Unlockable {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  icon: string;
  color: string;
}

const GamePlay: React.FC = () => {
  const { 
    balance, 
    updateBalance, 
    error: walletError, 
    isOnline, 
    pendingSyncCount,
    syncPendingData 
  } = useWallet();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [lastDailyClaim, setLastDailyClaim] = useState<Date | null>(null);
  const [canClaimDaily, setCanClaimDaily] = useState(false);

  const [rewardTasks] = useState<RewardTask[]>([
    {
      id: 'complete-tutorial',
      name: 'Complete Tutorial',
      description: 'Finish the game tutorial',
      reward: 50,
      difficulty: 'Easy',
      completed: false,
      icon: '📚',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'first-win',
      name: 'First Victory',
      description: 'Win your first game',
      reward: 100,
      difficulty: 'Medium',
      completed: false,
      icon: '🏆',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'streak-3',
      name: '3-Game Streak',
      description: 'Win 3 games in a row',
      reward: 150,
      difficulty: 'Hard',
      completed: false,
      icon: '🔥',
      color: 'from-red-400 to-pink-500'
    }
  ]);

  const [unlockables] = useState<Unlockable[]>([
    {
      id: 'premium-avatar',
      name: 'Premium Avatar',
      description: 'Exclusive character skin',
      cost: 200,
      unlocked: false,
      icon: '👤',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'bonus-multiplier',
      name: '2x Reward Multiplier',
      description: 'Double your earnings for 1 hour',
      cost: 300,
      unlocked: false,
      icon: '⚡',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      id: 'extra-lives',
      name: 'Extra Lives Pack',
      description: 'Get 3 extra lives',
      cost: 150,
      unlocked: false,
      icon: '❤️',
      color: 'from-red-400 to-rose-500'
    }
  ]);

  // Check daily login eligibility
  useEffect(() => {
    const checkDailyLogin = () => {
      const lastClaim = localStorage.getItem('lastDailyClaim');
      if (lastClaim) {
        const lastClaimDate = new Date(lastClaim);
        const now = new Date();
        const timeDiff = now.getTime() - lastClaimDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Can claim if 24 hours have passed
        setCanClaimDaily(hoursDiff >= 24);
        setLastDailyClaim(lastClaimDate);
      } else {
        setCanClaimDaily(true);
      }
    };

    checkDailyLogin();
    // Check every minute
    const interval = setInterval(checkDailyLogin, 60000);
    return () => clearInterval(interval);
  }, []);

  // Display wallet errors when they occur
  useEffect(() => {
    if (walletError) {
      showMessage(walletError, 'error');
    }
  }, [walletError]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDailyLogin = async () => {
    if (!canClaimDaily) {
      showMessage('Daily login already claimed! Come back tomorrow.', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      await updateBalance(25, 'Daily Login Bonus', 'earn');
      
      // Mark as claimed
      localStorage.setItem('lastDailyClaim', new Date().toISOString());
      setLastDailyClaim(new Date());
      setCanClaimDaily(false);
      
      showMessage('Daily login bonus claimed! +25 points', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim daily bonus. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEarnReward = async (task: RewardTask) => {
    if (task.completed) {
      showMessage('Task already completed!', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      await updateBalance(task.reward, `Task completed: ${task.name}`, 'earn');
      
      // Mark task as completed
      task.completed = true;
      showMessage(`Earned ${task.reward} points!`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to earn reward. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSpendReward = async (item: Unlockable) => {
    if (item.unlocked) {
      showMessage('Item already unlocked!', 'error');
      return;
    }

    if (balance < item.cost) {
      showMessage('Insufficient balance!', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      await updateBalance(-item.cost, `Unlocked: ${item.name}`, 'spend');
      
      // Mark item as unlocked
      item.unlocked = true;
      showMessage(`Successfully unlocked ${item.name}!`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock item. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setIsUpdating(false);
    }
  };



  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Reward <span className="text-crypto-neon">GamePlay</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            Complete tasks, earn rewards, and unlock exclusive items
          </p>
          
          {/* Balance Display */}
          <div className="inline-flex items-center space-x-3 bg-crypto-dark/50 px-6 py-4 rounded-xl border border-crypto-neon/30">
            <Zap className="w-8 h-8 text-crypto-neon" />
            <div>
              <p className="text-gray-400 text-sm">Current Balance</p>
              <p className="text-3xl font-bold text-crypto-neon">{balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Sync Status */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {pendingSyncCount > 0 && (
              <button
                onClick={syncPendingData}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                <span className="text-sm font-medium">
                  {pendingSyncCount} pending sync
                </span>
                <span className="text-xs">(Click to sync)</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            } text-center`}
          >
            <div className="flex items-center justify-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* Quick Game Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Quick Reward
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDailyLogin}
              disabled={isUpdating || !canClaimDaily}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                canClaimDaily
                  ? 'bg-crypto-neon/20 text-crypto-neon hover:bg-crypto-neon/30 hover:scale-105'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>
                {canClaimDaily ? 'Daily Login (+25)' : 'Daily Login Claimed'}
              </span>
            </button>
            {lastDailyClaim && !canClaimDaily && (
              <div className="text-center text-gray-400 text-sm">
                Next claim available: {new Date(lastDailyClaim.getTime() + 24 * 60 * 60 * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Reward Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="card"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-crypto-gold" />
              Earn Rewards
            </h3>
            <div className="space-y-4">
              {rewardTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    task.completed 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-gray-600 hover:border-crypto-neon/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${task.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {task.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{task.name}</h4>
                        <p className="text-gray-400 text-sm">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            task.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {task.difficulty}
                          </span>
                          <span className="text-crypto-neon font-semibold">+{task.reward} pts</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEarnReward(task)}
                      disabled={isUpdating || task.completed}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        task.completed
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : 'bg-crypto-neon/20 text-crypto-neon hover:bg-crypto-neon/30 hover:scale-105'
                      }`}
                    >
                      {task.completed ? 'Completed' : 'Claim'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Unlockables */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="card"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Gift className="w-6 h-6 mr-3 text-crypto-purple" />
              Unlock Items
            </h3>
            <div className="space-y-4">
              {unlockables.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    item.unlocked 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-gray-600 hover:border-crypto-purple/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-crypto-purple font-semibold">{item.cost} pts</span>
                          {item.unlocked && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                              Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSpendReward(item)}
                      disabled={isUpdating || item.unlocked || balance < item.cost}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        item.unlocked
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : balance < item.cost
                          ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                          : 'bg-crypto-purple/20 text-crypto-purple hover:bg-crypto-purple/30 hover:scale-105'
                      }`}
                    >
                      {item.unlocked ? 'Unlocked' : balance < item.cost ? 'Insufficient' : 'Unlock'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="card mt-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Game Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-crypto-neon to-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-crypto-neon mb-1">
                {rewardTasks.filter(t => t.completed).length}
              </div>
              <div className="text-gray-400">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-crypto-purple to-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-crypto-purple mb-1">
                {unlockables.filter(i => i.unlocked).length}
              </div>
              <div className="text-gray-400">Items Unlocked</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-crypto-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-crypto-gold mb-1">
                {rewardTasks.filter(t => t.completed).reduce((sum, t) => sum + t.reward, 0)}
              </div>
              <div className="text-gray-400">Total Earned</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GamePlay;
