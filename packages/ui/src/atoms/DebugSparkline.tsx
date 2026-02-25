import { STATUS_COLORS } from '@repo/types';

/** Props for {@link DebugSparkline}. */
export interface DebugSparklineProps {
  /** Array of frame-time values (ms). */
  values: readonly number[];
  /** Maximum value for Y-axis scaling. */
  maxValue: number;
  /** SVG width in pixels. */
  width: number;
  /** SVG height in pixels. */
  height: number;
  /** Threshold above which a frame is considered jank (ms). */
  jankThreshold: number;
}

/** Inline SVG bar chart of frame times. Green bars for normal, red for jank. */
export function DebugSparkline({
  values,
  maxValue,
  width,
  height,
  jankThreshold,
}: DebugSparklineProps) {
  if (values.length === 0) return null;

  const barW = width / values.length;
  const thresholdY = height - (jankThreshold / maxValue) * height;

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      style={{ display: 'block' }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {values.map((v, i) => {
        const barH = Math.max(1, (v / maxValue) * height);
        const isJank = v >= jankThreshold;
        return (
          <rect
            key={`${i}-${v}`}
            x={i * barW}
            y={height - barH}
            width={Math.max(1, barW - 0.5)}
            height={barH}
            fill={isJank ? STATUS_COLORS.error : STATUS_COLORS.success}
            opacity={0.8}
          />
        );
      })}
      <line
        x1={0}
        y1={thresholdY}
        x2={width}
        y2={thresholdY}
        stroke={STATUS_COLORS.warning}
        strokeWidth={1}
        strokeDasharray="3 2"
      />
    </svg>
  );
}
