// src/components/ReferralDashboard.jsx
import { useState } from 'react';
import { useReferralCode, useReferralStats, useReferralLeaderboard } from '../../hooks/useGameSystem';
import { Copy, Share2, Users, TrendingUp, Gift, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const ReferralDashboard = () => {
  const { referralCode, loading: codeLoading } = useReferralCode();
  const { stats, referrals, loading: statsLoading } = useReferralStats();
  const { leaderboard, userRank, loading: leaderboardLoading } = useReferralLeaderboard('all_time', 10);
  
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'referrals', 'leaderboard'

  const referralLink = referralCode 
    ? `${window.location.origin}/register?ref=${referralCode.referral_code}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join WaBoss!',
          text: `Gabung WaBoss dan hasilkan uang dari WhatsApp kamu! Gunakan kode referral saya: ${referralCode.referral_code}`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  if (codeLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191e45] border border-green-600/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Referrals</p>
              <p className="text-3xl font-bold text-green-500 mt-1">
                {stats?.total_referrals || 0}
              </p>
            </div>
            <Users className="text-green-500 w-10 h-10 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#191e45] border border-blue-600/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Qualified</p>
              <p className="text-3xl font-bold text-blue-500 mt-1">
                {stats?.qualified_referrals || 0}
              </p>
            </div>
            <TrendingUp className="text-blue-500 w-10 h-10 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#191e45] border border-yellow-600/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(stats?.lifetime_referral_cash || 0)}
              </p>
            </div>
            <Gift className="text-yellow-500 w-10 h-10 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#191e45] border border-purple-600/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Your Rank</p>
              <p className="text-3xl font-bold text-purple-500 mt-1">
                #{userRank || '--'}
              </p>
            </div>
            <Trophy className="text-purple-500 w-10 h-10 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Referral Link Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-600/50 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-6 h-6" />
          Your Referral Link
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 bg-[#10122b] rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">Referral Code</p>
            <p className="text-2xl font-mono font-bold text-green-400">
              {referralCode?.referral_code || 'Loading...'}
            </p>
          </div>

          <div className="flex-1 bg-[#10122b] rounded-lg p-3 border border-gray-700 overflow-hidden">
            <p className="text-gray-400 text-xs mb-1">Referral Link</p>
            <p className="text-sm text-gray-300 truncate font-mono">
              {referralLink}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
          >
            <Copy className="w-5 h-5" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={shareReferral}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        <div className="mt-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm">
            💡 <strong>Pro tip:</strong> Share your link on social media, WhatsApp groups, or with friends to earn more rewards!
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition duration-300 ${
            activeTab === 'overview'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-6 py-3 font-semibold transition duration-300 ${
            activeTab === 'referrals'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Referrals ({referrals?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 font-semibold transition duration-300 ${
            activeTab === 'leaderboard'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Rewards Tiers */}
            <div className="bg-[#191e45] border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Referral Rewards</h3>
              <div className="space-y-3">
                <RewardTier
                  icon="👤"
                  title="Sign Up Bonus"
                  description="When your friend signs up"
                  yourReward="Rp5.000 + 100 XP"
                  theirReward="Rp5.000 + 50 XP"
                />
                <RewardTier
                  icon="🔗"
                  title="First Link Bonus"
                  description="When they link their first WhatsApp"
                  yourReward="Rp20.000 + 500 XP"
                  theirReward="Rp10.000 + 100 XP"
                />
                <RewardTier
                  icon="💰"
                  title="Earnings Milestone"
                  description="When they earn Rp50.000"
                  yourReward="Rp50.000 + 1000 XP"
                  theirReward="Rp25.000 + 200 XP"
                />
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-[#191e45] border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
              <div className="space-y-4">
                <Step number="1" text="Share your unique referral link or code with friends" />
                <Step number="2" text="They sign up using your link and get bonus rewards" />
                <Step number="3" text="You earn rewards when they complete milestones" />
                <Step number="4" text="Both of you benefit from the partnership!" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="bg-[#191e45] border border-gray-800 rounded-xl overflow-hidden">
            {referrals && referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#10122b]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Your Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {referrals.map((referral, index) => (
                      <tr key={index} className="hover:bg-[#10122b] transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                {referral.referred_username?.[0]?.toUpperCase() || '?'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {referral.referred_username || 'User'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {referral.referred_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            referral.status === 'qualified'
                              ? 'bg-green-900/50 text-green-400'
                              : referral.status === 'completed'
                              ? 'bg-blue-900/50 text-blue-400'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(referral.referred_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(referral.referrer_cash_earned || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">No referrals yet</p>
                <p className="text-gray-500 text-sm">
                  Start sharing your referral link to earn rewards!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-[#191e45] border border-gray-800 rounded-xl overflow-hidden">
            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#10122b]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Referrals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Earned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {leaderboard.map((user, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-[#10122b] transition ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && (
                              <span className="text-gray-400 font-mono">
                                #{user.rank || index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.rank_title || 'Rookie'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.qualified_referrals || 0} / {user.total_referrals || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(user.lifetime_referral_cash || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No leaderboard data yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const RewardTier = ({ icon, title, description, yourReward, theirReward }) => (
  <div className="flex items-start gap-4 p-4 bg-[#10122b] rounded-lg border border-gray-800">
    <div className="text-3xl">{icon}</div>
    <div className="flex-1">
      <h4 className="text-white font-semibold">{title}</h4>
      <p className="text-gray-400 text-sm mb-2">{description}</p>
      <div className="flex gap-4 text-xs">
        <div>
          <span className="text-green-400 font-semibold">You get:</span>
          <span className="text-gray-300 ml-1">{yourReward}</span>
        </div>
        <div>
          <span className="text-blue-400 font-semibold">They get:</span>
          <span className="text-gray-300 ml-1">{theirReward}</span>
        </div>
      </div>
    </div>
  </div>
);

const Step = ({ number, text }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
      {number}
    </div>
    <p className="text-gray-300 pt-1">{text}</p>
  </div>
);

export default ReferralDashboard;