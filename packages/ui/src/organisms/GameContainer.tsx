import { DEFAULT_GAME_COLORS } from '@repo/types';
import type { GameColors } from '@repo/types';
import type { ReactNode } from 'react';

/** Props for {@link GameContainer}. */
interface GameContainerProps {
  /** Optional theme color overrides. */
  colors?: Partial<GameColors>;
  /** Additional CSS class name for the outer wrapper. */
  className?: string;
  /** Content rendered inside the container. */
  children: ReactNode;
}

/** Outer wrapper that sets CSS custom properties for the game's color theme. */
export function GameContainer({ colors, className, children }: GameContainerProps) {
  const merged = { ...DEFAULT_GAME_COLORS, ...colors };

  return (
    <main
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
    </main>
  );
}
