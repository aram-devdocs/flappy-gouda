import type { DifficultyKey, LeaderboardWindowItem } from '@repo/types';
import {
  DIFF_LABELS,
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  RGBA_TOKENS,
  SHADOW,
  SPACING,
  Z_INDEX,
  cssVar,
} from '@repo/types';
import { LeaderboardSeparator } from '../atoms/LeaderboardSeparator';
import { LeaderboardEntryRow } from '../molecules/LeaderboardEntryRow';

const ROW_HEIGHT = 36;

/** Props for {@link LeaderboardPanel}. */
export interface LeaderboardPanelProps {
  /** Whether the panel is expanded. */
  visible: boolean;
  /** Windowed list of leaderboard items to display. */
  items: LeaderboardWindowItem[];
  /** Current player's entry ID, to highlight their row. */
  playerEntryId: string | null;
  /** Whether leaderboard data is currently loading. */
  isLoading: boolean;
  /** Called when the close button is clicked. */
  onClose: () => void;
  /** Current difficulty filter. */
  difficulty: DifficultyKey;
  /** Set of entry IDs that recently appeared (for fade-in). */
  newEntryIds?: ReadonlySet<string>;
}

/** Sliding leaderboard panel from the right edge of the game. */
export function LeaderboardPanel({
  visible,
  items,
  playerEntryId,
  isLoading,
  onClose,
  difficulty,
  newEntryIds,
}: LeaderboardPanelProps) {
  return (
    <div
      aria-label="Leaderboard"
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 'min(220px, 100%)',
        background: `${cssVar('white')}f7`,
        boxShadow: SHADOW.cardHeavy,
        zIndex: Z_INDEX.overlay,
        borderLeft: `2px solid ${RGBA_TOKENS.violetBorderSubtle}`,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
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
        <button
          type="button"
          aria-label="Close leaderboard"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: FONT_SIZE.xl,
            color: cssVar('navy'),
            opacity: OPACITY.soft,
            padding: SPACING[0.5],
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${SPACING[1]} ${SPACING[1]}`,
        }}
      >
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
