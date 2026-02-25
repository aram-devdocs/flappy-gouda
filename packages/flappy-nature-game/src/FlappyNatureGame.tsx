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
import { useCallback, useEffect, useState } from 'react';
import { GameErrorBoundary } from './GameErrorBoundary.js';
import { LeaderboardOverlay } from './LeaderboardOverlay.js';
import { useLeaderboardState } from './useLeaderboardState.js';

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
  leaderboard,
  leaderboardCallbacks,
  nickname,
}: FlappyNatureGameProps) {
  const {
    canvasRef,
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
  });

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

  const handleFlap = useCallback(() => {
    if (pickerOpen) return;
    if (lb.leaderboardOpen) lb.closeLeaderboard();
    flap();
  }, [flap, pickerOpen, lb]);

  const handleEscape = useCallback(() => {
    if (lb.leaderboardOpen) {
      lb.closeLeaderboard();
      return;
    }
    if (pickerOpen) {
      setPickerOpen(false);
      resume();
    }
  }, [pickerOpen, resume, lb]);

  const togglePicker = useCallback(() => {
    if (pickerOpen) {
      setPickerOpen(false);
      resume();
    } else {
      pause();
      setPickerOpen(true);
    }
  }, [pickerOpen, pause, resume]);

  const onCanvasInteract = useCallback(
    (x: number, y: number): boolean => {
      if (handleCanvasClick(x, y)) {
        togglePicker();
        return true;
      }
      return false;
    },
    [handleCanvasClick, togglePicker],
  );

  const onCanvasHover = useCallback(
    (x: number, y: number) => {
      const hit = handleCanvasHover(x, y);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = hit ? 'pointer' : '';
    },
    [handleCanvasHover, canvasRef],
  );

  useGameInput({
    onFlap: handleFlap,
    onEscape: handleEscape,
    onCanvasInteract,
    onCanvasHover,
    canvasRef,
    enabled: !pickerOpen,
  });

  const handleDifficultySelect = useCallback(
    (key: typeof difficulty) => {
      setDifficulty(key);
      setPickerOpen(false);
    },
    [setDifficulty],
  );

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false);
    resume();
  }, [resume]);

  const handlePlay = useCallback(() => {
    flap();
  }, [flap]);

  const currentBest = bestScores[difficulty] ?? 0;
  const isOverlayVisible =
    state !== 'play' || pickerOpen || migration.showModal || lb.leaderboardOpen;
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
        {hasLeaderboard && (
          <LeaderboardOverlay leaderboard={leaderboard} lb={lb} difficulty={difficulty} />
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
