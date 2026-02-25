import {
  type DifficultyKey,
  FlappyNatureGame,
  LeaderboardBottomSheet,
  type LeaderboardCallbacks,
  type LeaderboardData,
  LeaderboardPanel,
  LeaderboardTab,
  RADIUS,
  useNickname,
} from '@repo/flappy-nature-game';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useLeaderboard } from '../hooks/useLeaderboard.js';
import { useLeaderboardRealtime } from '../hooks/useLeaderboardRealtime.js';
import { useLeaderboardService } from './LeaderboardProvider.js';

export function GameWithLeaderboard() {
  const service = useLeaderboardService();
  const queryClient = useQueryClient();
  const { nickname, setNickname } = useNickname();
  const isMobile = useIsMobile();
  const [difficulty, setDifficulty] = useState<DifficultyKey>('normal');
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const toggleSheet = useCallback(() => {
    setSheetOpen((prev) => !prev);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
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
      <FlappyNatureGame
        showFps
        leaderboard={leaderboardData}
        leaderboardCallbacks={callbacks}
        leaderboardExpanded={sheetOpen}
        nickname={nickname}
        onDifficultyChange={setDifficulty}
      />
      <LeaderboardTab
        visible
        expanded={sheetOpen}
        onClick={toggleSheet}
        connectionStatus={connectionStatus}
        style={{ left: '100%', right: 'auto', borderRadius: `0 ${RADIUS.lg} ${RADIUS.lg} 0` }}
      />
      {isMobile ? (
        <LeaderboardBottomSheet
          visible={sheetOpen}
          entries={entries ?? []}
          playerEntry={playerEntry}
          isLoading={isLoading}
          difficulty={difficulty}
          connectionStatus={connectionStatus}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            bottom: 0,
            width: sheetOpen ? '220px' : '0px',
            overflow: 'hidden',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ position: 'relative', width: '220px', height: '100%' }}>
            <LeaderboardPanel
              visible
              entries={entries ?? []}
              playerEntry={playerEntry}
              isLoading={isLoading}
              onClose={closeSheet}
              difficulty={difficulty}
            />
          </div>
        </div>
      )}
    </div>
  );
}
