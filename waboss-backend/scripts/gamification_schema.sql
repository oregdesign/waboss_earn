-- ============================================
-- WABOSS GAMIFICATION SYSTEM - DATABASE SCHEMA (SAFE + COMPLETE)
-- ============================================

-- 1. USER PROFILE & PROGRESSION
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    rank_id INTEGER REFERENCES ranks(id),
    rank_title VARCHAR(100) DEFAULT 'Rookie',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_missions_completed INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    total_achievements_unlocked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- 2. RANK SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    rank_name VARCHAR(100) NOT NULL UNIQUE,
    rank_tier INTEGER NOT NULL UNIQUE,
    min_level INTEGER NOT NULL,
    min_points INTEGER NOT NULL,
    rank_icon VARCHAR(255),
    rank_color VARCHAR(50),
    perks_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ranks (rank_name, rank_tier, min_level, min_points, rank_color) VALUES
('Rookie', 1, 1, 0, '#8B8B8B'),
('Apprentice', 2, 5, 500, '#CD7F32'),
('Skilled', 3, 10, 1500, '#C0C0C0'),
('Expert', 4, 20, 5000, '#FFD700'),
('Master', 5, 35, 15000, '#E5E4E2'),
('Legend', 6, 50, 50000, '#00CED1'),
('Champion', 7, 75, 150000, '#9400D3'),
('Mythic', 8, 100, 500000, '#FF1493')
ON CONFLICT (rank_name) DO NOTHING;

-- 3. ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    achievement_key VARCHAR(100) NOT NULL UNIQUE,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    achievement_category VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    xp_reward INTEGER DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    badge_icon VARCHAR(255),
    badge_rarity VARCHAR(50),
    is_secret BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO achievements (achievement_key, achievement_name, achievement_description, achievement_category, requirement_type, requirement_value, xp_reward, points_reward, badge_rarity) VALUES
('first_link', 'First Connection', 'Link your first WhatsApp account', 'account', 'count', 1, 100, 50, 'common'),
('link_master', 'Connection Master', 'Link 5 WhatsApp accounts', 'account', 'count', 5, 500, 250, 'rare'),
('streak_7', 'Week Warrior', 'Maintain a 7-day login streak', 'social', 'threshold', 7, 300, 150, 'rare'),
('streak_30', 'Monthly Champion', 'Maintain a 30-day login streak', 'social', 'threshold', 30, 1500, 1000, 'epic'),
('first_mission', 'Mission Starter', 'Complete your first mission', 'mission', 'count', 1, 100, 50, 'common'),
('mission_10', 'Mission Veteran', 'Complete 10 missions', 'mission', 'count', 10, 500, 300, 'rare'),
('earn_100k', 'Money Maker', 'Earn Rp100,000 in total', 'special', 'threshold', 100000, 1000, 500, 'epic'),
('level_10', 'Rising Star', 'Reach level 10', 'special', 'threshold', 10, 500, 250, 'rare'),
('level_50', 'Elite Player', 'Reach level 50', 'special', 'threshold', 50, 5000, 2500, 'legendary')
ON CONFLICT (achievement_key) DO NOTHING;

-- 4. USER ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_id)
);

-- 5. MISSIONS SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    mission_key VARCHAR(100) NOT NULL UNIQUE,
    mission_title VARCHAR(255) NOT NULL,
    mission_description TEXT,
    mission_type VARCHAR(50),
    mission_category VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_target INTEGER,
    xp_reward INTEGER DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    cash_reward INTEGER DEFAULT 0,
    is_repeatable BOOLEAN DEFAULT FALSE,
    cooldown_hours INTEGER,
    difficulty VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO missions (mission_key, mission_title, mission_description, mission_type, mission_category, requirement_type, requirement_target, xp_reward, points_reward, cash_reward, is_repeatable, difficulty, is_active) VALUES
