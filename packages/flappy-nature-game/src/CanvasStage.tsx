import { useEffect, useRef } from 'react';

interface CanvasStageProps {
  width: number;
  height: number;
  backgroundColor?: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export function CanvasStage({ width, height, backgroundColor, draw }: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    draw(ctx);

    return () => {
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height, backgroundColor, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        border: '1px solid #e0e0e0',
        borderRadius: 4,
      }}
    />
  );
}
