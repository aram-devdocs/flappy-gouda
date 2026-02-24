import type { BestScores, DifficultyKey, ScoreComparison } from '@repo/types';
import { DIFF_KEYS, DIFF_LABELS } from '@repo/types';

/** localStorage key set when migration has been completed or declined. */
export const MIGRATION_FLAG_KEY = 'sn-migration-done';

/** Bridge URL for the old site's postMessage endpoint. */
export const BRIDGE_URL =
  'https://sgrim-secondnature.github.io/Finance-question-randomizer/bridge.html';

const MAX_SCORE = 9999;

/** Merge two sets of best scores, taking the maximum per difficulty. */
export function mergeBestScores(oldScores: BestScores, currentScores: BestScores): BestScores {
  const merged: BestScores = { easy: 0, normal: 0, hard: 0 };
  for (const key of DIFF_KEYS) {
    merged[key] = Math.max(oldScores[key], currentScores[key]);
  }
  return merged;
}

/** Check whether any old score is strictly greater than the corresponding current score. */
export function hasScoreImprovements(oldScores: BestScores, currentScores: BestScores): boolean {
  return DIFF_KEYS.some((key) => oldScores[key] > currentScores[key]);
}

/** Build a per-difficulty comparison array for display in the migration modal. */
export function buildScoreComparisons(
  oldScores: BestScores,
  currentScores: BestScores,
): ScoreComparison[] {
  return DIFF_KEYS.map((key: DifficultyKey) => ({
    difficulty: key,
    label: DIFF_LABELS[key],
    oldScore: oldScores[key],
    newScore: currentScores[key],
    isImprovement: oldScores[key] > currentScores[key],
  }));
}

/** Parse and validate scores from a bridge postMessage response. Returns null if invalid. */
export function parseBridgeScores(data: unknown): BestScores | null {
  if (typeof data !== 'object' || data === null) return null;

  const msg = data as Record<string, unknown>;
  if (msg.type !== 'sn-migration-response' || msg.version !== 1) return null;
  if (msg.scores === null || msg.scores === undefined) return null;
  if (typeof msg.scores !== 'object') return null;

  const raw = msg.scores as Record<string, unknown>;
  const scores: BestScores = { easy: 0, normal: 0, hard: 0 };

  for (const key of DIFF_KEYS) {
    const val = raw[key];
    if (typeof val === 'number' && val > 0 && val <= MAX_SCORE) {
      scores[key] = val;
    }
  }

  return scores;
}

/** Check whether all scores in a BestScores object are zero. */
export function areAllScoresZero(scores: BestScores): boolean {
  return DIFF_KEYS.every((key) => scores[key] === 0);
}
