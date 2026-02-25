import type { DifficultyKey, LeaderboardEntry } from '@repo/flappy-nature-game';
import { useQuery } from '@tanstack/react-query';
import { useLeaderboardService } from '../components/LeaderboardProvider';

export function useLeaderboard(difficulty: DifficultyKey, surroundCount = 3) {
  const service = useLeaderboardService();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', difficulty, surroundCount],
    queryFn: () =>
      service.getLeaderboardWindowed
        ? service.getLeaderboardWindowed(difficulty, 3, surroundCount)
        : service.getLeaderboard(difficulty),
    refetchInterval: 60_000,
  });
}
