import type { PatternType } from '@repo/types';
import { MovementArc, PatternType as PT } from '@repo/types';

/** Phrase count range [min, max] for each arc phase, keyed by difficulty. */
export const ARC_LENGTHS: Record<string, Record<MovementArc, [number, number]>> = {
  easy: {
    [MovementArc.Build]: [3, 4],
    [MovementArc.Climax]: [1, 2],
    [MovementArc.Release]: [1, 2],
  },
  normal: {
    [MovementArc.Build]: [2, 3],
    [MovementArc.Climax]: [2, 3],
    [MovementArc.Release]: [1, 1],
  },
  hard: {
    [MovementArc.Build]: [1, 2],
    [MovementArc.Climax]: [2, 3],
    [MovementArc.Release]: [1, 1],
  },
  souls: {
    [MovementArc.Build]: [1, 1],
    [MovementArc.Climax]: [3, 4],
    [MovementArc.Release]: [1, 1],
  },
};

export const BUILD_PATTERNS = new Set<PatternType>([
  PT.Scatter,
  PT.StairUp,
  PT.StairDown,
  PT.SineWave,
  PT.Tunnel,
]);
export const CLIMAX_PATTERNS = new Set<PatternType>([
  PT.Zigzag,
  PT.Squeeze,
  PT.Rapids,
  PT.Tunnel,
  PT.StairUp,
  PT.StairDown,
]);

export const PHRASE_MIN = 2;
export const PHRASE_MAX = 6;
export const MAX_REROLLS = 3;
export const MIN_TIMING_FLOOR_MS = 200;

export function pickRelease(): PatternType {
  return Math.random() < 0.5 ? PT.Scatter : PT.Drift;
}

export function nextArcPhase(arc: MovementArc): MovementArc {
  if (arc === MovementArc.Build) return MovementArc.Climax;
  if (arc === MovementArc.Climax) return MovementArc.Release;
  return MovementArc.Build;
}

export function weightedPick(
  weights: Record<PatternType, number>,
  allowed: Set<PatternType>,
): PatternType {
  let total = 0;
  for (const [k, w] of Object.entries(weights)) {
    if (allowed.has(k as PatternType) && w > 0) total += w;
  }
  if (total === 0) return PT.Scatter;

  let r = Math.random() * total;
  for (const [k, w] of Object.entries(weights)) {
    if (!allowed.has(k as PatternType) || w <= 0) continue;
    r -= w;
    if (r <= 0) return k as PatternType;
  }
  return PT.Scatter;
}
