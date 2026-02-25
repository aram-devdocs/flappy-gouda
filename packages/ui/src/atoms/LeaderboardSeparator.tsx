import { FONT_SIZE, FONT_WEIGHT, OPACITY, SPACING, cssVar } from '@repo/types';

/** Props for {@link LeaderboardSeparator}. */
export interface LeaderboardSeparatorProps {
  /** Rank of the entry above this separator. */
  rankAbove: number;
  /** Rank of the entry below this separator. */
  rankBelow: number;
  /** Absolute Y offset in px. When set, the row is absolutely positioned. */
  yOffset?: number;
}

/** Visual separator between non-contiguous leaderboard regions. */
export function LeaderboardSeparator({ rankAbove, rankBelow, yOffset }: LeaderboardSeparatorProps) {
  const gap = rankBelow - rankAbove - 1;
  const positionStyles: React.CSSProperties =
    yOffset !== undefined
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${yOffset}px)`,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }
      : {};

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING[2],
        padding: `${SPACING[1]} ${SPACING[2]}`,
        ...positionStyles,
      }}
    >
      <span
        style={{
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.normal,
          color: cssVar('navy'),
          opacity: OPACITY.soft,
        }}
      >
        ··· {gap} more ···
      </span>
    </div>
  );
}
