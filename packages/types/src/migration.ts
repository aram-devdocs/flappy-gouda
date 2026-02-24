import type { DifficultyKey } from './game';

/** Per-difficulty score comparison between old and new sites. */
export interface ScoreComparison {
  /** The difficulty level being compared. */
  difficulty: DifficultyKey;
  /** Human-readable label for this difficulty. */
  label: string;
  /** Score from the old site. */
  oldScore: number;
  /** Score from the new site. */
  newScore: number;
  /** Whether the old score is higher than the new score. */
  isImprovement: boolean;
}
