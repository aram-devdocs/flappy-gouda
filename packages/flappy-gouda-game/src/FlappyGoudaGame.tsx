import { useGameEngine, useGameInput } from '@repo/hooks';
import type { DifficultyKey, FlappyGoudaGameProps } from '@repo/types';
import { DIFF_KEYS, Difficulty, GameState as GS } from '@repo/types';
import {
  DifficultyPicker,
  FpsCounter,
  GameCanvas,
  GameHeader,
  GameLayout,
  GameOverScreen,
  LiveRankOverlay,
  ResetConfirmModal,
  SettingsMenu,
  TitleScreen,
} from '@repo/ui';
import { useEffect, useMemo, useState } from 'react';
import { GameErrorBoundary } from './GameErrorBoundary';
import { LeaderboardOverlay } from './LeaderboardOverlay';
import { useDeathStats } from './useDeathStats';
import { useDebugBridge } from './useDebugBridge';
import type { SettingsView } from './useGameCallbacks';
import { useGameCallbacks } from './useGameCallbacks';
import { useLeaderboardState } from './useLeaderboardState';
import { useLiveRank } from './useLiveRank';

export function FlappyGoudaGame({
  colors,
  fontFamily,
  difficulty: initialDifficulty,
  onStateChange,
  onScoreChange,
  onBestScoreChange,
  onDifficultyChange,
  className,
  showFps = false,
  showDebug = false,
  soulsMode = false,
  onDebugMetrics,
  debugControlsRef,
  leaderboard,
  leaderboardCallbacks,
  leaderboardExpanded = false,
  nickname,
}: FlappyGoudaGameProps) {
  const {
    containerRef,
    canvasRef,
    engineRef,
    engineReady,
    state,
    score,
    bestScores,
    difficulty,
    fps,
    flap,
    setDifficulty,
    pause,
    resume,
    handleCanvasClick,
    handleCanvasHover,
  } = useGameEngine({
    colors,
    fontFamily,
    difficulty: initialDifficulty,
    enableDebug: showDebug,
  });

  useDebugBridge(engineRef, engineReady, showDebug, onDebugMetrics, debugControlsRef);
  const [settingsView, setSettingsView] = useState<SettingsView>('closed');
  const lb = useLeaderboardState(state, score, difficulty, nickname, leaderboardCallbacks);
  const liveRank = useLiveRank(engineRef, engineReady, state, leaderboard);
  const { deathIsNewBest } = useDeathStats(state, engineRef, score, bestScores, difficulty);
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);
  // Subscribe directly to engine scoreChange events for live broadcasting.
  // React state only flushes on state transitions, so callers that need
  // per-point updates (like live score broadcast) must listen to the engine.
  useEffect(() => {
    if (!engineReady || !onScoreChange) return;
    const engine = engineRef.current;
    if (!engine) return;
    const handler = (s: number) => onScoreChange(s);
    engine.on('scoreChange', handler);
    return () => engine.off('scoreChange', handler);
  }, [engineReady, onScoreChange, engineRef]);
  useEffect(() => {
    onBestScoreChange?.(bestScores);
  }, [bestScores, onBestScoreChange]);
  useEffect(() => {
    onDifficultyChange?.(difficulty);
  }, [difficulty, onDifficultyChange]);
  const callbacks = useGameCallbacks({
    flap,
    pause,
    resume,
    setDifficulty,
    handleCanvasClick,
    handleCanvasHover,
    canvasRef,
    settingsView,
    setSettingsView,
    onNicknameClear: leaderboardCallbacks?.onNicknameClear,
  });

  useGameInput({
    onFlap: callbacks.handleFlap,
    onEscape: callbacks.handleEscape,
    onCanvasInteract: callbacks.onCanvasInteract,
    onCanvasHover: callbacks.onCanvasHover,
    canvasRef,
    enabled: settingsView === 'closed',
  });
  const availableDifficulties = useMemo<DifficultyKey[]>(
    () => (soulsMode ? DIFF_KEYS : DIFF_KEYS.filter((k) => k !== Difficulty.Souls)),
    [soulsMode],
  );
  useEffect(() => {
    if (!soulsMode && difficulty === Difficulty.Souls) setDifficulty(Difficulty.Hard);
  }, [soulsMode, difficulty, setDifficulty]);
  const currentBest = bestScores[difficulty] ?? 0;
  const isOverlayVisible = state !== GS.Play || settingsView !== 'closed';
  const hasCallbacks = !!leaderboardCallbacks;
  return (
    <GameErrorBoundary>
      <GameLayout
        colors={colors}
        className={className}
        header={
          <GameHeader
            difficulty={difficulty}
            bestScore={currentBest}
            difficultyVisible={state !== GS.Idle}
            onDifficultyClick={callbacks.toggleSettings}
            nickname={nickname ?? null}
          />
        }
        footer={null}
      >
        <GameCanvas ref={containerRef} blurred={isOverlayVisible} />
        <FpsCounter fps={fps} visible={showFps} />
        <TitleScreen
          visible={state === GS.Idle}
          bestScore={currentBest}
          onPlay={callbacks.handlePlay}
          nickname={nickname ?? null}
          nicknameValue={lb.nicknameValue}
          onNicknameChange={lb.handleNicknameChange}
          onNicknameSubmit={lb.handleNicknameSubmit}
          nicknameError={lb.nicknameError}
          nicknameChecking={lb.nicknameChecking}
          hasLeaderboard={hasCallbacks}
          difficulty={difficulty}
        />
        <GameOverScreen
          visible={state === GS.Dead}
          score={score}
          bestScore={currentBest}
          isNewBest={deathIsNewBest}
          rank={liveRank.rank}
        />
        <LiveRankOverlay visible={false} rank={null} improving={false} />
        <SettingsMenu
          visible={settingsView === 'menu'}
          nickname={nickname ?? null}
          onDifficultyClick={callbacks.openDifficultyFromMenu}
          onNicknameClear={callbacks.handleNicknameClear}
          onClose={callbacks.handleSettingsClose}
        />
        <DifficultyPicker
          currentDifficulty={difficulty}
          bestScores={bestScores}
          visible={settingsView === 'difficulty'}
          onSelect={callbacks.handleDifficultySelect}
          onClose={callbacks.handleSettingsClose}
          availableDifficulties={availableDifficulties}
        />
        <ResetConfirmModal
          visible={settingsView === 'confirm-reset'}
          onConfirm={callbacks.handleResetConfirm}
          onCancel={callbacks.handleResetCancel}
        />
        {!!leaderboard && !leaderboardExpanded && (
          <LeaderboardOverlay leaderboard={leaderboard} gameState={state} />
        )}
      </GameLayout>
    </GameErrorBoundary>
  );
}
