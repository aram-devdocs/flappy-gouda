import { useCallback, useEffect } from 'react';

/** Options for {@link useGameInput}. */
interface UseGameInputOptions {
  onFlap: () => void;
  onEscape?: () => void;
  onCanvasInteract?: (x: number, y: number) => boolean;
  onCanvasHover?: (x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled?: boolean;
}

/**
 * Bind keyboard, click, and touch input to game actions.
 * Listens for Space/Enter/click/touch to flap and Escape to dismiss.
 */
export function useGameInput({
  onFlap,
  onEscape,
  onCanvasInteract,
  onCanvasHover,
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

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      if (onCanvasInteract?.(e.offsetX, e.offsetY)) return;
      onFlap();
    },
    [onFlap, onCanvasInteract, enabled],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (touch && onCanvasInteract) {
        const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
        if (onCanvasInteract(touch.clientX - rect.left, touch.clientY - rect.top)) return;
      }
      onFlap();
    },
    [onFlap, onCanvasInteract, enabled],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      onCanvasHover?.(e.offsetX, e.offsetY);
    },
    [onCanvasHover],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleKeyDown, handleClick, handleTouchStart, handleMouseMove, canvasRef]);
}
