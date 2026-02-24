import type {
  DifficultyKey,
  LeaderboardConnectionStatus,
  LeaderboardEntry,
} from '@repo/flappy-nature-game';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLeaderboardService } from '../components/LeaderboardProvider.js';
import { isSupabaseConfigured } from '../lib/supabase/client.js';

export function useLeaderboardRealtime(difficulty: DifficultyKey) {
  const service = useLeaderboardService();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LeaderboardConnectionStatus>(
    isSupabaseConfigured ? 'connecting' : 'disconnected',
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('disconnected');
      return;
    }

    setStatus('connecting');

    const unsubscribe = service.subscribeToScores(difficulty, (entries: LeaderboardEntry[]) => {
      queryClient.setQueryData(['leaderboard', difficulty], entries);
    });

    // Mark connected after a short delay (Supabase channel subscription is async)
    const timer = setTimeout(() => setStatus('connected'), 1000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      setStatus('disconnected');
    };
  }, [difficulty, service, queryClient]);

  return { status };
}
