import type { DifficultyKey, LeaderboardConnectionStatus, LeaderboardEntry } from '@repo/types';
import {
  DIFF_LABELS,
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  RADIUS,
  RGBA_TOKENS,
  SHADOW,
  SPACING,
  STATUS_COLORS,
  cssVar,
} from '@repo/types';
import { LeaderboardEntryRow } from '../molecules/LeaderboardEntryRow.js';

/** Props for {@link LeaderboardSidebar}. */
export interface LeaderboardSidebarProps {
  /** Whether the panel is expanded/visible. */
  visible: boolean;
  /** Ordered list of leaderboard entries to display. */
  entries: LeaderboardEntry[];
  /** Current player's entry (shown at bottom if not in visible list). */
  playerEntry: LeaderboardEntry | null;
  /** Whether leaderboard data is currently loading. */
  isLoading: boolean;
  /** Current difficulty filter. */
  difficulty: DifficultyKey;
  /** Real-time connection status. */
  connectionStatus: LeaderboardConnectionStatus;
}

const CONNECTION_DOT_COLORS: Record<LeaderboardConnectionStatus, string> = {
  connected: STATUS_COLORS.success,
  connecting: STATUS_COLORS.warning,
  error: STATUS_COLORS.error,
  disconnected: STATUS_COLORS.neutral,
};

/** Sliding leaderboard panel that extends from the right edge of the game. */
export function LeaderboardSidebar({
  visible,
  entries,
  playerEntry,
  isLoading,
  difficulty,
  connectionStatus,
}: LeaderboardSidebarProps) {
  const playerInList = playerEntry ? entries.some((e) => e.id === playerEntry.id) : true;

  return (
    <aside
      aria-label="Leaderboard"
      style={{
        width: '220px',
        height: '100%',
        background: `${cssVar('white')}f7`,
        boxShadow: visible ? SHADOW.cardHeavy : 'none',
        borderRadius: `0 ${RADIUS.xl} ${RADIUS.xl} 0`,
        border: `2px solid ${RGBA_TOKENS.violetBorderSubtle}`,
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: visible ? 'translateX(0)' : 'translateX(-100%)',
        transition:
          'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${SPACING[2]} ${SPACING[3]}`,
          borderBottom: `1px solid ${RGBA_TOKENS.shadowSm}`,
          flexShrink: 0,
        }}
      >
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
            background: CONNECTION_DOT_COLORS[connectionStatus],
            display: 'block',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: SPACING[1] }}>
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

      {/* Player entry pinned at bottom */}
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
    </aside>
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