('daily_login', 'Daily Check-in', 'Login to your account today', 'daily', 'social', 'login', 1, 50, 25, 0, TRUE, 'easy', TRUE),
('daily_link', 'Daily Connector', 'Link a new WhatsApp account today', 'daily', 'account', 'link_account', 1, 200, 100, 5000, TRUE, 'medium', TRUE),
('weekly_earn', 'Weekly Earner', 'Earn Rp50,000 this week', 'weekly', 'earnings', 'earn_amount', 50000, 500, 300, 10000, TRUE, 'medium', TRUE),
('invite_friend', 'Social Butterfly', 'Invite 1 friend to join WaBoss', 'special', 'social', 'refer_friend', 1, 1000, 500, 20000, FALSE, 'medium', TRUE)
ON CONFLICT (mission_key) DO NOTHING;

-- 6. USER MISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS user_missions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP,
    expires_at TIMESTAMP,
    xp_earned INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    cash_earned INTEGER DEFAULT 0,
    CONSTRAINT unique_active_user_mission UNIQUE(user_id, mission_id, started_at)
);

-- 7. XP & POINTS TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS xp_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source_type VARCHAR(50),
    source_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS points_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20),
    source_type VARCHAR(50),
    source_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. LEVEL CONFIGURATION
-- ============================================
CREATE TABLE IF NOT EXISTS level_config (
    level INTEGER PRIMARY KEY,
    xp_required INTEGER NOT NULL,
    xp_to_next INTEGER NOT NULL,
    reward_points INTEGER DEFAULT 0,
    reward_cash INTEGER DEFAULT 0,
    unlock_features TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO level_config (level, xp_required, xp_to_next, reward_points) VALUES
(1, 0, 100, 0),
(2, 100, 150, 50),
(3, 250, 200, 75),
(4, 450, 300, 100),
(5, 750, 400, 150),
(10, 3750, 1000, 500),
(20, 18750, 2500, 1500),
(50, 218750, 10000, 10000),
(100, 1218750, 50000, 50000)
ON CONFLICT (level) DO NOTHING;

-- 9. REFERRAL SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS referral_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    code_type VARCHAR(20) DEFAULT 'standard',
    total_uses INTEGER DEFAULT 0,
    max_uses INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_referral UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    referrer_xp_earned INTEGER DEFAULT 0,
    referrer_points_earned INTEGER DEFAULT 0,
    referrer_cash_earned INTEGER DEFAULT 0,
    referred_xp_earned INTEGER DEFAULT 0,
    referred_points_earned INTEGER DEFAULT 0,
    referred_cash_earned INTEGER DEFAULT 0,
    referred_has_linked BOOLEAN DEFAULT FALSE,
    referred_has_earned BOOLEAN DEFAULT FALSE,
    referred_earning_amount INTEGER DEFAULT 0,
    referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qualified_at TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT unique_referral UNIQUE(referred_id)
);

CREATE TABLE IF NOT EXISTS referral_leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    qualified_referrals INTEGER DEFAULT 0,
    total_earned_cash INTEGER DEFAULT 0,
    total_earned_points INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_period UNIQUE(user_id, period_month, period_year)
);

CREATE TABLE IF NOT EXISTS referral_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    qualified_referrals INTEGER DEFAULT 0,
    lifetime_referral_cash INTEGER DEFAULT 0,
    lifetime_referral_points INTEGER DEFAULT 0,
    lifetime_referral_xp INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    avg_referred_earnings INTEGER DEFAULT 0,
    last_referral_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_referral_stats UNIQUE(user_id)
);

