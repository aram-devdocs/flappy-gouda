import type { DifficultyKey } from '@repo/types';
import { HeartIcon } from '../atoms/HeartIcon.js';
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
      <HeartIcon size={18} color="var(--fn-magenta, #D76EFF)" />
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
