import type { DifficultyKey, LeaderboardConnectionStatus, LeaderboardEntry } from '@repo/types';
import {
  DIFF_LABELS,
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  RADIUS,
  RGBA_TOKENS,
  SPACING,
  STATUS_COLORS,
  Z_INDEX,
  cssVar,
} from '@repo/types';
import { LeaderboardEntryRow } from '../molecules/LeaderboardEntryRow.js';

/** Props for {@link LeaderboardBottomSheet}. */
export interface LeaderboardBottomSheetProps {
  /** Whether the sheet is visible. */
  visible: boolean;
  /** Ordered list of leaderboard entries. */
  entries: LeaderboardEntry[];
  /** Current player's entry (pinned at bottom if not in list). */
  playerEntry: LeaderboardEntry | null;
  /** Whether leaderboard data is loading. */
  isLoading: boolean;
  /** Current difficulty filter. */
  difficulty: DifficultyKey;
  /** Real-time connection status. */
  connectionStatus: LeaderboardConnectionStatus;
}

const DOT_COLORS: Record<LeaderboardConnectionStatus, string> = {
  connected: STATUS_COLORS.success,
  connecting: STATUS_COLORS.warning,
  error: STATUS_COLORS.error,
  disconnected: STATUS_COLORS.neutral,
};

/** Full leaderboard as a bottom sheet that slides up from the game's bottom edge. */
export function LeaderboardBottomSheet({
  visible,
  entries,
  playerEntry,
  isLoading,
  difficulty,
  connectionStatus,
}: LeaderboardBottomSheetProps) {
  const playerInList = playerEntry ? entries.some((e) => e.id === playerEntry.id) : true;

  return (
    <div
      aria-label="Leaderboard"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 'min(70%, 400px)',
        background: `${cssVar('white')}f7`,
        boxShadow: visible ? `0 -4px 24px ${RGBA_TOKENS.shadowLg}` : 'none',
        borderTop: `2px solid ${RGBA_TOKENS.violetBorderSubtle}`,
        borderRadius: `${RADIUS.xl} ${RADIUS.xl} 0 0`,
        zIndex: Z_INDEX.overlay,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        visibility: visible ? 'visible' : 'hidden',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Drag handle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: `${SPACING[1.5]} 0 0`,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: RADIUS.pill,
            background: RGBA_TOKENS.shadowSm,
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${SPACING[1.5]} ${SPACING[3]}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
          <span
            style={{
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.extrabold,
              color: cssVar('navy'),
            }}
          >
            {DIFF_LABELS[difficulty]}
          </span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: DOT_COLORS[connectionStatus],
              display: 'block',
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${SPACING[1]}` }}>
        {isLoading && <p style={emptyStyle}>Loading...</p>}
        {!isLoading && entries.length === 0 && <p style={emptyStyle}>No scores yet</p>}
        {!isLoading &&
          entries.map((entry) => (
            <LeaderboardEntryRow
              key={entry.id}
              entry={entry}
              isPlayer={playerEntry?.id === entry.id}
            />
          ))}
      </div>

      {/* Player pinned at bottom */}
      {!isLoading && playerEntry && !playerInList && (
        <div
          style={{
            borderTop: `1px solid ${RGBA_TOKENS.shadowSm}`,
            padding: SPACING[1],
            flexShrink: 0,
          }}
        >
          <LeaderboardEntryRow entry={playerEntry} isPlayer isNew={false} />
        </div>
      )}
    </div>
  );
}

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: FONT_SIZE.md,
  color: cssVar('navy'),
  opacity: OPACITY.soft,
  padding: `${SPACING[6]} 0`,
  margin: 0,
};