-- 10. DEFAULT REFERRAL REWARDS
-- ============================================
CREATE TABLE IF NOT EXISTS referral_rewards (
    id SERIAL PRIMARY KEY,
    reward_key VARCHAR(50) NOT NULL UNIQUE,
    reward_name VARCHAR(255) NOT NULL,
    reward_description TEXT,
    trigger_type VARCHAR(50),
    trigger_value INTEGER,
    referrer_xp INTEGER DEFAULT 0,
    referrer_points INTEGER DEFAULT 0,
    referrer_cash INTEGER DEFAULT 0,
    referred_xp INTEGER DEFAULT 0,
    referred_points INTEGER DEFAULT 0,
    referred_cash INTEGER DEFAULT 0,
    min_referrals INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO referral_rewards (reward_key, reward_name, reward_description, trigger_type, trigger_value, referrer_xp, referrer_points, referrer_cash, referred_xp, referred_points, referred_cash) VALUES
('signup_bonus', 'Sign Up Bonus', 'When referred user signs up', 'signup', 0, 100, 50, 5000, 50, 25, 5000),
('first_link_bonus', 'First Link Bonus', 'When referred user links first WhatsApp', 'first_link', 1, 500, 250, 20000, 100, 50, 10000),
('earnings_tier1', 'Earner Tier 1', 'When referred user earns Rp50,000', 'earnings_threshold', 50000, 1000, 500, 50000, 200, 100, 25000),
('earnings_tier2', 'Earner Tier 2', 'When referred user earns Rp100,000', 'earnings_threshold', 100000, 2000, 1000, 100000, 500, 250, 50000),
('earnings_tier3', 'Earner Tier 3', 'When referred user earns Rp500,000', 'earnings_threshold', 500000, 10000, 5000, 500000, 2000, 1000, 200000)
ON CONFLICT (reward_key) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: generate_referral_code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id INTEGER, p_username VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_code VARCHAR(20);
    v_exists BOOLEAN;
BEGIN
    v_code := UPPER(SUBSTRING(p_username FROM 1 FOR 6)) || LPAD(p_user_id::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE referral_code = v_code) INTO v_exists;
    IF v_exists THEN
        v_code := v_code || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END IF;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function: get_xp_for_next_level
CREATE OR REPLACE FUNCTION get_xp_for_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT xp_to_next FROM level_config WHERE level = current_level + 1);
END;
$$ LANGUAGE plpgsql;

