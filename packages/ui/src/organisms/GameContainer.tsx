import type { GameColors } from '@repo/types';
import type { ReactNode } from 'react';

interface GameContainerProps {
  colors?: Partial<GameColors>;
  className?: string;
  children: ReactNode;
}

const DEFAULT_COLORS: GameColors = {
  navy: '#090949',
  violet: '#6500D9',
  cyan: '#00D9FF',
  magenta: '#D76EFF',
  light: '#FBF6F6',
  white: '#FFFFFF',
  midviolet: '#4B00A0',
};

export function GameContainer({ colors, className, children }: GameContainerProps) {
  const merged = { ...DEFAULT_COLORS, ...colors };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        borderRadius: '12px',
        overflow: 'hidden',
        // CSS custom properties for sub-components
        ['--fn-navy' as string]: merged.navy,
        ['--fn-violet' as string]: merged.violet,
        ['--fn-cyan' as string]: merged.cyan,
        ['--fn-magenta' as string]: merged.magenta,
        ['--fn-light' as string]: merged.light,
        ['--fn-white' as string]: merged.white,
        ['--fn-midviolet' as string]: merged.midviolet,
      }}
    >
      {children}
    </div>
  );
}
