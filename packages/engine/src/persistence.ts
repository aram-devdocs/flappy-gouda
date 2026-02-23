import type { BestScores, DifficultyKey } from '@repo/types';
import { DIFF_KEYS } from '@repo/types';

const BEST_STORAGE_KEY = 'sn-flappy-best-v2';
const DIFF_STORAGE_KEY = 'sn-flappy-diff';

export function loadBestScores(): BestScores {
  const scores: BestScores = { easy: 0, normal: 0, hard: 0 };
  try {
    const raw = localStorage.getItem(BEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      for (const k of DIFF_KEYS) {
        if (typeof parsed[k] === 'number' && (parsed[k] as number) > 0) {
          scores[k] = parsed[k] as number;
        }
      }
    }
    // Migrate old single-score key if v2 doesn't exist yet
    if (!raw) {
      const old = Number.parseInt(localStorage.getItem('sn-flappy-best') ?? '0', 10);
      if (old > 0) {
        scores.normal = old;
        saveBestScores(scores);
        localStorage.removeItem('sn-flappy-best');
      }
    }
  } catch {
    /* keep defaults */
  }
  return scores;
}

export function saveBestScores(scores: BestScores): void {
  localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(scores));
}

export function loadDifficulty(): DifficultyKey {
  const stored = localStorage.getItem(DIFF_STORAGE_KEY);
  if (stored === 'easy' || stored === 'normal' || stored === 'hard') {
    return stored;
  }
  return 'normal';
}

export function saveDifficulty(key: DifficultyKey): void {
  localStorage.setItem(DIFF_STORAGE_KEY, key);
}
