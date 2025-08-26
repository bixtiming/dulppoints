import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  Star,
  UserPlus,
  Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// import { useWallet } from '../contexts/WalletContext';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referralCode: string;
}

interface Referral {
  id: string;
  username: string;
  email: string;
  joinedAt: Date;
  status: 'pending' | 'active' | 'inactive';
  earnings: number;
}

const Referrals: React.FC = () => {
  const { currentUser } = useAuth();
  // Wallet actions not used on this page currently
  // const { addTransaction } = useWallet();
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    referralCode: ''
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadReferralData();
    }
  }, [currentUser]);

  const loadReferralData = async () => {
    try {
      const userRef = doc(db, 'users', currentUser!.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setReferralStats({
          totalReferrals: userData.referralsCount || 0,
          activeReferrals: userData.activeReferrals || 0,
          totalEarnings: userData.referralEarnings || 0,
          referralCode: userData.referralCode || ''
        });
      }

      // Load referrals list
      const referralsRef = collection(db, 'users', currentUser!.uid, 'referrals');
      const referralsQuery = query(referralsRef);
      const referralsSnapshot = await getDocs(referralsQuery);
      
      const referralsList: Referral[] = [];
      referralsSnapshot.forEach((doc) => {
        const data = doc.data();
        referralsList.push({
          id: doc.id,
          username: data.username,
          email: data.email,
          joinedAt: data.joinedAt.toDate(),
          status: data.status || 'pending',
          earnings: data.earnings || 0
        });
      });
      
      setReferrals(referralsList);
    } catch (error) {
      // Silent fail for referral data loading
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralStats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silent fail for clipboard copy
    }
  };

  const shareReferral = async () => {
    const shareText = `Join DulpPoints using my referral code: ${referralStats.referralCode}\n\nEarn crypto rewards by playing games and referring friends!\n\nSign up at: ${window.location.origin}/register?ref=${referralStats.referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join DulpPoints',
          text: shareText,
          url: `${window.location.origin}/register?ref=${referralStats.referralCode}`
        });
          } catch (error) {
      // Silent fail for sharing
    }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
          } catch (error) {
      // Silent fail for clipboard copy
    }
    }
  };

  const referralRewards = [
    {
      level: 'Bronze',
      referrals: '1-15',
      bonus: '10%',
      color: 'from-crypto-bronze to-yellow-600'
    },
    {
      level: 'Silver',
      referrals: '15-50',
      bonus: '15%',
      color: 'from-crypto-silver to-gray-400'
    },
    {
      level: 'Gold',
      referrals: '50-100',
      bonus: '20%',
      color: 'from-crypto-gold to-yellow-400'
    },
    {
      level: 'Diamond',
      referrals: '100+',
      bonus: '25%',
      color: 'from-crypto-purple to-blue-400'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crypto-neon"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Referral <span className="text-crypto-neon">Program</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-2 sm:px-0">
            Invite friends to DulpPoints and earn bonus rewards for every successful referral!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card neon-glow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-neon to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-crypto-neon mb-2">
                {referralStats.totalReferrals}
              </div>
              <div className="text-gray-400">Total Referrals</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-purple to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-crypto-purple mb-2">
                {referralStats.activeReferrals}
              </div>
              <div className="text-gray-400">Active Referrals</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-crypto-gold mb-2">
                {referralStats.totalEarnings}
              </div>
              <div className="text-gray-400">Total Earnings</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-crypto-purple to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-crypto-purple mb-2">
                {referralStats.totalReferrals >= 31 ? 'Diamond' :
                 referralStats.totalReferrals >= 16 ? 'Gold' :
                 referralStats.totalReferrals >= 6 ? 'Silver' : 'Bronze'}
              </div>
              <div className="text-gray-400">Your Tier</div>
            </div>
          </motion.div>
        </div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="card mb-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            Your Referral Code
          </h3>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3">
                <code className="text-xl font-mono text-crypto-neon">
                  {referralStats.referralCode}
                </code>
              </div>
              <button
                onClick={copyReferralCode}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={shareReferral}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Referral Link</span>
            </button>
          </div>
        </motion.div>

        {/* Referral Rewards Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="card mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Referral Reward Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {referralRewards.map((tier, index) => (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  (tier.level === 'Bronze' && referralStats.totalReferrals >= 1) ||
                  (tier.level === 'Silver' && referralStats.totalReferrals >= 6) ||
                  (tier.level === 'Gold' && referralStats.totalReferrals >= 16) ||
                  (tier.level === 'Diamond' && referralStats.totalReferrals >= 31)
                    ? 'border-crypto-neon bg-crypto-neon/10'
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white text-center mb-2">{tier.level}</h4>
                <div className="text-center space-y-1">
                  <p className="text-gray-400 text-sm">{tier.referrals} referrals</p>
                  <p className="text-crypto-neon font-semibold">{tier.bonus} bonus</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Referrals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="card"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Your Referrals
          </h3>
          {referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      referral.status === 'active' ? 'bg-green-500/20' :
                      referral.status === 'pending' ? 'bg-yellow-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{referral.username}</p>
                      <p className="text-gray-400 text-sm break-all sm:break-normal">{referral.email}</p>
                      <p className="text-gray-500 text-xs">
                        Joined {referral.joinedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:self-start">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      referral.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {referral.status}
                    </div>
                    <div className="text-crypto-neon font-semibold mt-1">
                      +{referral.earnings} pts
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No referrals yet</p>
              <p className="text-gray-500">Share your referral code to start earning bonuses!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Referrals;