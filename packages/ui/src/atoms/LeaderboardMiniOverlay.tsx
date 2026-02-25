import type { LeaderboardEntry } from '@repo/types';
import {
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  RGBA_TOKENS,
  SPACING,
  STATUS_COLORS,
  Z_INDEX,
  cssVar,
} from '@repo/types';

/** Props for {@link LeaderboardMiniOverlay}. */
export interface LeaderboardMiniOverlayProps {
  /** Top entries to display (caller slices to desired count). */
  entries: LeaderboardEntry[];
  /** Whether the overlay is visible. */
  visible: boolean;
  /** Current player's entry ID, to highlight if they're in the list. */
  playerEntryId: string | null;
  /** Set of entry IDs that have live (in-game) scores. */
  liveEntryIds?: ReadonlySet<string>;
}

const RANK_MEDALS: Record<number, string> = {
  1: '\u{1F947}',
  2: '\u{1F948}',
  3: '\u{1F949}',
};

/** Compact top-3 leaderboard overlay shown during gameplay. */
export function LeaderboardMiniOverlay({
  entries,
  visible,
  playerEntryId,
  liveEntryIds,
}: LeaderboardMiniOverlayProps) {
  if (!visible || entries.length === 0) return null;

  return (
    <div
      aria-label="Top scores"
      style={{
        position: 'absolute',
        top: SPACING[8],
        right: SPACING[2],
        zIndex: Z_INDEX.miniOverlay,
        background: RGBA_TOKENS.scrimMedium,
        borderRadius: RADIUS.lg,
        padding: `${SPACING[1]} ${SPACING[2]}`,
        minWidth: '110px',
        pointerEvents: 'none',
      }}
    >
      {entries.map((entry) => {
        const isPlayer = entry.id === playerEntryId;
        const isLive = liveEntryIds?.has(entry.id) ?? false;
        return (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACING[1.5],
              padding: `${SPACING[0.5]} 0`,
              opacity: isPlayer ? 1 : 0.85,
            }}
          >
            <span style={{ width: '18px', textAlign: 'center', fontSize: FONT_SIZE.xs }}>
              {RANK_MEDALS[entry.rank] ?? entry.rank}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: FONT_SIZE.xs,
                fontWeight: isPlayer ? FONT_WEIGHT.bold : FONT_WEIGHT.normal,
                fontFamily: FONT_FAMILY.mono,
                color: cssVar('white'),
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
                  background: STATUS_COLORS.success,
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontSize: FONT_SIZE.xs,
                fontWeight: FONT_WEIGHT.bold,
                color: cssVar('white'),
              }}
            >
              {entry.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
