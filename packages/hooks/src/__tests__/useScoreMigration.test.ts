import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScoreMigration } from '../useScoreMigration';

vi.mock('@repo/engine', () => ({
  BRIDGE_URL: 'https://old-site.example.com/bridge.html',
  MIGRATION_FLAG_KEY: 'sn-migration-done',
  parseBridgeScores: vi.fn(),
  areAllScoresZero: vi.fn(),
  hasScoreImprovements: vi.fn(),
  buildScoreComparisons: vi.fn(() => []),
  mergeBestScores: vi.fn(() => ({ easy: 0, normal: 0, hard: 0 })),
}));

const defaultScores = { easy: 0, normal: 0, hard: 0 };

describe('useScoreMigration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Clean up any iframes left behind
    for (const iframe of document.querySelectorAll('iframe')) {
      iframe.remove();
    }
  });

  it('returns showModal false initially', () => {
    const { result } = renderHook(() => useScoreMigration(defaultScores));
    expect(result.current.showModal).toBe(false);
    expect(result.current.comparisons).toEqual([]);
  });

  it('skips everything when migration flag is already set', () => {
    localStorage.setItem('sn-migration-done', '1');
    renderHook(() => useScoreMigration(defaultScores));
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('creates a hidden iframe when flag is not set', () => {
    renderHook(() => useScoreMigration(defaultScores));
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.style.display).toBe('none');
  });

  it('cleans up iframe on unmount', () => {
    const { unmount } = renderHook(() => useScoreMigration(defaultScores));
    expect(document.querySelector('iframe')).not.toBeNull();
    unmount();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('decline sets migration flag and hides modal', () => {
    const { result } = renderHook(() => useScoreMigration(defaultScores));

    act(() => {
      result.current.decline();
    });

    expect(localStorage.getItem('sn-migration-done')).toBe('1');
    expect(result.current.showModal).toBe(false);
  });
});