-- Function: update_user_rank
CREATE OR REPLACE FUNCTION update_user_rank(p_user_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_level INTEGER;
    v_points INTEGER;
    v_new_rank_id INTEGER;
BEGIN
    SELECT level, total_points INTO v_level, v_points
    FROM user_profiles
    WHERE user_id = p_user_id;

    SELECT id INTO v_new_rank_id
    FROM ranks
    WHERE min_level <= v_level AND min_points <= v_points
    ORDER BY rank_tier DESC
    LIMIT 1;

    UPDATE user_profiles
    SET rank_id = v_new_rank_id,
        rank_title = (SELECT rank_name FROM ranks WHERE id = v_new_rank_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function: add_xp_to_user
CREATE OR REPLACE FUNCTION add_xp_to_user(
    p_user_id INTEGER,
    p_xp_amount INTEGER,
    p_source_type VARCHAR(50),
    p_source_id INTEGER,
    p_description TEXT
)
RETURNS TABLE(leveled_up BOOLEAN, new_level INTEGER, new_xp INTEGER) AS $$
DECLARE
    v_current_level INTEGER;
    v_current_xp INTEGER;
    v_total_xp INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_leveled_up BOOLEAN := FALSE;
    v_xp_for_next INTEGER;
BEGIN
    SELECT level, current_xp, total_xp INTO v_current_level, v_current_xp, v_total_xp
    FROM user_profiles WHERE user_id = p_user_id;

    v_new_xp := v_current_xp + p_xp_amount;
    v_total_xp := v_total_xp + p_xp_amount;
    v_new_level := v_current_level;

    LOOP
        v_xp_for_next := get_xp_for_next_level(v_new_level);
        EXIT WHEN v_xp_for_next IS NULL OR v_new_xp < v_xp_for_next;
        v_new_xp := v_new_xp - v_xp_for_next;
        v_new_level := v_new_level + 1;
        v_leveled_up := TRUE;
    END LOOP;

    UPDATE user_profiles
    SET level = v_new_level,
        current_xp = v_new_xp,
        total_xp = v_total_xp,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    INSERT INTO xp_transactions (user_id, amount, source_type, source_id, description)
    VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_description);

    IF v_leveled_up THEN
        PERFORM update_user_rank(p_user_id);
    END IF;

    RETURN QUERY SELECT v_leveled_up, v_new_level, v_new_xp;
END;
$$ LANGUAGE plpgsql;

-- Function: process_referral_reward
CREATE OR REPLACE FUNCTION process_referral_reward(
    p_referrer_id INTEGER,
    p_referred_id INTEGER,
    p_reward_key VARCHAR(50)
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_reward RECORD;
    v_referral RECORD;
BEGIN
    -- Get reward configuration
    SELECT * INTO v_reward FROM referral_rewards WHERE reward_key = p_reward_key AND is_active = TRUE;
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Reward configuration not found';
        RETURN;
    END IF;

    -- Get referral record
    SELECT * INTO v_referral FROM referrals WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id;
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Referral record not found';
        RETURN;
    END IF;

    -- Give rewards to referrer
    IF v_reward.referrer_xp > 0 THEN
        PERFORM add_xp_to_user(p_referrer_id, v_reward.referrer_xp, 'referral', v_referral.id, v_reward.reward_name);
    END IF;

    IF v_reward.referrer_points > 0 THEN
        UPDATE user_profiles
        SET total_points = total_points + v_reward.referrer_points,
            available_points = available_points + v_reward.referrer_points,
            lifetime_points = lifetime_points + v_reward.referrer_points
        WHERE user_id = p_referrer_id;

        INSERT INTO points_transactions (user_id, amount, transaction_type, source_type, source_id, description)
        VALUES (p_referrer_id, v_reward.referrer_points, 'earned', 'referral', v_referral.id, v_reward.reward_name);
    END IF;

    IF v_reward.referrer_cash > 0 THEN
        UPDATE users
        SET bonus_balance = COALESCE(bonus_balance, 0) + v_reward.referrer_cash
        WHERE id = p_referrer_id;
    END IF;

    -- Give rewards to referred user
    IF v_reward.referred_xp > 0 THEN
        PERFORM add_xp_to_user(p_referred_id, v_reward.referred_xp, 'referral_bonus', v_referral.id, v_reward.reward_name);
    END IF;

    IF v_reward.referred_points > 0 THEN
        UPDATE user_profiles
        SET total_points = total_points + v_reward.referred_points,
            available_points = available_points + v_reward.referred_points,
            lifetime_points = lifetime_points + v_reward.referred_points
        WHERE user_id = p_referred_id;

        INSERT INTO points_transactions (user_id, amount, transaction_type, source_type, source_id, description)
        VALUES (p_referred_id, v_reward.referred_points, 'earned', 'referral_bonus', v_referral.id, v_reward.reward_name);
    END IF;

    IF v_reward.referred_cash > 0 THEN
        UPDATE users
        SET bonus_balance = COALESCE(bonus_balance, 0) + v_reward.referred_cash
        WHERE id = p_referred_id;
    END IF;

    -- Update referral tracking
    UPDATE referrals
    SET referrer_xp_earned = referrer_xp_earned + v_reward.referrer_xp,
        referrer_points_earned = referrer_points_earned + v_reward.referrer_points,
        referrer_cash_earned = referrer_cash_earned + v_reward.referrer_cash,
        referred_xp_earned = referred_xp_earned + v_reward.referred_xp,
        referred_points_earned = referred_points_earned + v_reward.referred_points,
        referred_cash_earned = referred_cash_earned + v_reward.referred_cash
    WHERE id = v_referral.id;

    -- Update referral stats
    UPDATE referral_stats
    SET lifetime_referral_cash = lifetime_referral_cash + v_reward.referrer_cash,
        lifetime_referral_points = lifetime_referral_points + v_reward.referrer_points,
        lifetime_referral_xp = lifetime_referral_xp + v_reward.referrer_xp,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_referrer_id;

    RETURN QUERY SELECT TRUE, 'Rewards processed successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rank_id ON user_profiles(rank_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON daily_activities(user_id, activity_date);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_stats_user_id ON referral_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_leaderboard_period ON referral_leaderboard(period_year, period_month);
