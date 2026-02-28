import { RADIUS } from '@repo/types';
import { forwardRef } from 'react';

/** Props for {@link GameCanvas}. */
export interface GameCanvasProps {
  /** Additional CSS class name for the container element. */
  className?: string;
  /** When true, applies a blur filter over the canvas stack (e.g. behind modals). */
  blurred?: boolean;
}

/**
 * Three stacked canvas elements for layered rendering.
 *
 * The background canvas is in normal flow and sizes the container.
 * Midground and foreground canvases overlay it via absolute positioning.
 * The foreground canvas receives pointer events and accessibility focus.
 */
export const GameCanvas = forwardRef<HTMLDivElement, GameCanvasProps>(
  ({ className, blurred }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          display: 'inline-block',
          maxWidth: '100%',
          borderRadius: RADIUS.xl,
          overflow: 'hidden',
          filter: blurred ? 'blur(4px)' : 'none',
          transition: 'filter 0.3s ease-out',
        }}
      >
        <canvas data-layer="bg" style={{ display: 'block' }} />
        <canvas
          data-layer="mg"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
        <canvas
          data-layer="fg"
          aria-label="Flappy Gouda game"
          role="img"
          tabIndex={0}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    );
  },
);

GameCanvas.displayName = 'GameCanvas';
