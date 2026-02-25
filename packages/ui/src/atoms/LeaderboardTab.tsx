import type { LeaderboardConnectionStatus } from '@repo/types';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACING,
  STATUS_COLORS,
  Z_INDEX,
  cssVar,
} from '@repo/types';
import type React from 'react';

/** Props for {@link LeaderboardTab}. */
export interface LeaderboardTabProps {
  /** Whether the tab is shown. */
  visible: boolean;
  /** Whether the leaderboard panel is currently expanded. */
  expanded: boolean;
  /** Called when the tab is clicked. */
  onClick: () => void;
  /** Real-time connection status for the leaderboard backend. */
  connectionStatus: LeaderboardConnectionStatus;
  /** Whether a new score was just submitted. */
  hasNewScore?: boolean;
  /** Optional style overrides merged onto the root element. */
  style?: React.CSSProperties;
}

const CONNECTION_DOT_COLORS: Record<LeaderboardConnectionStatus, string> = {
  connected: STATUS_COLORS.success,
  connecting: STATUS_COLORS.warning,
  error: STATUS_COLORS.error,
  disconnected: STATUS_COLORS.neutral,
};

/** Clickable tab on the right edge of the game with vertically oriented "SCORES" text. */
export function LeaderboardTab({
  visible,
  expanded,
  onClick,
  connectionStatus,
  hasNewScore,
  style: styleOverride,
}: LeaderboardTabProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Toggle leaderboard"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        background: cssVar('violet'),
        color: cssVar('white'),
        border: 'none',
        borderRadius: `${RADIUS.lg} 0 0 ${RADIUS.lg}`,
        padding: `${SPACING[2]} ${SPACING[1.5]}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING[1.5],
        transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: expanded ? 0.8 : 1,
        zIndex: Z_INDEX.tab,
        ...styleOverride,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: CONNECTION_DOT_COLORS[connectionStatus],
          display: 'block',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          writingMode: 'vertical-rl',
          fontSize: FONT_SIZE.xs,
          fontWeight: FONT_WEIGHT.bold,
          letterSpacing: '1.5px',
          lineHeight: 1,
        }}
      >
        {hasNewScore ? 'NEW!' : 'SCORES'}
      </span>
    </button>
  );
}
