// hooks/useGameSystem.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useGameSystem = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetchProfile: fetchProfile,
  };
};

// ============================================
// ACHIEVEMENTS HOOK
// ============================================
export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, claimed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/achievements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAchievements(res.data.all);
      setStats(res.data.stats);
      setError(null);
    } catch (err) {
      console.error('Fetch achievements error:', err);
      setError(err.response?.data?.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockAchievement = async (achievementKey) => {
    try {
      const token = getToken();
      if (!token) return { success: false };

      const res = await axios.post(
        `${API_URL}/game/achievements/check/${achievementKey}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.unlocked && !res.data.already_unlocked) {
        await fetchAchievements();
        return {
          success: true,
          achievement: res.data.achievement,
          rewards: res.data.rewards,
        };
      }

      return { success: false, already_unlocked: res.data.already_unlocked };
    } catch (err) {
      console.error('Unlock achievement error:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    stats,
    loading,
    error,
    unlockAchievement,
    refetchAchievements: fetchAchievements,
  };
};

// ============================================
// MISSIONS HOOK
// ============================================
export const useMissions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/missions/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMissions(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch missions error:', err);
      setError(err.response?.data?.message || 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, []);

  const startMission = async (missionId) => {
    try {
      const token = getToken();
      if (!token) return { success: false };

      const res = await axios.post(
        `${API_URL}/game/missions/${missionId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchMissions();
      return { success: true, mission: res.data.mission };
    } catch (err) {
      console.error('Start mission error:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateProgress = async (userMissionId, increment = 1) => {
    try {
      const token = getToken();
      if (!token) return { success: false };

      const res = await axios.post(
        `${API_URL}/game/missions/${userMissionId}/progress`,
        { increment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.completed) {
        await fetchMissions();
      }

      return {
        success: true,
        completed: res.data.completed,
        progress: res.data.current_progress,
      };
    } catch (err) {
      console.error('Update mission progress error:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  const claimRewards = async (userMissionId) => {
    try {
      const token = getToken();
      if (!token) return { success: false };

      const res = await axios.post(
        `${API_URL}/game/missions/${userMissionId}/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchMissions();
      return {
        success: true,
        rewards: res.data.rewards,
      };
    } catch (err) {
      console.error('Claim mission rewards error:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    startMission,
    updateProgress,
    claimRewards,
    refetchMissions: fetchMissions,
  };
};

// ============================================
// LEADERBOARD HOOK
// ============================================
export const useLeaderboard = (type = 'level', limit = 50) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/leaderboard`, {
        params: { type, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeaderboard(res.data.leaderboard);
      setUserRank(res.data.user_rank);
      setError(null);
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    userRank,
    loading,
    error,
    refetchLeaderboard: fetchLeaderboard,
  };
};

// ============================================
// DAILY CHECK-IN HOOK
// ============================================
export const useDailyCheckIn = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const checkIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) return { success: false };

      const res = await axios.post(
        `${API_URL}/game/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.already_checked_in) {
        setHasCheckedIn(true);
        return { success: false, already_checked_in: true };
      }

      setHasCheckedIn(true);
      setStreak(res.data.new_streak);

      return {
        success: true,
        streak: res.data.new_streak,
        xp_earned: res.data.xp_earned,
        streak_bonus: res.data.streak_bonus,
      };
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.message || 'Check-in failed');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    hasCheckedIn,
    streak,
    loading,
    error,
    checkIn,
  };
};

// ============================================
// XP & POINTS HISTORY HOOK
// ============================================
export const useTransactionHistory = (type = 'xp') => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const endpoint = type === 'xp' ? '/game/xp/history' : '/game/points/history';

      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetchHistory: fetchHistory,
  };
};

// ============================================
// COMPREHENSIVE GAME STATS HOOK
// ============================================
export const useGameStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch stats error:', err);
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetchStats: fetchStats,
  };
};

// ============================================
// REFERRAL SYSTEM HOOKS
// ============================================

// Get user's referral code and basic info
export const useReferralCode = () => {
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchReferralCode = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/referral/code`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReferralCode(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch referral code error:', err);
      setError(err.response?.data?.message || 'Failed to load referral code');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralCode();
  }, [fetchReferralCode]);

  return {
    referralCode,
    loading,
    error,
    refetchCode: fetchReferralCode,
  };
};

// Get referral stats and list
export const useReferralStats = () => {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/referral/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(res.data.stats);
      setReferrals(res.data.referrals);
      setError(null);
    } catch (err) {
      console.error('Fetch referral stats error:', err);
      setError(err.response?.data?.message || 'Failed to load referral stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    referrals,
    loading,
    error,
    refetchStats: fetchStats,
  };
};

// Validate and apply referral codes
export const useReferralActions = () => {
  const [validating, setValidating] = useState(false);
  const [applying, setApplying] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const validateCode = async (code) => {
    try {
      setValidating(true);
      const res = await axios.post(`${API_URL}/game/referral/validate`, {
        referral_code: code,
      });

      return {
        success: res.data.valid,
        message: res.data.message,
        referrer: res.data.referrer_username,
      };
    } catch (err) {
      console.error('Validate referral code error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to validate code',
      };
    } finally {
      setValidating(false);
    }
  };

  const applyCode = async (code) => {
    try {
      setApplying(true);
      const token = getToken();
      if (!token) return { success: false, message: 'Not authenticated' };

      const res = await axios.post(
        `${API_URL}/game/referral/apply`,
        { referral_code: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        success: true,
        message: res.data.message,
      };
    } catch (err) {
      console.error('Apply referral code error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to apply code',
      };
    } finally {
      setApplying(false);
    }
  };

  const triggerMilestone = async (milestoneType, milestoneValue = null) => {
    try {
      const token = getToken();
      if (!token) return { success: false };

      const res = await axios.post(
        `${API_URL}/game/referral/milestone`,
        {
          milestone_type: milestoneType,
          milestone_value: milestoneValue,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        success: res.data.success,
        reward_triggered: res.data.reward_triggered,
        reward_key: res.data.reward_key,
      };
    } catch (err) {
      console.error('Trigger referral milestone error:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  return {
    validateCode,
    applyCode,
    triggerMilestone,
    validating,
    applying,
  };
};

// Referral leaderboard
export const useReferralLeaderboard = (period = 'all_time', limit = 50) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/game/referral/leaderboard`, {
        params: { period, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeaderboard(res.data.leaderboard || res.data);
      setUserRank(res.data.user_rank || null);
      setError(null);
    } catch (err) {
      console.error('Fetch referral leaderboard error:', err);
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    userRank,
    loading,
    error,
    refetchLeaderboard: fetchLeaderboard,
  };
};