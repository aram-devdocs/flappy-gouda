import { useGameEngine, useGameInput } from '@repo/hooks';
import type { FlappyNatureGameProps } from '@repo/types';
import {
  DifficultyBadge,
  DifficultyPicker,
  FpsCounter,
  GameCanvas,
  GameContainer,
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
      <GameContainer colors={colors} className={className}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 32 32"
            role="img"
            aria-label="Heart icon"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M16 1.88647C8.01418 1.88647 2 7.9574 2 15.9999C2 24.0425 8.01418 30.1134 16 30.1134C23.9858 30.1134 30 24.0425 30 15.9999C30 7.9574 23.9858 1.88647 16 1.88647ZM23.1773 16.851L16.5957 23.4326C16.2553 23.773 15.6879 23.773 15.3475 23.4326L8.9078 16.9929C7.33333 15.4184 7.06383 12.8794 8.42553 11.1205C10.0709 8.99286 13.1489 8.85101 14.9929 10.695L15.9716 11.6737L16.8511 10.7943C18.539 9.09215 21.3333 8.92194 23.078 10.5673C24.8794 12.2695 24.922 15.1063 23.1773 16.851Z"
              fill="var(--fn-magenta, #D76EFF)"
            />
          </svg>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--fn-navy, #090949)' }}>
            Flappy Nature
          </span>
          <DifficultyBadge
            difficulty={difficulty}
            visible={state !== 'idle'}
            onClick={togglePicker}
          />
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--fn-navy, #090949)',
              opacity: currentBest > 0 ? 0.7 : 0,
            }}
          >
            {currentBest > 0 ? `Best: ${currentBest}` : ''}
          </span>
        </div>

        <div style={{ position: 'relative' }}>
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
        </div>

        <div
          style={{
            padding: '6px 12px',
            fontSize: '10px',
            textAlign: 'center',
            color: 'var(--fn-navy, #090949)',
            opacity: 0.4,
          }}
        >
          Made with ♥ by the Finance Team
        </div>
      </GameContainer>
    </GameErrorBoundary>
  );
}
