import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Users,
  Gamepad2,
  Gift
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const Wallet: React.FC = () => {
  const { balance, transactions, updateBalance } = useWallet();
  const [filterType, setFilterType] = useState<'all' | 'earn' | 'spend' | 'referral' | 'bonus'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);



  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'spend':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'referral':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-yellow-400" />;
      default:
        return <Zap className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'bg-green-500/20 border-green-500/30';
      case 'spend':
        return 'bg-red-500/20 border-red-500/30';
      case 'referral':
        return 'bg-blue-500/20 border-blue-500/30';
      case 'bonus':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      'Date,Type,Description,Amount',
      ...filteredTransactions.map(t => 
        `${t.timestamp.toLocaleDateString()},${t.type},${t.description},${t.amount}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dulppoints-transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your <span className="text-crypto-neon">Wallet</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your DulpPoints, track transactions, and monitor your earnings
          </p>
        </motion.div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card neon-glow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-neon to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-crypto-neon mb-2">
                {balance.toLocaleString()}
              </div>
              <div className="text-gray-400">Current Balance</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {totalEarned.toLocaleString()}
              </div>
              <div className="text-gray-400">Total Earned</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2">
                {totalSpent.toLocaleString()}
              </div>
              <div className="text-gray-400">Total Spent</div>
            </div>
          </motion.div>
        </div>



        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="card"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 md:mb-0">
              Transaction History
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-crypto-neon focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-crypto-neon focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="earn">Earnings</option>
                <option value="spend">Spending</option>
                <option value="referral">Referrals</option>
                <option value="bonus">Bonuses</option>
              </select>

              {/* Export */}
              <button
                onClick={exportTransactions}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.05 }}
                  className={`p-4 rounded-lg border ${getTransactionColor(transaction.type)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/50">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium truncate max-w-[70vw] sm:max-w-none">{transaction.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{transaction.timestamp.toLocaleDateString()}</span>
                          </span>
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:self-start">
                      <div className={`text-lg font-bold flex items-center space-x-1 ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</span>
                      </div>
                      <div className="text-gray-400 text-sm">DulpPoints</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WalletIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg mb-2">No transactions found</p>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start playing games and referring friends to see transactions here'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {filteredTransactions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="card mt-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-gray-600 hover:border-crypto-neon transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-crypto-neon to-green-400 rounded-lg flex items-center justify-center mb-3">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-1">Play Games</h4>
              <p className="text-gray-400 text-sm">Earn more points by playing</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-600 hover:border-crypto-neon transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-crypto-purple to-purple-400 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-1">Invite Friends</h4>
              <p className="text-gray-400 text-sm">Earn referral bonuses</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-600 hover:border-crypto-neon transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-crypto-gold to-yellow-400 rounded-lg flex items-center justify-center mb-3">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-1">View Achievements</h4>
              <p className="text-gray-400 text-sm">Unlock bonus rewards</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Wallet;