import type { DifficultyKey } from '@repo/types';
import { FONT_SIZE, FONT_WEIGHT, OPACITY, RGBA_TOKENS, SPACING, cssVar } from '@repo/types';
import { CheeseIcon } from '../atoms/CheeseIcon';
import { DifficultyBadge } from '../molecules/DifficultyBadge';

/** Props for {@link GameHeader}. */
export interface GameHeaderProps {
  /** Brand name displayed next to the icon. Empty or omitted hides the label. */
  brandName?: string;
  /** Currently active difficulty level. */
  difficulty: DifficultyKey;
  /** Player's best score for the current difficulty. */
  bestScore: number;
  /** Whether the difficulty badge is shown. */
  difficultyVisible: boolean;
  /** Called when the difficulty badge is clicked. */
  onDifficultyClick: () => void;
  /** Player's current nickname. Shown next to the best score. */
  nickname?: string | null;
}

/** Header bar with cheese icon, optional brand text, difficulty badge, and best score. */
export function GameHeader({
  brandName,
  difficulty,
  bestScore,
  difficultyVisible,
  onDifficultyClick,
  nickname,
}: GameHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[2],
        padding: `${SPACING[2]} ${SPACING[3]}`,
        background: RGBA_TOKENS.violetBorderSubtle,
      }}
    >
      <CheeseIcon size={18} color={cssVar('magenta')} />
      {brandName && (
        <span
          style={{
            fontWeight: FONT_WEIGHT.semibold,
            fontSize: FONT_SIZE.xl,
            color: cssVar('navy'),
          }}
        >
          {brandName}
        </span>
      )}
      <DifficultyBadge
        difficulty={difficulty}
        visible={difficultyVisible}
        onClick={onDifficultyClick}
      />
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
        {nickname && (
          <span
            style={{
              fontSize: FONT_SIZE['2xs'],
              fontWeight: FONT_WEIGHT.semibold,
              color: cssVar('violet'),
            }}
          >
            {nickname}
          </span>
        )}
        <span
          style={{
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.semibold,
            color: cssVar('navy'),
            opacity: bestScore > 0 ? OPACITY.prominent : OPACITY.hidden,
          }}
        >
          {bestScore > 0 ? `Best: ${bestScore}` : ''}
        </span>
      </div>
    </div>
  );
}
