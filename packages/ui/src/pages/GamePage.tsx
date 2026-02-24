import { DESIGN_TOKENS } from '@repo/types';
import type { ReactNode } from 'react';

/** Props for {@link GamePage}. */
export interface GamePageProps {
  /** Page title displayed above the game. */
  title: string;
  /** Page content (typically the game component). */
  children: ReactNode;
}

/** Full-page centered layout for hosting the game. */
export function GamePage({ title, children }: GamePageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: '"Poppins", "Inter", system-ui, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: DESIGN_TOKENS.colors.navy,
          marginBottom: '16px',
        }}
      >
        {title}
      </h1>
      {children}
    </div>
  );
}
