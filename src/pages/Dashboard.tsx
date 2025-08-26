import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Zap, 
  TrendingUp, 
  Gamepad2, 
  Users, 
  Wallet, 
  Star,
  ArrowUpRight,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useRewards } from '../contexts/RewardsContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { balance, transactions } = useWallet();
  const { level, experience, experienceToNext, gameStats } = useRewards();

  const progressPercentage = (experience / experienceToNext) * 100;

  const recentTransactions = transactions.slice(0, 5);

  const quickActions = [
    {
      title: 'Play Games',
      description: 'Earn points by playing',
      icon: Gamepad2,
      color: 'from-crypto-purple to-purple-500',
      link: '/games'
    },
    {
      title: 'Invite Friends',
      description: 'Earn referral bonuses',
      icon: Users,
      color: 'from-crypto-neon to-green-500',
      link: '/referrals'
    },
    {
      title: 'View Wallet',
      description: 'Check your balance',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      link: '/wallet'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {currentUser?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your DulpPoints account
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card neon-glow"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-3xl font-bold text-crypto-neon">
                  {balance.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">DulpPoints</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-neon to-green-400 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-gray-400 text-sm">Current Level</p>
                <p className="text-3xl font-bold text-crypto-gold">
                  {level}
                </p>
                <p className="text-gray-400 text-sm">Level {level}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-gold to-yellow-400 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Games Played Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-gray-400 text-sm">Games Played</p>
                <p className="text-3xl font-bold text-crypto-purple">
                  {gameStats.gamesPlayed}
                </p>
                <p className="text-gray-400 text-sm">Total Games</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-purple to-purple-400 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Best Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-gray-400 text-sm">Best Score</p>
                <p className="text-3xl font-bold text-crypto-neon">
                  {gameStats.bestScore}
                </p>
                <p className="text-gray-400 text-sm">High Score</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-neon to-green-400 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Experience & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="card"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-crypto-gold" />
                Level Progress
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Level {level}</span>
                  <span>{experience} / {experienceToNext} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="bg-gradient-to-r from-crypto-gold to-yellow-400 h-3 rounded-full transition-all duration-300"
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {experienceToNext - experience} XP needed for next level
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="card"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.title}
                    href={action.link}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                    className="group p-4 rounded-lg border border-gray-600 hover:border-crypto-neon transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="card"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-crypto-purple" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'earn' ? 'bg-green-500/20' :
                        transaction.type === 'spend' ? 'bg-red-500/20' :
                        transaction.type === 'referral' ? 'bg-blue-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        {transaction.type === 'earn' && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {transaction.type === 'spend' && <ArrowUpRight className="w-4 h-4 text-red-400" />}
                        {transaction.type === 'referral' && <Users className="w-4 h-4 text-blue-400" />}
                        {transaction.type === 'bonus' && <Star className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-xs">
                          {transaction.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No recent activity</p>
                  <p className="text-gray-500 text-sm">Start playing games to see your activity here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;