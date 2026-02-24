import type { DifficultyKey, LeaderboardEntry } from '@repo/flappy-nature-game';
import { useQuery } from '@tanstack/react-query';
import { useLeaderboardService } from '../components/LeaderboardProvider.js';

export function useLeaderboard(difficulty: DifficultyKey) {
  const service = useLeaderboardService();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', difficulty],
    queryFn: () => service.getLeaderboard(difficulty),
    refetchInterval: 60_000,
  });
}
