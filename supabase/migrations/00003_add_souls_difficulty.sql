-- Add 'souls' to the allowed difficulty values on the scores table
ALTER TABLE scores DROP CONSTRAINT scores_difficulty_check;
ALTER TABLE scores ADD CONSTRAINT scores_difficulty_check CHECK (difficulty IN ('easy', 'normal', 'hard', 'souls'));
