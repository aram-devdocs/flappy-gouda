import {
  type DifficultyKey,
  FlappyNatureGame,
  type LeaderboardCallbacks,
  type LeaderboardData,
  useNickname,
} from '@repo/flappy-nature-game';
import { useMemo, useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard.js';
import { useLeaderboardRealtime } from '../hooks/useLeaderboardRealtime.js';
import { useLeaderboardService } from './LeaderboardProvider.js';

export function GameWithLeaderboard() {
  const service = useLeaderboardService();
  const { nickname, setNickname } = useNickname();
  const [difficulty] = useState<DifficultyKey>('normal');

  const { data: entries, isLoading } = useLeaderboard(difficulty);
  const { status: connectionStatus } = useLeaderboardRealtime(difficulty);

  const playerEntry = useMemo(() => {
    if (!nickname || !entries) return null;
    return entries.find((e) => e.nickname === nickname) ?? null;
  }, [entries, nickname]);

  const leaderboardData: LeaderboardData = useMemo(
    () => ({
      entries: entries ?? [],
      playerEntry,
      isLoading,
      connectionStatus,
    }),
    [entries, playerEntry, isLoading, connectionStatus],
  );

  const callbacks: LeaderboardCallbacks = useMemo(
    () => ({
      onScoreSubmit: (score: number, diff: DifficultyKey) => {
        service.submitScore(score, diff).catch((err: unknown) => {
          // biome-ignore lint/suspicious/noConsole: operational warning for failed score submission
          console.warn('[leaderboard] score submit failed:', err);
        });
      },
      onNicknameSet: (name: string) => {
        service
          .registerNickname(name)
          .then(() => setNickname(name))
          .catch((err: unknown) => {
            // biome-ignore lint/suspicious/noConsole: operational warning for failed registration
            console.warn('[leaderboard] nickname registration failed:', err);
          });
      },
      onNicknameCheck: (name: string) => service.checkNickname(name),
    }),
    [service, setNickname],
  );

  return (
    <FlappyNatureGame
      showFps
      leaderboard={leaderboardData}
      leaderboardCallbacks={callbacks}
      nickname={nickname}
    />
  );
}
