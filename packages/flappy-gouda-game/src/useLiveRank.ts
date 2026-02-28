import type { FlappyEngine } from '@repo/engine';
import type { GameState, LeaderboardData } from '@repo/types';
import { GameState as GS } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LiveRankResult {
  rank: number | null;
  improving: boolean;
}

function computeRank(
  score: number,
  thresholds: number[],
  existingRank: number | null,
  existingScore: number,
): number | null {
  if (thresholds.length === 0 && existingRank == null) return null;

  let lo = 0;
  let hi = thresholds.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((thresholds[mid] ?? 0) >= score) lo = mid + 1;
    else hi = mid;
  }
  const searchRank = lo + 1;

  if (existingRank != null && score <= existingScore) return existingRank;
  return searchRank;
}

/**
 * Computes an approximate leaderboard rank in real-time during gameplay.
 * Snapshots OTHER players' scores on play-start, then binary-searches on
 * each engine scoreChange event. Accounts for the player's existing entry
 * so rank never regresses below their current standing.
 */
export function useLiveRank(
  engineRef: React.RefObject<FlappyEngine | null>,
  engineReady: boolean,
  state: GameState,
  leaderboard: LeaderboardData | undefined,
): LiveRankResult {
  const [rank, setRank] = useState<number | null>(null);
  const [improving, setImproving] = useState(false);
  const thresholdsRef = useRef<number[]>([]);
  const playerRankRef = useRef<number | null>(null);
  const playerScoreRef = useRef(-1);
  const prevRankRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state === GS.Play && leaderboard) {
      const playerId = leaderboard.playerEntry?.id ?? null;
      playerRankRef.current = leaderboard.playerEntry?.rank ?? null;
      playerScoreRef.current = leaderboard.playerEntry?.score ?? -1;
      thresholdsRef.current = leaderboard.entries
        .filter((e) => e.id !== playerId)
        .map((e) => e.score)
        .sort((a, b) => b - a);
      setRank(null);
      prevRankRef.current = null;
      setImproving(false);
      clearTimer();
    }
  }, [state, leaderboard, clearTimer]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !engineReady || state !== GS.Play) return;

    const onScore = (score: number) => {
      const newRank = computeRank(
        score,
        thresholdsRef.current,
        playerRankRef.current,
        playerScoreRef.current,
      );
      if (newRank == null) return;

      setRank((prev) => {
        if (prev === newRank) return prev;
        const wasImprovement = prev !== null && newRank < prev;
        prevRankRef.current = prev;
        if (wasImprovement) {
          setImproving(true);
          clearTimer();
          timerRef.current = setTimeout(() => setImproving(false), 1500);
        }
        return newRank;
      });
    };

    engine.on('scoreChange', onScore);
    return () => engine.off('scoreChange', onScore);
  }, [engineRef, engineReady, state, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return { rank, improving };
}
