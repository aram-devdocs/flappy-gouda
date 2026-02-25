import {
  type DifficultyKey,
  FlappyNatureGame,
  type GameState,
  LeaderboardBottomSheet,
  type LeaderboardCallbacks,
  type LeaderboardData,
  LeaderboardPanel,
  LeaderboardTab,
  RADIUS,
  useNickname,
} from '@repo/flappy-nature-game';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { useLeaderboard } from '../hooks/useLeaderboard.js';
import { useLeaderboardRealtime } from '../hooks/useLeaderboardRealtime.js';
import { useLiveScores } from '../hooks/useLiveScores.js';
import { useMergedLeaderboard } from '../hooks/useMergedLeaderboard.js';
import { useLeaderboardService } from './LeaderboardProvider.js';

export function GameWithLeaderboard() {
  const service = useLeaderboardService();
  const queryClient = useQueryClient();
  const { nickname, setNickname } = useNickname();
  const breakpoint = useBreakpoint();
  const [difficulty, setDifficulty] = useState<DifficultyKey>('normal');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [bestScoreForDiff, setBestScoreForDiff] = useState(0);
  const gameStateRef = useRef<GameState>('idle');

  const windowConfig = useMemo(
    () => ({
      topCount: 3,
      surroundCount: breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 3,
    }),
    [breakpoint],
  );

  const { data: entries, isLoading } = useLeaderboard(difficulty, windowConfig.surroundCount);
  const { status: connectionStatus } = useLeaderboardRealtime(difficulty);
  const liveScores = useLiveScores(difficulty);

  const { mergedEntries, playerEntry, windowedItems } = useMergedLeaderboard(
    entries,
    liveScores,
    liveScore,
    nickname ?? null,
    windowConfig,
  );

  const leaderboardData: LeaderboardData = useMemo(
    () => ({ entries: mergedEntries, playerEntry, isLoading, connectionStatus }),
    [mergedEntries, playerEntry, isLoading, connectionStatus],
  );

  const toggleSheet = useCallback(() => setSheetOpen((prev) => !prev), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const handleScoreChange = useCallback(
    (score: number) => {
      if (gameStateRef.current !== 'play') return;
      if (score > bestScoreForDiff && nickname) {
        setLiveScore(score);
        service.broadcastLiveScore?.(score, difficulty, nickname);
      }
    },
    [bestScoreForDiff, nickname, service, difficulty],
  );

  const handleStateChange = useCallback(
    (state: GameState) => {
      gameStateRef.current = state;
      if (state === 'play') {
        const svc = service as { resetBroadcastSession?: () => void };
        svc.resetBroadcastSession?.();
      }
      if (state === 'dead' || state === 'idle') {
        setLiveScore(null);
      }
    },
    [service],
  );

  const handleBestScoreChange = useCallback(
    (scores: Record<string, number>) => {
      setBestScoreForDiff(scores[difficulty] ?? 0);
    },
    [difficulty],
  );

  const callbacks: LeaderboardCallbacks = useMemo(
    () => ({
      onScoreSubmit: (score: number, diff: DifficultyKey) => {
        service
          .submitScore(score, diff)
          .then(() => queryClient.invalidateQueries({ queryKey: ['leaderboard'] }))
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

  const panelWidth = breakpoint === 'tablet' ? '180px' : '220px';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <FlappyNatureGame
        showFps
        leaderboard={leaderboardData}
        leaderboardCallbacks={callbacks}
        leaderboardExpanded={sheetOpen}
        nickname={nickname}
        onDifficultyChange={setDifficulty}
        onScoreChange={handleScoreChange}
        onStateChange={handleStateChange}
        onBestScoreChange={handleBestScoreChange}
      />
      <LeaderboardTab
        visible
        expanded={sheetOpen}
        onClick={toggleSheet}
        connectionStatus={connectionStatus}
        style={{ left: '100%', right: 'auto', borderRadius: `0 ${RADIUS.lg} ${RADIUS.lg} 0` }}
      />
      {breakpoint === 'mobile' ? (
        <LeaderboardBottomSheet
          visible={sheetOpen}
          items={windowedItems}
          playerEntryId={playerEntry?.id ?? null}
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
            width: sheetOpen ? panelWidth : '0px',
            overflow: 'hidden',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ position: 'relative', width: panelWidth, height: '100%' }}>
            <LeaderboardPanel
              visible
              items={windowedItems}
              playerEntryId={playerEntry?.id ?? null}
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
