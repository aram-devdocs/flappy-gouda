import type { BestScores } from '@repo/types';
import { describe, expect, it } from 'vitest';
import {
  areAllScoresZero,
  buildScoreComparisons,
  hasScoreImprovements,
  mergeBestScores,
  parseBridgeScores,
} from '../migration';

describe('mergeBestScores', () => {
  it('takes the maximum of each difficulty', () => {
    const old: BestScores = { easy: 5, normal: 10, hard: 0 };
    const cur: BestScores = { easy: 3, normal: 12, hard: 7 };
    expect(mergeBestScores(old, cur)).toEqual({ easy: 5, normal: 12, hard: 7 });
  });

  it('returns current scores when old are all zero', () => {
    const old: BestScores = { easy: 0, normal: 0, hard: 0 };
    const cur: BestScores = { easy: 1, normal: 2, hard: 3 };
    expect(mergeBestScores(old, cur)).toEqual({ easy: 1, normal: 2, hard: 3 });
  });

  it('returns old scores when current are all zero', () => {
    const old: BestScores = { easy: 10, normal: 20, hard: 30 };
    const cur: BestScores = { easy: 0, normal: 0, hard: 0 };
    expect(mergeBestScores(old, cur)).toEqual({ easy: 10, normal: 20, hard: 30 });
  });

  it('returns zeros when both are all zero', () => {
    const old: BestScores = { easy: 0, normal: 0, hard: 0 };
    const cur: BestScores = { easy: 0, normal: 0, hard: 0 };
    expect(mergeBestScores(old, cur)).toEqual({ easy: 0, normal: 0, hard: 0 });
  });
});

describe('hasScoreImprovements', () => {
  it('returns true when old has a higher score in at least one difficulty', () => {
    const old: BestScores = { easy: 5, normal: 0, hard: 0 };
    const cur: BestScores = { easy: 3, normal: 10, hard: 0 };
    expect(hasScoreImprovements(old, cur)).toBe(true);
  });

  it('returns false when current scores are all >= old', () => {
    const old: BestScores = { easy: 3, normal: 5, hard: 7 };
    const cur: BestScores = { easy: 3, normal: 10, hard: 7 };
    expect(hasScoreImprovements(old, cur)).toBe(false);
  });

  it('returns false when both are all zero', () => {
    const old: BestScores = { easy: 0, normal: 0, hard: 0 };
    const cur: BestScores = { easy: 0, normal: 0, hard: 0 };
    expect(hasScoreImprovements(old, cur)).toBe(false);
  });

  it('returns true when old has higher scores in all difficulties', () => {
    const old: BestScores = { easy: 10, normal: 20, hard: 30 };
    const cur: BestScores = { easy: 0, normal: 0, hard: 0 };
    expect(hasScoreImprovements(old, cur)).toBe(true);
  });
});

describe('buildScoreComparisons', () => {
  it('returns one entry per difficulty with correct labels', () => {
    const old: BestScores = { easy: 5, normal: 10, hard: 0 };
    const cur: BestScores = { easy: 3, normal: 12, hard: 7 };
    const result = buildScoreComparisons(old, cur);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      difficulty: 'easy',
      label: 'Easy',
      oldScore: 5,
      newScore: 3,
      isImprovement: true,
    });
    expect(result[1]).toEqual({
      difficulty: 'normal',
      label: 'Normal',
      oldScore: 10,
      newScore: 12,
      isImprovement: false,
    });
    expect(result[2]).toEqual({
      difficulty: 'hard',
      label: 'Hard',
      oldScore: 0,
      newScore: 7,
      isImprovement: false,
    });
  });

  it('marks all as improvements when current scores are all zero', () => {
    const old: BestScores = { easy: 1, normal: 2, hard: 3 };
    const cur: BestScores = { easy: 0, normal: 0, hard: 0 };
    const result = buildScoreComparisons(old, cur);
    expect(result.every((r) => r.isImprovement)).toBe(true);
  });

  it('marks none as improvements when old scores are all zero', () => {
    const old: BestScores = { easy: 0, normal: 0, hard: 0 };
    const cur: BestScores = { easy: 1, normal: 2, hard: 3 };
    const result = buildScoreComparisons(old, cur);
    expect(result.every((r) => !r.isImprovement)).toBe(true);
  });
});

describe('parseBridgeScores', () => {
  it('parses a valid response', () => {
    const data = {
      type: 'sn-migration-response',
      version: 1,
      scores: { easy: 5, normal: 10, hard: 15 },
    };
    expect(parseBridgeScores(data)).toEqual({ easy: 5, normal: 10, hard: 15 });
  });

  it('returns null for wrong type', () => {
    const data = { type: 'wrong-type', version: 1, scores: { easy: 5, normal: 10, hard: 15 } };
    expect(parseBridgeScores(data)).toBeNull();
  });

  it('returns null for wrong version', () => {
    const data = {
      type: 'sn-migration-response',
      version: 2,
      scores: { easy: 5, normal: 10, hard: 15 },
    };
    expect(parseBridgeScores(data)).toBeNull();
  });

  it('returns null when scores is null', () => {
    const data = { type: 'sn-migration-response', version: 1, scores: null };
    expect(parseBridgeScores(data)).toBeNull();
  });

  it('returns null for non-object data', () => {
    expect(parseBridgeScores('string')).toBeNull();
    expect(parseBridgeScores(42)).toBeNull();
    expect(parseBridgeScores(null)).toBeNull();
    expect(parseBridgeScores(undefined)).toBeNull();
  });

  it('returns null when scores is not an object', () => {
    const data = { type: 'sn-migration-response', version: 1, scores: 'bad' };
    expect(parseBridgeScores(data)).toBeNull();
  });

  it('ignores scores above MAX_SCORE (9999)', () => {
    const data = {
      type: 'sn-migration-response',
      version: 1,
      scores: { easy: 10000, normal: 5, hard: 0 },
    };
    expect(parseBridgeScores(data)).toEqual({ easy: 0, normal: 5, hard: 0 });
  });

  it('ignores negative scores', () => {
    const data = {
      type: 'sn-migration-response',
      version: 1,
      scores: { easy: -1, normal: 5, hard: 0 },
    };
    expect(parseBridgeScores(data)).toEqual({ easy: 0, normal: 5, hard: 0 });
  });

  it('ignores non-number score values', () => {
    const data = {
      type: 'sn-migration-response',
      version: 1,
      scores: { easy: 'abc', normal: true, hard: null },
    };
    expect(parseBridgeScores(data)).toEqual({ easy: 0, normal: 0, hard: 0 });
  });

  it('handles missing difficulty keys gracefully', () => {
    const data = { type: 'sn-migration-response', version: 1, scores: { normal: 7 } };
    expect(parseBridgeScores(data)).toEqual({ easy: 0, normal: 7, hard: 0 });
  });
});

describe('areAllScoresZero', () => {
  it('returns true when all scores are zero', () => {
    expect(areAllScoresZero({ easy: 0, normal: 0, hard: 0 })).toBe(true);
  });

  it('returns false when any score is non-zero', () => {
    expect(areAllScoresZero({ easy: 1, normal: 0, hard: 0 })).toBe(false);
    expect(areAllScoresZero({ easy: 0, normal: 1, hard: 0 })).toBe(false);
    expect(areAllScoresZero({ easy: 0, normal: 0, hard: 1 })).toBe(false);
  });
});
