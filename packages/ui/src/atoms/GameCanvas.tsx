import { forwardRef } from 'react';

export interface GameCanvasProps {
  className?: string;
}

export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({ className }, ref) => {
  return (
    <canvas
      ref={ref}
      className={className}
      style={{
        display: 'block',
        maxWidth: '100%',
        borderRadius: '12px',
      }}
    />
  );
});

GameCanvas.displayName = 'GameCanvas';
