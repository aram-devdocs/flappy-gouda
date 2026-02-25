import {
  DebugBottomSheet,
  type DebugControls,
  type DebugMetricsSnapshot,
  DebugPanel,
  DebugTab,
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
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useDebugRecording } from '../hooks/useDebugRecording';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useLeaderboardRealtime } from '../hooks/useLeaderboardRealtime';
import { useLiveScores } from '../hooks/useLiveScores';
import { useMergedLeaderboard } from '../hooks/useMergedLeaderboard';
import { useLeaderboardService } from './LeaderboardProvider';

const DEBUG_PANEL_W = '280px';
const TRANSITION = 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

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

  // Debug state
  const [debugMetrics, setDebugMetrics] = useState<DebugMetricsSnapshot | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const debugControlsRef = useRef<DebugControls | null>(null);
  const rec = useDebugRecording(debugControlsRef);

  const windowConfig = useMemo(
    () => ({
      topCount: 3,
      surroundCount: breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 3,
      showAllThreshold: 20,
    }),
    [breakpoint],
  );

  const { data: entries, isLoading } = useLeaderboard(difficulty);
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

  // --- Toggles with mutual exclusivity on mobile ---

  const toggleSheet = useCallback(() => {
    setSheetOpen((prev) => {
      if (!prev && breakpoint === 'mobile') setDebugOpen(false);
      return !prev;
    });
  }, [breakpoint]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const toggleDebug = useCallback(() => {
    setDebugOpen((prev) => {
      if (!prev && breakpoint === 'mobile') setSheetOpen(false);
      return !prev;
    });
  }, [breakpoint]);

  // --- Game callbacks ---

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
        setLiveScore(null);
        const svc = service as { resetBroadcastSession?: () => void };
        svc.resetBroadcastSession?.();
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
  const hasDebug = debugMetrics != null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Debug tab - outside left edge */}
      {hasDebug && (
        <DebugTab
          visible
          expanded={debugOpen}
          isRecording={rec.isRecording}
          onClick={toggleDebug}
          style={{
            right: '100%',
            left: 'auto',
            borderRadius: `${RADIUS.lg} 0 0 ${RADIUS.lg}`,
          }}
        />
      )}

      {/* Debug panel - slides left (desktop / tablet) */}
      {breakpoint !== 'mobile' && hasDebug && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '100%',
            bottom: 0,
            width: debugOpen ? DEBUG_PANEL_W : '0px',
            overflow: 'hidden',
            transition: TRANSITION,
          }}
        >
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: DEBUG_PANEL_W }}>
            <DebugPanel
              visible
              metrics={debugMetrics}
              isRecording={rec.isRecording}
              hasRecording={rec.hasRecording}
              onStartRecording={rec.start}
              onStopRecording={rec.stop}
              onExportRecording={rec.exportRecording}
            />
          </div>
        </div>
      )}

      <FlappyNatureGame
        showFps
        showDebug
        onDebugMetrics={setDebugMetrics}
        debugControlsRef={debugControlsRef}
        leaderboard={leaderboardData}
        leaderboardCallbacks={callbacks}
        leaderboardExpanded={sheetOpen}
        nickname={nickname}
        onDifficultyChange={setDifficulty}
        onScoreChange={handleScoreChange}
        onStateChange={handleStateChange}
        onBestScoreChange={handleBestScoreChange}
      />

      {/* Leaderboard tab - outside right edge */}
      <LeaderboardTab
        visible
        expanded={sheetOpen}
        onClick={toggleSheet}
        connectionStatus={connectionStatus}
        style={{ left: '100%', right: 'auto', borderRadius: `0 ${RADIUS.lg} ${RADIUS.lg} 0` }}
      />

      {breakpoint === 'mobile' ? (
        <>
          <LeaderboardBottomSheet
            visible={sheetOpen}
            items={windowedItems}
            playerEntryId={playerEntry?.id ?? null}
            isLoading={isLoading}
            difficulty={difficulty}
            connectionStatus={connectionStatus}
          />
          {hasDebug && (
            <DebugBottomSheet
              visible={debugOpen}
              metrics={debugMetrics}
              isRecording={rec.isRecording}
            />
          )}
        </>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            bottom: 0,
            width: sheetOpen ? panelWidth : '0px',
            overflow: 'hidden',
            transition: TRANSITION,
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
