import type { DifficultyKey } from '@repo/flappy-nature-game';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLeaderboardService } from '../components/LeaderboardProvider.js';
import type { LiveScoreBroadcast } from '../lib/leaderboard/service.js';

const EXPIRY_MS = 10_000;
const PRUNE_INTERVAL_MS = 5_000;

export function useLiveScores(difficulty: DifficultyKey): LiveScoreBroadcast[] {
  const service = useLeaderboardService();
  const [scores, setScores] = useState<LiveScoreBroadcast[]>([]);
  const mapRef = useRef(new Map<string, LiveScoreBroadcast>());

  const prune = useCallback(() => {
    const now = Date.now();
    let changed = false;
    for (const [key, val] of mapRef.current) {
      if (now - val.timestamp > EXPIRY_MS) {
        mapRef.current.delete(key);
        changed = true;
      }
    }
    if (changed) {
      setScores([...mapRef.current.values()]);
    }
  }, []);

  useEffect(() => {
    if (!service.subscribeToBroadcasts) return;

    const unsubscribe = service.subscribeToBroadcasts(difficulty, (broadcast) => {
      mapRef.current.set(broadcast.sessionId, broadcast);
      setScores([...mapRef.current.values()]);
    });

    const timer = setInterval(prune, PRUNE_INTERVAL_MS);

    return () => {
      unsubscribe();
      clearInterval(timer);
      mapRef.current.clear();
      setScores([]);
    };
  }, [difficulty, service, prune]);

  return scores;
}
