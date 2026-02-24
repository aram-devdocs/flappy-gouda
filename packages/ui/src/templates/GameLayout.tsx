import type { GameColors } from '@repo/types';
import type { ReactNode } from 'react';
import { GameContainer } from '../organisms/GameContainer.js';

/** Props for {@link GameLayout}. */
export interface GameLayoutProps {
  /** Header content rendered above the game area. */
  header: ReactNode;
  /** Main game content (canvas, overlays) rendered in a position:relative wrapper. */
  children: ReactNode;
  /** Footer content rendered below the game area. */
  footer: ReactNode;
  /** Optional theme color overrides. */
  colors?: Partial<GameColors>;
  /** Additional CSS class name. */
  className?: string;
}

/** Structural template composing header, game area, and footer inside a GameContainer. */
export function GameLayout({ header, children, footer, colors, className }: GameLayoutProps) {
  return (
    <GameContainer colors={colors} className={className}>
      {header}
      <div style={{ position: 'relative' }}>{children}</div>
      {footer}
    </GameContainer>
  );
}
