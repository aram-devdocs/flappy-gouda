import { useGameEngine, useGameInput, useScoreMigration } from '@repo/hooks';
import type { FlappyNatureGameProps } from '@repo/types';
import {
  DifficultyPicker,
  FpsCounter,
  GameCanvas,
  GameHeader,
  GameLayout,
  GameOverScreen,
  NicknameModal,
  ScoreMigrationModal,
  TitleScreen,
} from '@repo/ui';
import { useEffect, useState } from 'react';
import { GameErrorBoundary } from './GameErrorBoundary';
import { LeaderboardOverlay } from './LeaderboardOverlay';
import { useDebugBridge } from './useDebugBridge';
import { useGameCallbacks } from './useGameCallbacks';
import { useLeaderboardState } from './useLeaderboardState';

export function FlappyNatureGame({
  colors,
  bannerTexts,
  fontFamily,
  difficulty: initialDifficulty,
  onStateChange,
  onScoreChange,
  onBestScoreChange,
  onDifficultyChange,
  className,
  showFps = false,
  showDebug = false,
  onDebugMetrics,
  debugControlsRef,
  leaderboard,
  leaderboardCallbacks,
  leaderboardExpanded = false,
  nickname,
}: FlappyNatureGameProps) {
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
    bannerTexts,
    fontFamily,
    difficulty: initialDifficulty,
    enableDebug: showDebug,
  });

  useDebugBridge(engineRef, engineReady, showDebug, onDebugMetrics, debugControlsRef);
  const migration = useScoreMigration(bestScores);
  const [pickerOpen, setPickerOpen] = useState(false);
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
    togglePicker,
    onCanvasInteract,
    onCanvasHover,
    handleDifficultySelect,
    handlePickerClose,
    handlePlay,
  } = useGameCallbacks({
    flap,
    pause,
    resume,
    setDifficulty,
    handleCanvasClick,
    handleCanvasHover,
    canvasRef,
    pickerOpen,
    setPickerOpen,
  });

  useGameInput({
    onFlap: handleFlap,
    onEscape: handleEscape,
    onCanvasInteract,
    onCanvasHover,
    canvasRef,
    enabled: !pickerOpen,
  });

  const currentBest = bestScores[difficulty] ?? 0;
  const isOverlayVisible = state !== 'play' || pickerOpen || migration.showModal;
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
            onDifficultyClick={togglePicker}
          />
        }
        footer={null}
      >
        <GameCanvas ref={canvasRef} blurred={isOverlayVisible} />
        <FpsCounter fps={fps} visible={showFps} />
        <TitleScreen visible={state === 'idle'} bestScore={currentBest} onPlay={handlePlay} />
        <GameOverScreen visible={state === 'dead'} score={score} bestScore={currentBest} />
        <ScoreMigrationModal
          visible={migration.showModal}
          comparisons={migration.comparisons}
          onAccept={migration.accept}
          onDecline={migration.decline}
        />
        <DifficultyPicker
          currentDifficulty={difficulty}
          bestScores={bestScores}
          visible={pickerOpen}
          onSelect={handleDifficultySelect}
          onClose={handlePickerClose}
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
