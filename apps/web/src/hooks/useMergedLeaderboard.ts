import type { LeaderboardEntry, LeaderboardWindowItem } from '@repo/flappy-nature-game';
import { useMemo } from 'react';
import { computeLeaderboardWindow } from '../lib/leaderboard/compute-window.js';
import type { LiveScoreBroadcast } from '../lib/leaderboard/service.js';

interface WindowConfig {
  topCount: number;
  surroundCount: number;
  showAllThreshold?: number;
}

interface MergedLeaderboardResult {
  mergedEntries: LeaderboardEntry[];
  playerEntry: LeaderboardEntry | null;
  windowedItems: LeaderboardWindowItem[];
  liveEntryIds: ReadonlySet<string>;
}

function applyLiveScore(base: LeaderboardEntry[], nickname: string, score: number): void {
  const idx = base.findIndex((e) => e.nickname === nickname);
  const existing = idx >= 0 ? base[idx] : undefined;
  if (existing && score > existing.score) {
    base[idx] = { ...existing, score };
  }
}

function mergeEntries(
  entries: LeaderboardEntry[] | undefined,
  liveScores: LiveScoreBroadcast[],
  liveScore: number | null,
  nickname: string | null,
): LeaderboardEntry[] {
  const base = entries ? [...entries] : [];
  if (base.length === 0) return base;

  for (const broadcast of liveScores) {
    applyLiveScore(base, broadcast.nickname, broadcast.score);
  }
  if (liveScore !== null && nickname) {
    applyLiveScore(base, nickname, liveScore);
  }

  base.sort((a, b) => b.score - a.score);
  for (let i = 0; i < base.length; i++) {
    const current = base[i];
    if (current) base[i] = { ...current, rank: i + 1 };
  }
  return base;
}

function buildLiveEntryIds(
  mergedEntries: LeaderboardEntry[],
  liveScores: LiveScoreBroadcast[],
  liveScore: number | null,
  nickname: string | null,
): Set<string> {
  const ids = new Set<string>();
  for (const broadcast of liveScores) {
    const entry = mergedEntries.find((e) => e.nickname === broadcast.nickname);
    if (entry) ids.add(entry.id);
  }
  if (liveScore !== null && nickname) {
    const entry = mergedEntries.find((e) => e.nickname === nickname);
    if (entry) ids.add(entry.id);
  }
  return ids;
}

export function useMergedLeaderboard(
  entries: LeaderboardEntry[] | undefined,
  liveScores: LiveScoreBroadcast[],
  liveScore: number | null,
  nickname: string | null,
  windowConfig: WindowConfig,
): MergedLeaderboardResult {
  const mergedEntries = useMemo(
    () => mergeEntries(entries, liveScores, liveScore, nickname),
    [entries, liveScores, liveScore, nickname],
  );

  const playerEntry = useMemo(() => {
    if (!nickname || mergedEntries.length === 0) return null;
    return mergedEntries.find((e) => e.nickname === nickname) ?? null;
  }, [mergedEntries, nickname]);

  const liveEntryIds = useMemo(
    () => buildLiveEntryIds(mergedEntries, liveScores, liveScore, nickname),
    [mergedEntries, liveScores, liveScore, nickname],
  );

  const windowedItems: LeaderboardWindowItem[] = useMemo(() => {
    const items = computeLeaderboardWindow(mergedEntries, playerEntry?.id ?? null, windowConfig);
    return items.map((item) => {
      if (item.type !== 'entry') return item;
      if (liveEntryIds.has(item.entry.id)) return { ...item, isLive: true };
      return item;
    });
  }, [mergedEntries, playerEntry, windowConfig, liveEntryIds]);

  return { mergedEntries, playerEntry, windowedItems, liveEntryIds };
}
