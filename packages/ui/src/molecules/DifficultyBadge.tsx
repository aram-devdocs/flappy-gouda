import type { DifficultyKey } from '@repo/types';
import {
  BORDER_WIDTH,
  DIFF_LABELS,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  RADIUS,
  RGBA_TOKENS,
  SPACING,
  cssVar,
} from '@repo/types';

/** Props for {@link DifficultyBadge}. */
interface DifficultyBadgeProps {
  /** Currently active difficulty level. */
  difficulty: DifficultyKey;
  /** Whether the badge is shown. */
  visible: boolean;
  /** Called when the badge is clicked (typically opens the difficulty picker). */
  onClick: () => void;
}

/** Small pill button showing the current difficulty level. */
export function DifficultyBadge({ difficulty, visible, onClick }: DifficultyBadgeProps) {
  if (!visible) return null;
  const isSouls = difficulty === 'souls';

  return (
    <button
      type="button"
      aria-label={`Difficulty: ${DIFF_LABELS[difficulty]}`}
      onClick={onClick}
      style={{
        padding: `${SPACING[0.5]} ${SPACING[2.5]}`,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
        color: isSouls ? cssVar('souls') : cssVar('violet'),
        background: isSouls ? RGBA_TOKENS.soulsBgSubtle : RGBA_TOKENS.violetBgSubtle,
        border: `${BORDER_WIDTH.thin} solid ${isSouls ? RGBA_TOKENS.soulsBorderSubtle : RGBA_TOKENS.violetBorderSubtle}`,
        borderRadius: RADIUS.xl,
        cursor: 'pointer',
        lineHeight: LINE_HEIGHT.tight,
      }}
    >
      {DIFF_LABELS[difficulty]}
    </button>
  );
}
