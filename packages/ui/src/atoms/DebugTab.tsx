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

/** Props for {@link DebugTab}. */
export interface DebugTabProps {
  /** Whether the tab is shown. */
  visible: boolean;
  /** Whether the debug panel is currently expanded. */
  expanded: boolean;
  /** Whether a recording session is active. */
  isRecording: boolean;
  /** Called when the tab is clicked. */
  onClick: () => void;
  /** Optional style overrides. */
  style?: React.CSSProperties;
}

/** Clickable tab on the left edge of the game with vertically oriented "DEBUG" / "REC" text. */
export function DebugTab({
  visible,
  expanded,
  isRecording,
  onClick,
  style: styleOverride,
}: DebugTabProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Toggle debug panel"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        background: cssVar('navy'),
        color: cssVar('white'),
        border: 'none',
        borderRadius: `0 ${RADIUS.lg} ${RADIUS.lg} 0`,
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
          background: isRecording ? STATUS_COLORS.error : STATUS_COLORS.neutral,
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
        {isRecording ? 'REC' : 'DEBUG'}
      </span>
    </button>
  );
}
