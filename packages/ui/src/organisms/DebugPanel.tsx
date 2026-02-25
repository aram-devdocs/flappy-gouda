import type { DebugMetricsSnapshot } from '@repo/types';
import {
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  RGBA_TOKENS,
  SHADOW,
  SPACING,
  STATUS_COLORS,
  Z_INDEX,
  cssVar,
} from '@repo/types';
import { DebugSparkline } from '../atoms/DebugSparkline';
import { LABEL_STYLE, Stat, btnStyle, typeBadgeStyle } from '../atoms/DebugStat';

/** Props for {@link DebugPanel}. */
export interface DebugPanelProps {
  /** Whether the panel is visible (slides in from left). */
  visible: boolean;
  /** Current debug metrics snapshot. */
  metrics: DebugMetricsSnapshot;
  /** Whether a recording session is active. */
  isRecording: boolean;
  /** Whether a completed recording is available for export. */
  hasRecording: boolean;
  /** Start a recording session. */
  onStartRecording: () => void;
  /** Stop the current recording session. */
  onStopRecording: () => void;
  /** Export the last recording as a downloadable file. */
  onExportRecording: () => void;
}

const JANK_MS = 33.3;
const SPARKLINE_MAX = 80;
const PANEL_W = 'min(280px, 85vw)';
const TRANSITION = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
const SECTION_BORDER = `1px solid ${RGBA_TOKENS.violetBorderSubtle}`;
const MONO = FONT_FAMILY.mono;
const SECTION: React.CSSProperties = {
  padding: `${SPACING[2]} ${SPACING[3]}`,
  borderBottom: SECTION_BORDER,
};

/** Slide-out debug analytics dashboard. */
export function DebugPanel({
  visible,
  metrics,
  isRecording,
  hasRecording,
  onStartRecording,
  onStopRecording,
  onExportRecording,
}: DebugPanelProps) {
  const { frameStats: fs, entityCounts: ec, systemInfo: si, sparkline, log } = metrics;

  return (
    <section
      aria-label="Debug panel"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: PANEL_W,
        background: `${cssVar('white')}f7`,
        boxShadow: SHADOW.cardHeavy,
        transform: visible ? 'translateX(0)' : 'translateX(-100%)',
        transition: TRANSITION,
        zIndex: Z_INDEX.overlay,
        fontFamily: MONO,
        fontSize: FONT_SIZE.xs,
        color: cssVar('navy'),
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ ...SECTION, display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
        <span style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md }}>Debug</span>
        <span style={{ flex: 1 }} />
        {isRecording ? (
          <button type="button" onClick={onStopRecording} style={btnStyle(STATUS_COLORS.error)}>
            Stop
          </button>
        ) : (
          <button type="button" onClick={onStartRecording} style={btnStyle(cssVar('violet'))}>
            Rec
          </button>
        )}
        {hasRecording && (
          <button type="button" onClick={onExportRecording} style={btnStyle(cssVar('navy'))}>
            Save
          </button>
        )}
      </div>

      {/* Frame Timing */}
      <div style={SECTION}>
        <DebugSparkline
          values={sparkline}
          maxValue={SPARKLINE_MAX}
          width={240}
          height={40}
          jankThreshold={JANK_MS}
        />
        <div style={{ display: 'flex', gap: SPACING[2], marginTop: SPACING[1], flexWrap: 'wrap' }}>
          <Stat label="FPS" value={fs.currentFps} />
          <Stat label="avg" value={`${fs.avgFrameMs}ms`} />
          <Stat label="min" value={`${fs.minFrameMs}ms`} />
          <Stat label="max" value={`${fs.maxFrameMs}ms`} />
          <Stat label="jank" value={fs.jankCount} warn={fs.jankCountWindow > 0} />
        </div>
      </div>

      {/* Phase Timing */}
      <div style={SECTION}>
        <div style={{ display: 'flex', gap: SPACING[3] }}>
          <Stat label="update" value={`${fs.avgUpdateMs}ms`} />
          <Stat label="draw" value={`${fs.avgDrawMs}ms`} />
        </div>
      </div>

      {/* Entities */}
      <div style={SECTION}>
        <div style={{ ...LABEL_STYLE, marginBottom: SPACING[1] }}>Entities</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SPACING[1] }}>
          <Stat label="pipes" value={ec.pipes} />
          <Stat label="clouds" value={ec.clouds} />
          <Stat label="far" value={ec.farClouds} />
          <Stat label="mid" value={ec.midClouds} />
          <Stat label="skyline" value={ec.skylineSegments} />
          <Stat label="bldg" value={ec.buildings} />
          <Stat label="trees" value={ec.trees} />
          <Stat label="deco" value={ec.groundDeco} />
          <Stat label="planes" value={ec.planes} />
        </div>
      </div>

      {/* System */}
      <div style={SECTION}>
        <div style={{ ...LABEL_STYLE, marginBottom: SPACING[1] }}>System</div>
        <div style={{ display: 'flex', gap: SPACING[2], flexWrap: 'wrap' }}>
          <Stat label="DPR" value={si.devicePixelRatio} />
          <Stat label="canvas" value={`${si.canvasWidth}x${si.canvasHeight}`} />
          <Stat label="cores" value={si.hardwareConcurrency} />
          {si.jsHeapSizeUsed != null && (
            <Stat label="heap" value={`${Math.round(si.jsHeapSizeUsed / 1048576)}MB`} />
          )}
        </div>
      </div>

      {/* Event Log */}
      <div style={{ padding: `${SPACING[2]} ${SPACING[3]}` }}>
        <div style={{ ...LABEL_STYLE, marginBottom: SPACING[1] }}>Log ({log.length})</div>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {log
            .slice(-30)
            .reverse()
            .map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                style={{ fontSize: FONT_SIZE['2xs'], marginBottom: SPACING[0.5] }}
              >
                <span style={typeBadgeStyle(entry.type)}>{entry.type}</span>{' '}
                <span>{entry.message}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
