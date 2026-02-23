import { useCallback, useEffect } from 'react';

interface UseGameInputOptions {
  onFlap: () => void;
  onEscape?: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled?: boolean;
}

export function useGameInput({
  onFlap,
  onEscape,
  canvasRef,
  enabled = true,
}: UseGameInputOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (e.repeat) return;
        onFlap();
      }
    },
    [onFlap, onEscape, enabled],
  );

  const handleClick = useCallback(() => {
    if (!enabled) return;
    onFlap();
  }, [onFlap, enabled]);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      e.preventDefault();
      onFlap();
    },
    [onFlap, enabled],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [handleKeyDown, handleClick, handleTouchStart, canvasRef]);
}
