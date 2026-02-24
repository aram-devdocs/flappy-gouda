import type { DifficultyKey } from '@repo/types';
import { DifficultyBadge } from '../molecules/DifficultyBadge.js';

/** Props for {@link GameHeader}. */
export interface GameHeaderProps {
  /** Brand name displayed next to the icon. */
  brandName: string;
  /** Currently active difficulty level. */
  difficulty: DifficultyKey;
  /** Player's best score for the current difficulty. */
  bestScore: number;
  /** Whether the difficulty badge is shown. */
  difficultyVisible: boolean;
  /** Called when the difficulty badge is clicked. */
  onDifficultyClick: () => void;
}

/** Header bar with heart icon, brand text, difficulty badge, and best score. */
export function GameHeader({
  brandName,
  difficulty,
  bestScore,
  difficultyVisible,
  onDifficultyClick,
}: GameHeaderProps) {
  return (
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
        {brandName}
      </span>
      <DifficultyBadge
        difficulty={difficulty}
        visible={difficultyVisible}
        onClick={onDifficultyClick}
      />
      <span
        style={{
          marginLeft: 'auto',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--fn-navy, #090949)',
          opacity: bestScore > 0 ? 0.7 : 0,
        }}
      >
        {bestScore > 0 ? `Best: ${bestScore}` : ''}
      </span>
    </div>
  );
}
