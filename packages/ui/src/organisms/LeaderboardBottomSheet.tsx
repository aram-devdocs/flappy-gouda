import type {
  DifficultyKey,
  LeaderboardConnectionStatus,
  LeaderboardWindowItem,
} from '@repo/types';
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
import { LeaderboardSeparator } from '../atoms/LeaderboardSeparator';
import { LeaderboardEntryRow } from '../molecules/LeaderboardEntryRow';

const ROW_HEIGHT = 36;

/** Props for {@link LeaderboardBottomSheet}. */
export interface LeaderboardBottomSheetProps {
  /** Whether the sheet is visible. */
  visible: boolean;
  /** Windowed list of leaderboard items. */
  items: LeaderboardWindowItem[];
  /** Current player's entry ID, to highlight their row. */
  playerEntryId: string | null;
  /** Whether leaderboard data is loading. */
  isLoading: boolean;
  /** Current difficulty filter. */
  difficulty: DifficultyKey;
  /** Real-time connection status. */
  connectionStatus: LeaderboardConnectionStatus;
  /** Set of entry IDs that recently appeared (for fade-in). */
  newEntryIds?: ReadonlySet<string>;
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
  items,
  playerEntryId,
  isLoading,
  difficulty,
  connectionStatus,
  newEntryIds,
}: LeaderboardBottomSheetProps) {
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: `${SPACING[1.5]} 0 0` }}>
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
        {!isLoading && items.length === 0 && <p style={emptyStyle}>No scores yet</p>}
        {!isLoading && items.length > 0 && (
          <div style={{ position: 'relative', height: items.length * ROW_HEIGHT }}>
            {items.map((item, index) => {
              if (item.type === 'separator') {
                return (
                  <LeaderboardSeparator
                    key={`sep-${item.rankAbove}-${item.rankBelow}`}
                    rankAbove={item.rankAbove}
                    rankBelow={item.rankBelow}
                    yOffset={index * ROW_HEIGHT}
                  />
                );
              }
              const { entry } = item;
              return (
                <LeaderboardEntryRow
                  key={entry.id}
                  entry={entry}
                  isPlayer={entry.id === playerEntryId}
                  isNew={newEntryIds?.has(entry.id)}
                  isLive={item.isLive}
                  yOffset={index * ROW_HEIGHT}
                />
              );
            })}
          </div>
        )}
      </div>
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
