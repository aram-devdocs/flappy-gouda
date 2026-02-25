import type { DebugMetricsSnapshot } from '@repo/types';
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
import { DebugSparkline } from '../atoms/DebugSparkline';

/** Props for {@link DebugBottomSheet}. */
export interface DebugBottomSheetProps {
  /** Whether the sheet is visible. */
  visible: boolean;
  /** Current debug metrics snapshot. */
  metrics: DebugMetricsSnapshot;
  /** Whether a recording session is active. */
  isRecording: boolean;
}

const JANK_MS = 33.3;
const SPARKLINE_MAX = 80;
const MONO = FONT_FAMILY.mono;
const LABEL: React.CSSProperties = {
  fontSize: FONT_SIZE['2xs'],
  color: STATUS_COLORS.neutral,
  fontWeight: FONT_WEIGHT.normal,
};
const VAL: React.CSSProperties = { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold };

/** Compact debug metrics bottom sheet for mobile. Display-only with pointer-events passthrough. */
export function DebugBottomSheet({ visible, metrics, isRecording }: DebugBottomSheetProps) {
  const { frameStats: fs, entityCounts: ec, sparkline } = metrics;

  return (
    <div
      aria-label="Debug metrics"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 'min(55%, 300px)',
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
        fontFamily: MONO,
        fontSize: FONT_SIZE.xs,
        color: cssVar('navy'),
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
          padding: `${SPACING[1]} ${SPACING[3]}`,
          gap: SPACING[2],
        }}
      >
        <span style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md }}>Debug</span>
        {isRecording && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACING[1],
              fontSize: FONT_SIZE['2xs'],
              color: STATUS_COLORS.error,
              fontWeight: FONT_WEIGHT.bold,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: STATUS_COLORS.error,
                display: 'inline-block',
              }}
            />
            REC
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: `0 ${SPACING[3]}`, overflowY: 'auto', flex: 1 }}>
        <DebugSparkline
          values={sparkline}
          maxValue={SPARKLINE_MAX}
          width={240}
          height={32}
          jankThreshold={JANK_MS}
        />
        <div style={{ display: 'flex', gap: SPACING[2], marginTop: SPACING[1], flexWrap: 'wrap' }}>
          <Stat label="FPS" value={fs.currentFps} />
          <Stat label="avg" value={`${fs.avgFrameMs}ms`} />
          <Stat label="min" value={`${fs.minFrameMs}ms`} />
          <Stat label="max" value={`${fs.maxFrameMs}ms`} />
          <Stat label="jank" value={fs.jankCount} warn={fs.jankCountWindow > 0} />
          <Stat label="update" value={`${fs.avgUpdateMs}ms`} />
          <Stat label="draw" value={`${fs.avgDrawMs}ms`} />
        </div>
        <div style={{ display: 'flex', gap: SPACING[2], marginTop: SPACING[2], flexWrap: 'wrap' }}>
          <Stat label="pipes" value={ec.pipes} />
          <Stat label="clouds" value={ec.clouds} />
          <Stat label="skyline" value={ec.skylineSegments} />
          <Stat label="bldg" value={ec.buildings} />
          <Stat label="trees" value={ec.trees} />
          <Stat label="planes" value={ec.planes} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div>
      <div style={LABEL}>{label}</div>
      <div style={{ ...VAL, color: warn ? STATUS_COLORS.error : undefined }}>{value}</div>
    </div>
  );
}
