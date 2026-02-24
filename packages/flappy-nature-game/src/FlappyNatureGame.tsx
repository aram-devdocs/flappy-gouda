import { useGameEngine, useGameInput } from '@repo/hooks';
import type { FlappyNatureGameProps } from '@repo/types';
import {
  DifficultyPicker,
  FpsCounter,
  GameCanvas,
  GameFooter,
  GameHeader,
  GameLayout,
  GameOverScreen,
  TitleScreen,
} from '@repo/ui';
import { useCallback, useEffect, useState } from 'react';
import { GameErrorBoundary } from './GameErrorBoundary.js';

/** Top-level game component that wires engine, hooks, and UI together. */
export function FlappyNatureGame({
  colors,
  bannerTexts,
  fontFamily,
  difficulty: initialDifficulty,
  onStateChange,
  onScoreChange,
  onBestScoreChange,
  className,
  showFps = false,
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

  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);
  useEffect(() => {
    onBestScoreChange?.(bestScores);
  }, [bestScores, onBestScoreChange]);

  const handleFlap = useCallback(() => {
    if (pickerOpen) return;
    flap();
  }, [flap, pickerOpen]);

  const handleEscape = useCallback(() => {
    if (pickerOpen) {
      setPickerOpen(false);
      resume();
    }
  }, [pickerOpen, resume]);

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

  return (
    <GameErrorBoundary>
      <GameLayout
        colors={colors}
        className={className}
        header={
          <GameHeader
            brandName="Flappy Nature"
            difficulty={difficulty}
            bestScore={currentBest}
            difficultyVisible={state !== 'idle'}
            onDifficultyClick={togglePicker}
          />
        }
        footer={<GameFooter text="Made with ♥ by the Finance Team" />}
      >
        <GameCanvas ref={canvasRef} />
        <FpsCounter fps={fps} visible={showFps} />
        <TitleScreen visible={state === 'idle'} bestScore={currentBest} onPlay={handlePlay} />
        <GameOverScreen visible={state === 'dead'} score={score} bestScore={currentBest} />
        <DifficultyPicker
          currentDifficulty={difficulty}
          bestScores={bestScores}
          visible={pickerOpen}
          onSelect={handleDifficultySelect}
          onClose={handlePickerClose}
        />
      </GameLayout>
    </GameErrorBoundary>
  );
}
