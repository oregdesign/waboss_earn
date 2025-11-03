// waboss-backend/src/routes/game.js
const express = require('express');
const { pool: db } = require('../db/database');
const router = express.Router();

// ============================================
// MIDDLEWARE - JWT Verification
// ============================================
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ============================================
// USER PROFILE & STATS
// ============================================

// Get user's complete game profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        up.*,
        r.rank_name,
        r.rank_tier,
        r.rank_color,
        r.rank_icon,
        (SELECT xp_to_next FROM level_config WHERE level = up.level + 1) as xp_to_next_level,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = up.user_id AND is_claimed = true) as badges_unlocked,
        (SELECT COUNT(*) FROM achievements WHERE is_active = true) as total_badges
      FROM user_profiles up
      LEFT JOIN ranks r ON up.rank_id = r.id
      WHERE up.user_id = $1
    `, [req.userId]);

    if (rows.length === 0) {
      // Create initial profile if doesn't exist
      await db.query(`
        INSERT INTO user_profiles (user_id, level, current_xp, total_xp, rank_title)
        VALUES ($1, 1, 0, 0, 'Rookie')
      `, [req.userId]);

      return res.json({
        user_id: req.userId,
        level: 1,
        current_xp: 0,
        total_xp: 0,
        total_points: 0,
        available_points: 0,
        rank_title: 'Rookie',
        rank_tier: 1,
        current_streak: 0,
        xp_to_next_level: 100,
        badges_unlocked: 0,
        total_badges: 0
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's dashboard stats summary
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        up.level,
        up.current_xp,
        up.total_points,
        up.available_points,
        up.current_streak,
        up.rank_title,
        up.total_missions_completed,
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = $1 AND is_claimed = true) as achievements_unlocked,
        (SELECT COUNT(*) FROM user_missions WHERE user_id = $1 AND status = 'active') as active_missions
      FROM user_profiles up
      WHERE up.user_id = $1
    `, [req.userId]);

    res.json(rows[0] || {
      level: 1,
      current_xp: 0,
      total_points: 0,
      available_points: 0,
      current_streak: 0,
      rank_title: 'Rookie',
      total_missions_completed: 0,
      achievements_unlocked: 0,
      active_missions: 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// XP & LEVELING SYSTEM
// ============================================

// Add XP to user (internal use or admin)
router.post('/xp/add', verifyToken, async (req, res) => {
  const { amount, source_type, source_id, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid XP amount' });
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM add_xp_to_user($1, $2, $3, $4, $5)',
      [req.userId, amount, source_type || 'manual', source_id || null, description || 'XP added']
    );

    const result = rows[0];

    res.json({
      success: true,
      leveled_up: result.leveled_up,
      new_level: result.new_level,
      new_xp: result.new_xp,
      xp_gained: amount
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get XP history
router.get('/xp/history', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        amount,
        source_type,
        description,
        created_at
      FROM xp_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.userId]);

    res.json(rows);
  } catch (error) {
    console.error('Get XP history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// POINTS SYSTEM
// ============================================

// Add points to user
router.post('/points/add', verifyToken, async (req, res) => {
  const { amount, source_type, source_id, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid points amount' });
  }

  try {
    await db.query('BEGIN');

    // Add points
    await db.query(`
      UPDATE user_profiles
      SET total_points = total_points + $1,
          available_points = available_points + $1,
          lifetime_points = lifetime_points + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [amount, req.userId]);

    // Log transaction
    await db.query(`
      INSERT INTO points_transactions (user_id, amount, transaction_type, source_type, source_id, description)
      VALUES ($1, $2, 'earned', $3, $4, $5)
    `, [req.userId, amount, source_type || 'manual', source_id || null, description || 'Points earned']);

    await db.query('COMMIT');

    res.json({
      success: true,
      points_gained: amount,
      message: 'Points added successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Add points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get points history
router.get('/points/history', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        amount,
        transaction_type,
        source_type,
        description,
        created_at
      FROM points_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.userId]);

    res.json(rows);
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================

// Get all achievements with user progress
router.get('/achievements', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        a.*,
        ua.unlocked_at,
        ua.is_claimed,
        ua.progress,
        CASE 
          WHEN ua.id IS NOT NULL THEN true 
          ELSE false 
        END as is_unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
      WHERE a.is_active = true AND (a.is_secret = false OR ua.id IS NOT NULL)
      ORDER BY a.badge_rarity DESC, a.achievement_category, a.id
    `, [req.userId]);

    // Group by category
    const grouped = rows.reduce((acc, achievement) => {
      const category = achievement.achievement_category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    }, {});

    res.json({
      all: rows,
      by_category: grouped,
      stats: {
        total: rows.length,
        unlocked: rows.filter(a => a.is_unlocked).length,
        claimed: rows.filter(a => a.is_claimed).length
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check and unlock achievement
router.post('/achievements/check/:achievementKey', verifyToken, async (req, res) => {
  const { achievementKey } = req.params;

  try {
    await db.query('BEGIN');

    // Get achievement details
    const { rows: achievements } = await db.query(
      'SELECT * FROM achievements WHERE achievement_key = $1 AND is_active = true',
      [achievementKey]
    );

    if (achievements.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Achievement not found' });
    }

    const achievement = achievements[0];

    // Check if already unlocked
    const { rows: existing } = await db.query(
      'SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
      [req.userId, achievement.id]
    );

    if (existing.length > 0) {
      await db.query('ROLLBACK');
      return res.json({
        already_unlocked: true,
        achievement: existing[0]
      });
    }

    // Unlock achievement
    await db.query(`
      INSERT INTO user_achievements (user_id, achievement_id, progress)
      VALUES ($1, $2, $3)
    `, [req.userId, achievement.id, achievement.requirement_value]);

    // Give rewards
    if (achievement.xp_reward > 0) {
      await db.query(
        'SELECT * FROM add_xp_to_user($1, $2, $3, $4, $5)',
        [req.userId, achievement.xp_reward, 'achievement', achievement.id, `Achievement: ${achievement.achievement_name}`]
      );
    }

    if (achievement.points_reward > 0) {
      await db.query(`
        UPDATE user_profiles
        SET total_points = total_points + $1,
            available_points = available_points + $1,
            lifetime_points = lifetime_points + $1,
            total_achievements_unlocked = total_achievements_unlocked + 1
        WHERE user_id = $2
      `, [achievement.points_reward, req.userId]);

      await db.query(`
        INSERT INTO points_transactions (user_id, amount, transaction_type, source_type, source_id, description)
        VALUES ($1, $2, 'earned', 'achievement', $3, $4)
      `, [req.userId, achievement.points_reward, achievement.id, `Achievement: ${achievement.achievement_name}`]);
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      unlocked: true,
      achievement: achievement,
      rewards: {
        xp: achievement.xp_reward,
        points: achievement.points_reward
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Check achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// MISSIONS SYSTEM
// ============================================

// Get available missions
router.get('/missions/available', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        m.*,
        um.id as user_mission_id,
        um.status as user_status,
        um.current_progress,
        CASE 
          WHEN um.id IS NOT NULL THEN true 
          ELSE false 
        END as is_started
      FROM missions m
      LEFT JOIN user_missions um ON m.id = um.mission_id 
        AND um.user_id = $1 
        AND um.status IN ('active', 'completed')
      WHERE m.is_active = true
        AND (m.end_date IS NULL OR m.end_date > CURRENT_TIMESTAMP)
      ORDER BY 
        CASE m.mission_type
          WHEN 'daily' THEN 1
          WHEN 'weekly' THEN 2
          WHEN 'special' THEN 3
          ELSE 4
        END,
        m.difficulty
    `, [req.userId]);

    res.json(rows);
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a mission
router.post('/missions/:missionId/start', verifyToken, async (req, res) => {
  const { missionId } = req.params;

  try {
    // Get mission details
    const { rows: missions } = await db.query(
      'SELECT * FROM missions WHERE id = $1 AND is_active = true',
      [missionId]
    );

    if (missions.length === 0) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    const mission = missions[0];

    // Check if already active
    const { rows: existing } = await db.query(
      'SELECT * FROM user_missions WHERE user_id = $1 AND mission_id = $2 AND status = $3',
      [req.userId, missionId, 'active']
    );

    if (existing.length > 0) {
      return res.json({
        already_started: true,
        mission: existing[0]
      });
    }

    // Start mission
    const { rows } = await db.query(`
      INSERT INTO user_missions (user_id, mission_id, target_progress, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      req.userId,
      missionId,
      mission.requirement_target,
      mission.mission_type === 'daily' ? 'NOW() + INTERVAL \'1 day\'' : null
    ]);

    res.json({
      success: true,
      mission: rows[0]
    });
  } catch (error) {
    console.error('Start mission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mission progress
router.post('/missions/:userMissionId/progress', verifyToken, async (req, res) => {
  const { userMissionId } = req.params;
  const { increment } = req.body;

  try {
    await db.query('BEGIN');

    // Get current mission
    const { rows: missions } = await db.query(`
      SELECT um.*, m.*
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.id = $1 AND um.user_id = $2 AND um.status = 'active'
    `, [userMissionId, req.userId]);

    if (missions.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Mission not found or not active' });
    }

    const mission = missions[0];
    const newProgress = mission.current_progress + (increment || 1);
    const completed = newProgress >= mission.target_progress;

    // Update progress
    await db.query(`
      UPDATE user_missions
      SET current_progress = $1,
          status = $2,
          completed_at = $3
      WHERE id = $4
    `, [
      newProgress,
      completed ? 'completed' : 'active',
      completed ? new Date() : null,
      userMissionId
    ]);

    await db.query('COMMIT');

    res.json({
      success: true,
      completed,
      current_progress: newProgress,
      target_progress: mission.target_progress
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Update mission progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim mission rewards
router.post('/missions/:userMissionId/claim', verifyToken, async (req, res) => {
  const { userMissionId } = req.params;

  try {
    await db.query('BEGIN');

    // Get completed mission
    const { rows: missions } = await db.query(`
      SELECT um.*, m.*
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.id = $1 AND um.user_id = $2 AND um.status = 'completed'
    `, [userMissionId, req.userId]);

    if (missions.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Mission not completed or already claimed' });
    }

    const mission = missions[0];

    // Give rewards
    if (mission.xp_reward > 0) {
      await db.query(
        'SELECT * FROM add_xp_to_user($1, $2, $3, $4, $5)',
        [req.userId, mission.xp_reward, 'mission', mission.mission_id, `Mission: ${mission.mission_title}`]
      );
    }

    if (mission.points_reward > 0) {
      await db.query(`
        UPDATE user_profiles
        SET total_points = total_points + $1,
            available_points = available_points + $1,
            lifetime_points = lifetime_points + $1,
            total_missions_completed = total_missions_completed + 1
        WHERE user_id = $2
      `, [mission.points_reward, req.userId]);

      await db.query(`
        INSERT INTO points_transactions (user_id, amount, transaction_type, source_type, source_id, description)
        VALUES ($1, $2, 'earned', 'mission', $3, $4)
      `, [req.userId, mission.points_reward, mission.mission_id, `Mission: ${mission.mission_title}`]);
    }

    if (mission.cash_reward > 0) {
      await db.query(`
        UPDATE users
        SET bonus_balance = COALESCE(bonus_balance, 0) + $1
        WHERE id = $2
      `, [mission.cash_reward, req.userId]);
    }

    // Mark as claimed
    await db.query(`
      UPDATE user_missions
      SET status = 'claimed',
          claimed_at = CURRENT_TIMESTAMP,
          xp_earned = $1,
          points_earned = $2,
          cash_earned = $3
      WHERE id = $4
    `, [mission.xp_reward, mission.points_reward, mission.cash_reward, userMissionId]);

    await db.query('COMMIT');

    res.json({
      success: true,
      rewards: {
        xp: mission.xp_reward,
        points: mission.points_reward,
        cash: mission.cash_reward
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Claim mission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// LEADERBOARD
// ============================================

// Get leaderboard
router.get('/leaderboard', verifyToken, async (req, res) => {
  const { type = 'level', limit = 50 } = req.query;

  try {
    let orderBy = 'up.level DESC, up.total_xp DESC';
    
    if (type === 'points') {
      orderBy = 'up.total_points DESC';
    } else if (type === 'missions') {
      orderBy = 'up.total_missions_completed DESC';
    } else if (type === 'streak') {
      orderBy = 'up.current_streak DESC';
    }

    const { rows } = await db.query(`
      SELECT 
        u.id,
        u.username,
        up.level,
        up.total_xp,
        up.total_points,
        up.rank_title,
        up.current_streak,
        up.total_missions_completed,
        r.rank_color,
        ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      LEFT JOIN ranks r ON up.rank_id = r.id
      ORDER BY ${orderBy}
      LIMIT $1
    `, [limit]);

    // Find current user's position
    const { rows: userRank } = await db.query(`
      SELECT rank FROM (
        SELECT 
          up.user_id,
          ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
        FROM user_profiles up
      ) ranked
      WHERE user_id = $1
    `, [req.userId]);

    res.json({
      leaderboard: rows,
      user_rank: userRank[0]?.rank || null,
      type
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// DAILY CHECK-IN & STREAKS
// ============================================

// Perform daily check-in
router.post('/checkin', verifyToken, async (req, res) => {
  try {
    await db.query('BEGIN');

    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const { rows: existing } = await db.query(`
      SELECT * FROM daily_activities
      WHERE user_id = $1 AND activity_date = $2
    `, [req.userId, today]);

    if (existing.length > 0 && existing[0].daily_reward_claimed) {
      await db.query('ROLLBACK');
      return res.json({
        already_checked_in: true,
        message: 'You have already checked in today'
      });
    }

    // Get user's current streak
    const { rows: profile } = await db.query(
      'SELECT current_streak, last_activity_date FROM user_profiles WHERE user_id = $1',
      [req.userId]
    );

    const lastActivityDate = profile[0]?.last_activity_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActivityDate === yesterdayStr) {
      newStreak = (profile[0]?.current_streak || 0) + 1;
    }

    // Update streak and give rewards
    const baseXP = 50;
    const streakBonus = Math.min(newStreak * 10, 100); // Max 100 bonus XP
    const totalXP = baseXP + streakBonus;

    await db.query(
      'SELECT * FROM add_xp_to_user($1, $2, $3, $4, $5)',
      [req.userId, totalXP, 'daily_checkin', null, `Daily check-in (${newStreak} day streak)`]
    );

    await db.query(`
      UPDATE user_profiles
      SET current_streak = $1,
          longest_streak = GREATEST(longest_streak, $1),
          last_activity_date = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
    `, [newStreak, today, req.userId]);

    // Record activity
    await db.query(`
      INSERT INTO daily_activities (user_id, activity_date, logins_count, daily_reward_claimed)
      VALUES ($1, $2, 1, true)
      ON CONFLICT (user_id, activity_date)
      DO UPDATE SET daily_reward_claimed = true, logins_count = daily_activities.logins_count + 1
    `, [req.userId, today]);

    await db.query('COMMIT');

    res.json({
      success: true,
      new_streak: newStreak,
      xp_earned: totalXP,
      base_xp: baseXP,
      streak_bonus: streakBonus
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Daily check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// REFERRAL SYSTEM
// ============================================

// Get user's referral code
router.get('/referral/code', verifyToken, async (req, res) => {
  try {
    let { rows } = await db.query(
      'SELECT * FROM referral_codes WHERE user_id = $1',
      [req.userId]
    );

    // Generate code if doesn't exist
    if (rows.length === 0) {
      const { rows: userRows } = await db.query(
        'SELECT username FROM users WHERE id = $1',
        [req.userId]
      );

      const username = userRows[0]?.username || 'USER';
      const { rows: codeRows } = await db.query(
        'SELECT generate_referral_code($1, $2) as code',
        [req.userId, username]
      );

      const newCode = codeRows[0].code;

      await db.query(`
        INSERT INTO referral_codes (user_id, referral_code)
        VALUES ($1, $2)
      `, [req.userId, newCode]);

      // Initialize referral stats
      await db.query(`
        INSERT INTO referral_stats (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `, [req.userId]);

      rows = [{ referral_code: newCode, total_uses: 0 }];
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get referral stats
router.get('/referral/stats', verifyToken, async (req, res) => {
  try {
    const { rows: stats } = await db.query(`
      SELECT 
        rs.*,
        rc.referral_code,
        rc.total_uses as code_uses
      FROM referral_stats rs
      LEFT JOIN referral_codes rc ON rs.user_id = rc.user_id
      WHERE rs.user_id = $1
    `, [req.userId]);

    const { rows: referrals } = await db.query(`
      SELECT 
        r.*,
        u.username as referred_username,
        u.email as referred_email
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.referred_at DESC
    `, [req.userId]);

    res.json({
      stats: stats[0] || {
        total_referrals: 0,
        active_referrals: 0,
        qualified_referrals: 0,
        lifetime_referral_cash: 0,
        lifetime_referral_points: 0,
        lifetime_referral_xp: 0
      },
      referrals
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate referral code
router.post('/referral/validate', async (req, res) => {
  const { referral_code } = req.body;

  if (!referral_code) {
    return res.status(400).json({ message: 'Referral code is required' });
  }

  try {
    const { rows } = await db.query(`
      SELECT 
        rc.*,
        u.username as referrer_username
      FROM referral_codes rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.referral_code = $1 AND rc.is_active = true
    `, [referral_code.toUpperCase()]);

    if (rows.length === 0) {
      return res.json({ valid: false, message: 'Invalid referral code' });
    }

    const code = rows[0];

    // Check if expired
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return res.json({ valid: false, message: 'Referral code has expired' });
    }

    // Check if max uses reached
    if (code.max_uses && code.total_uses >= code.max_uses) {
      return res.json({ valid: false, message: 'Referral code has reached maximum uses' });
    }

    res.json({
      valid: true,
      referrer_username: code.referrer_username,
      code_type: code.code_type
    });
  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply referral code (for new users during registration)
router.post('/referral/apply', verifyToken, async (req, res) => {
  const { referral_code } = req.body;

  if (!referral_code) {
    return res.status(400).json({ message: 'Referral code is required' });
  }

  try {
    await db.query('BEGIN');

    // Check if user already has a referrer
    const { rows: existingRef } = await db.query(
      'SELECT * FROM referrals WHERE referred_id = $1',
      [req.userId]
    );

    if (existingRef.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'You have already used a referral code' });
    }

    // Get referral code details
    const { rows: codeRows } = await db.query(`
      SELECT * FROM referral_codes
      WHERE referral_code = $1 AND is_active = true
    `, [referral_code.toUpperCase()]);

    if (codeRows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    const code = codeRows[0];

    // Can't refer yourself
    if (code.user_id === req.userId) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'You cannot use your own referral code' });
    }

    // Create referral record
    await db.query(`
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status)
      VALUES ($1, $2, $3, 'pending')
    `, [code.user_id, req.userId, referral_code.toUpperCase()]);

    // Update code usage
    await db.query(`
      UPDATE referral_codes
      SET total_uses = total_uses + 1
      WHERE id = $1
    `, [code.id]);

    // Update referral stats
    await db.query(`
      INSERT INTO referral_stats (user_id, total_referrals, last_referral_date)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        total_referrals = referral_stats.total_referrals + 1,
        last_referral_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `, [code.user_id]);

    // Give signup bonus
    await db.query(
      'SELECT * FROM process_referral_reward($1, $2, $3)',
      [code.user_id, req.userId, 'signup_bonus']
    );

    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Referral code applied successfully',
      referrer_id: code.user_id
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Apply referral code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Trigger referral milestone (called when referred user completes actions)
router.post('/referral/milestone', verifyToken, async (req, res) => {
  const { milestone_type, milestone_value } = req.body;

  try {
    await db.query('BEGIN');

    // Get referral record (where current user is the referred)
    const { rows: referrals } = await db.query(
      'SELECT * FROM referrals WHERE referred_id = $1',
      [req.userId]
    );

    if (referrals.length === 0) {
      await db.query('ROLLBACK');
      return res.json({ success: false, message: 'No referral record found' });
    }

    const referral = referrals[0];
    let rewardKey = null;

    // Determine which reward to trigger
    switch (milestone_type) {
      case 'first_link':
        if (!referral.referred_has_linked) {
          await db.query(
            'UPDATE referrals SET referred_has_linked = true WHERE id = $1',
            [referral.id]
          );
          rewardKey = 'first_link_bonus';
        }
        break;

      case 'earnings':
        const newAmount = milestone_value || 0;
        await db.query(
          'UPDATE referrals SET referred_earning_amount = $1, referred_has_earned = true WHERE id = $2',
          [newAmount, referral.id]
        );

        // Check which tier to unlock
        if (newAmount >= 500000) {
          rewardKey = 'earnings_tier3';
        } else if (newAmount >= 100000) {
          rewardKey = 'earnings_tier2';
        } else if (newAmount >= 50000) {
          rewardKey = 'earnings_tier1';
        }
        break;

      default:
        await db.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid milestone type' });
    }

    // Process reward if applicable
    if (rewardKey) {
      await db.query(
        'SELECT * FROM process_referral_reward($1, $2, $3)',
        [referral.referrer_id, req.userId, rewardKey]
      );

      // Update referral status
      await db.query(
        'UPDATE referrals SET status = $1, qualified_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['qualified', referral.id]
      );

      // Update stats
      await db.query(`
        UPDATE referral_stats
        SET qualified_referrals = qualified_referrals + 1
        WHERE user_id = $1
      `, [referral.referrer_id]);
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      reward_triggered: !!rewardKey,
      reward_key: rewardKey
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Referral milestone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get referral leaderboard
router.get('/referral/leaderboard', verifyToken, async (req, res) => {
  const { period = 'all_time', limit = 50 } = req.query;

  try {
    let query;

    if (period === 'monthly') {
      const now = new Date();
      query = `
        SELECT 
          rl.*,
          u.username,
          up.rank_title
        FROM referral_leaderboard rl
        JOIN users u ON rl.user_id = u.id
        LEFT JOIN user_profiles up ON rl.user_id = up.user_id
        WHERE rl.period_month = $1 AND rl.period_year = $2
        ORDER BY rl.total_earned_cash DESC, rl.qualified_referrals DESC
        LIMIT $3
      `;

      const { rows } = await db.query(query, [now.getMonth() + 1, now.getFullYear(), limit]);
      return res.json(rows);
    }

    // All-time leaderboard
    query = `
      SELECT 
        rs.user_id,
        u.username,
        up.rank_title,
        rs.total_referrals,
        rs.qualified_referrals,
        rs.lifetime_referral_cash,
        rs.lifetime_referral_points,
        ROW_NUMBER() OVER (ORDER BY rs.qualified_referrals DESC, rs.lifetime_referral_cash DESC) as rank
      FROM referral_stats rs
      JOIN users u ON rs.user_id = u.id
      LEFT JOIN user_profiles up ON rs.user_id = up.user_id
      WHERE rs.total_referrals > 0
      ORDER BY rs.qualified_referrals DESC, rs.lifetime_referral_cash DESC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);

    // Get current user's rank
    const { rows: userRank } = await db.query(`
      SELECT rank FROM (
        SELECT 
          user_id,
          ROW_NUMBER() OVER (ORDER BY qualified_referrals DESC, lifetime_referral_cash DESC) as rank
        FROM referral_stats
        WHERE total_referrals > 0
      ) ranked
      WHERE user_id = $1
    `, [req.userId]);

    res.json({
      leaderboard: rows,
      user_rank: userRank[0]?.rank || null
    });
  } catch (error) {
    console.error('Get referral leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;