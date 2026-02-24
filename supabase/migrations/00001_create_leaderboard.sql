-- Leaderboard schema for Flappy Nature multiplayer scores

-- profiles: one per anonymous user, stores their 3-letter nickname
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT nickname_format CHECK (nickname ~ '^[A-Z0-9]{3}$')
);

CREATE INDEX idx_profiles_nickname ON profiles (nickname);

-- scores: one row per user per difficulty (upsert pattern, best score only)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 9999),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scores_user_difficulty_unique UNIQUE (user_id, difficulty)
);

CREATE INDEX idx_scores_difficulty_score ON scores (difficulty, score DESC);
CREATE INDEX idx_scores_user_difficulty ON scores (user_id, difficulty);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner insert/update only
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Scores: public read, owner insert/update only
CREATE POLICY "scores_select" ON scores
  FOR SELECT USING (true);

CREATE POLICY "scores_insert" ON scores
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "scores_update" ON scores
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Enable Realtime for scores table
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
