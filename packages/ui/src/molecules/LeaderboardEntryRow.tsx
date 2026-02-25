import type { LeaderboardEntry } from '@repo/types';
import {
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  RGBA_TOKENS,
  SPACING,
  STATUS_COLORS,
  cssVar,
} from '@repo/types';

/** Props for {@link LeaderboardEntryRow}. */
export interface LeaderboardEntryRowProps {
  /** Leaderboard entry data to display. */
  entry: LeaderboardEntry;
  /** Whether this entry belongs to the current player. */
  isPlayer: boolean;
  /** Whether this is a newly submitted score (fade-in effect). */
  isNew?: boolean;
  /** Absolute Y offset in px. When set, the row is absolutely positioned. */
  yOffset?: number;
  /** Whether this is a live (in-game, not yet persisted) score. */
  isLive?: boolean;
}

const RANK_MEDALS: Record<number, string> = {
  1: '\u{1F947}',
  2: '\u{1F948}',
  3: '\u{1F949}',
};

/** Single score row in the leaderboard list. */
export function LeaderboardEntryRow({
  entry,
  isPlayer,
  isNew,
  yOffset,
  isLive,
}: LeaderboardEntryRowProps) {
  const highlight = isNew
    ? RGBA_TOKENS.violetBgSubtle.replace('0.08', '0.14')
    : isPlayer
      ? RGBA_TOKENS.violetBgSubtle
      : 'transparent';

  const positionStyles: React.CSSProperties =
    yOffset !== undefined
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${yOffset}px)`,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), background 0.3s ease',
        }
      : {};

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${SPACING[1.5]} ${SPACING[2]}`,
        borderRadius: RADIUS.sm,
        background: highlight,
        gap: SPACING[2],
        ...positionStyles,
      }}
    >
      <span
        style={{
          width: '28px',
          textAlign: 'center',
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.semibold,
          color: cssVar('navy'),
          flexShrink: 0,
        }}
      >
        {RANK_MEDALS[entry.rank] ?? entry.rank}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: FONT_SIZE.md,
          fontWeight: isPlayer ? FONT_WEIGHT.bold : FONT_WEIGHT.normal,
          color: cssVar('navy'),
          fontFamily: FONT_FAMILY.mono,
          letterSpacing: '1px',
        }}
      >
        {entry.nickname}
      </span>
      {isLive && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: STATUS_COLORS.success,
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.bold,
          color: cssVar('violet'),
          flexShrink: 0,
        }}
      >
        {entry.score}
      </span>
    </div>
  );
}
