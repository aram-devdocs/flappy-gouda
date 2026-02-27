import type { BestScores, DifficultyKey } from '@repo/types';
import { DIFF_KEYS } from '@repo/types';
import { createLogger } from './logger';

const log = createLogger('persistence');

const MAX_SCORE = 9999;
const BEST_STORAGE_KEY = 'fg-flappy-best-v2';
const DIFF_STORAGE_KEY = 'fg-flappy-diff';

/** Load per-difficulty best scores from localStorage, migrating the legacy single-score key if needed. */
export function loadBestScores(): BestScores {
  const scores: BestScores = { easy: 0, normal: 0, hard: 0, souls: 0 };
  try {
    const raw = localStorage.getItem(BEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      for (const k of DIFF_KEYS) {
        if (
          typeof parsed[k] === 'number' &&
          (parsed[k] as number) > 0 &&
          (parsed[k] as number) <= MAX_SCORE
        ) {
          scores[k] = parsed[k] as number;
        }
      }
    }
    // Migrate old single-score key if v2 doesn't exist yet
    if (!raw) {
      const old = Number.parseInt(localStorage.getItem('fg-flappy-best') ?? '0', 10);
      if (old > 0) {
        scores.normal = old;
        saveBestScores(scores);
        localStorage.removeItem('fg-flappy-best');
      }
    }
  } catch (e) {
    log.warn('Failed to load best scores from localStorage', { error: String(e) });
  }
  return scores;
}

/** Persist best scores to localStorage. */
export function saveBestScores(scores: BestScores): void {
  localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(scores));
}

/** Load the saved difficulty preference from localStorage, defaulting to 'normal'. */
export function loadDifficulty(): DifficultyKey {
  const stored = localStorage.getItem(DIFF_STORAGE_KEY);
  if (stored === 'easy' || stored === 'normal' || stored === 'hard' || stored === 'souls') {
    return stored;
  }
  return 'normal';
}

/** Persist the selected difficulty key to localStorage. */
export function saveDifficulty(key: DifficultyKey): void {
  localStorage.setItem(DIFF_STORAGE_KEY, key);
}
