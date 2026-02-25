import type { LeaderboardEntry, LeaderboardWindowItem } from '@repo/flappy-nature-game';

interface WindowConfig {
  topCount: number;
  surroundCount: number;
}

/**
 * Transforms a flat ranked entry list into a windowed view with separators.
 * Shows the top N entries plus a window around the player's position.
 */
export function computeLeaderboardWindow(
  entries: LeaderboardEntry[],
  playerEntryId: string | null,
  config: WindowConfig,
): LeaderboardWindowItem[] {
  if (entries.length === 0) return [];

  const { topCount, surroundCount } = config;
  const maxCompact = topCount + 1 + surroundCount * 2;

  // If few enough entries, show them all
  if (entries.length <= maxCompact) {
    return entries.map((entry) => ({ type: 'entry' as const, entry }));
  }

  const topEntries = entries.slice(0, topCount);
  const playerIndex = playerEntryId ? entries.findIndex((e) => e.id === playerEntryId) : -1;

  // No player found — just show top entries
  if (playerIndex < 0) {
    return topEntries.map((entry) => ({ type: 'entry' as const, entry }));
  }

  // Player is within top region — show merged
  if (playerIndex < topCount + surroundCount + 1) {
    const endIdx = Math.min(playerIndex + surroundCount + 1, entries.length);
    const mergedEnd = Math.max(topCount, endIdx);
    const merged = entries.slice(0, mergedEnd);
    const items: LeaderboardWindowItem[] = merged.map((entry) => ({
      type: 'entry' as const,
      entry,
    }));
    return items;
  }

  // Player is further down — top + separator + player window
  const windowStart = Math.max(playerIndex - surroundCount, 0);
  const windowEnd = Math.min(playerIndex + surroundCount + 1, entries.length);
  const playerWindow = entries.slice(windowStart, windowEnd);

  const items: LeaderboardWindowItem[] = topEntries.map((entry) => ({
    type: 'entry' as const,
    entry,
  }));

  const lastTop = topEntries[topEntries.length - 1];
  const firstWindow = playerWindow[0];
  if (!lastTop || !firstWindow) return items;

  const lastTopRank = lastTop.rank;
  const firstWindowRank = firstWindow.rank;

  if (firstWindowRank > lastTopRank + 1) {
    items.push({
      type: 'separator' as const,
      rankAbove: lastTopRank,
      rankBelow: firstWindowRank,
    });
  }

  for (const entry of playerWindow) {
    items.push({ type: 'entry' as const, entry });
  }

  return items;
}
