import {
  type DifficultyKey,
  FlappyNatureGame,
  type LeaderboardCallbacks,
  LeaderboardSidebar,
  LeaderboardTab,
  RADIUS,
  Z_INDEX,
  useNickname,
} from '@repo/flappy-nature-game';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard.js';
import { useLeaderboardRealtime } from '../hooks/useLeaderboardRealtime.js';
import { useLeaderboardService } from './LeaderboardProvider.js';

export function GameWithLeaderboard() {
  const service = useLeaderboardService();
  const queryClient = useQueryClient();
  const { nickname, setNickname } = useNickname();
  const [difficulty, setDifficulty] = useState<DifficultyKey>('normal');
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const { data: entries, isLoading } = useLeaderboard(difficulty);
  const { status: connectionStatus } = useLeaderboardRealtime(difficulty);

  const playerEntry = useMemo(() => {
    if (!nickname || !entries) return null;
    return entries.find((e) => e.nickname === nickname) ?? null;
  }, [entries, nickname]);

  const toggleLeaderboard = useCallback(() => {
    setLeaderboardOpen((prev) => !prev);
  }, []);

  const callbacks: LeaderboardCallbacks = useMemo(
    () => ({
      onScoreSubmit: (score: number, diff: DifficultyKey) => {
        service
          .submitScore(score, diff)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          })
          .catch((err: unknown) => {
            // biome-ignore lint/suspicious/noConsole: operational warning for failed score submission
            console.warn('[leaderboard] score submit failed:', err);
          });
      },
      onNicknameSet: (name: string) => {
        setNickname(name);
        service.registerNickname(name).catch((err: unknown) => {
          // biome-ignore lint/suspicious/noConsole: operational warning for failed registration
          console.warn('[leaderboard] nickname registration failed:', err);
        });
      },
      onNicknameCheck: (name: string) => service.checkNickname(name),
    }),
    [service, setNickname, queryClient],
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ position: 'relative', zIndex: Z_INDEX.base, display: 'inline-block' }}>
        <FlappyNatureGame
          showFps
          leaderboardCallbacks={callbacks}
          nickname={nickname}
          onDifficultyChange={setDifficulty}
        />
      </div>
      <LeaderboardTab
        visible
        expanded={leaderboardOpen}
        onClick={toggleLeaderboard}
        connectionStatus={connectionStatus}
        style={{
          right: 'auto',
          left: '100%',
          borderRadius: `0 ${RADIUS.lg} ${RADIUS.lg} 0`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '100%',
          top: 0,
          bottom: 0,
          width: '220px',
          overflow: 'hidden',
          pointerEvents: leaderboardOpen ? 'auto' : 'none',
        }}
      >
        <LeaderboardSidebar
          visible={leaderboardOpen}
          entries={entries ?? []}
          playerEntry={playerEntry}
          isLoading={isLoading}
          difficulty={difficulty}
          connectionStatus={connectionStatus}
        />
      </div>
    </div>
  );
}
