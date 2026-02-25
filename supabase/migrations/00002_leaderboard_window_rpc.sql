CREATE OR REPLACE FUNCTION get_leaderboard_window(
  p_difficulty TEXT,
  p_user_id UUID DEFAULT NULL,
  p_top_count INT DEFAULT 3,
  p_surround_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID, nickname TEXT, score INT, difficulty TEXT,
  created_at TIMESTAMPTZ, rank BIGINT
) AS $$
WITH ranked AS (
  SELECT s.id, s.nickname, s.score, s.difficulty, s.created_at,
    ROW_NUMBER() OVER (ORDER BY s.score DESC, s.updated_at ASC) AS rank
  FROM scores s WHERE s.difficulty = p_difficulty
),
player AS (
  SELECT r.rank FROM ranked r
  JOIN scores s2 ON r.id = s2.id WHERE s2.user_id = p_user_id
)
SELECT r.id, r.nickname, r.score, r.difficulty, r.created_at, r.rank
FROM ranked r
WHERE r.rank <= p_top_count
  OR (p_user_id IS NOT NULL AND r.rank BETWEEN
      GREATEST((SELECT rank FROM player) - p_surround_count, 1) AND
      (SELECT rank FROM player) + p_surround_count)
ORDER BY r.rank;
$$ LANGUAGE sql STABLE;
