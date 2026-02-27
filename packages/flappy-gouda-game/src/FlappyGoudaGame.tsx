import { useGameEngine, useGameInput } from '@repo/hooks';
import type { DifficultyKey, FlappyGoudaGameProps } from '@repo/types';
import { DIFF_KEYS } from '@repo/types';
import {
  DifficultyPicker,
  FpsCounter,
  GameCanvas,
  GameHeader,
  GameLayout,
  GameOverScreen,
  NicknameModal,
  ResetConfirmModal,
  SettingsMenu,
  TitleScreen,
} from '@repo/ui';
import { useEffect, useMemo, useState } from 'react';
import { GameErrorBoundary } from './GameErrorBoundary';
import { LeaderboardOverlay } from './LeaderboardOverlay';
import { useDebugBridge } from './useDebugBridge';
import type { SettingsView } from './useGameCallbacks';
import { useGameCallbacks } from './useGameCallbacks';
import { useLeaderboardState } from './useLeaderboardState';

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

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);
  useEffect(() => {
    onBestScoreChange?.(bestScores);
  }, [bestScores, onBestScoreChange]);
  useEffect(() => {
    onDifficultyChange?.(difficulty);
  }, [difficulty, onDifficultyChange]);

  const {
    handleFlap,
    handleEscape,
    toggleSettings,
    onCanvasInteract,
    onCanvasHover,
    handleDifficultySelect,
    handleSettingsClose,
    openDifficultyFromMenu,
    handleNicknameClear,
    handleResetConfirm,
    handleResetCancel,
    handlePlay,
  } = useGameCallbacks({
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
    onFlap: handleFlap,
    onEscape: handleEscape,
    onCanvasInteract,
    onCanvasHover,
    canvasRef,
    enabled: settingsView === 'closed',
  });

  const availableDifficulties = useMemo<DifficultyKey[]>(
    () => (soulsMode ? DIFF_KEYS : DIFF_KEYS.filter((k) => k !== 'souls')),
    [soulsMode],
  );

  // Fall back from souls when soulsMode is disabled
  useEffect(() => {
    if (!soulsMode && difficulty === 'souls') {
      setDifficulty('hard');
    }
  }, [soulsMode, difficulty, setDifficulty]);

  const currentBest = bestScores[difficulty] ?? 0;
  const isOverlayVisible = state !== 'play' || settingsView !== 'closed';
  const hasLeaderboard = !!leaderboard;
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
            difficultyVisible={state !== 'idle'}
            onDifficultyClick={toggleSettings}
            nickname={nickname ?? null}
          />
        }
        footer={null}
      >
        <GameCanvas ref={canvasRef} blurred={isOverlayVisible} />
        <FpsCounter fps={fps} visible={showFps} />
        <TitleScreen visible={state === 'idle'} bestScore={currentBest} onPlay={handlePlay} />
        <GameOverScreen visible={state === 'dead'} score={score} bestScore={currentBest} />
        <SettingsMenu
          visible={settingsView === 'menu'}
          nickname={nickname ?? null}
          onDifficultyClick={openDifficultyFromMenu}
          onNicknameClear={handleNicknameClear}
          onClose={handleSettingsClose}
        />
        <DifficultyPicker
          currentDifficulty={difficulty}
          bestScores={bestScores}
          visible={settingsView === 'difficulty'}
          onSelect={handleDifficultySelect}
          onClose={handleSettingsClose}
          availableDifficulties={availableDifficulties}
        />
        <ResetConfirmModal
          visible={settingsView === 'confirm-reset'}
          onConfirm={handleResetConfirm}
          onCancel={handleResetCancel}
        />
        {hasLeaderboard && !leaderboardExpanded && (
          <LeaderboardOverlay leaderboard={leaderboard} gameState={state} />
        )}
        {hasCallbacks && (
          <NicknameModal
            visible={lb.showNicknameModal}
            value={lb.nicknameValue}
            onChange={lb.handleNicknameChange}
            onSubmit={lb.handleNicknameSubmit}
            onClose={lb.closeNicknameModal}
            error={lb.nicknameError}
            checking={lb.nicknameChecking}
          />
        )}
      </GameLayout>
    </GameErrorBoundary>
  );
}
