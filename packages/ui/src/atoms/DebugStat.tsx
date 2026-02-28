import {
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACING,
  STATUS_COLORS,
  cssVar,
} from '@repo/types';

export const LABEL_STYLE: React.CSSProperties = {
  fontSize: FONT_SIZE['2xs'],
  color: STATUS_COLORS.neutral,
  fontWeight: FONT_WEIGHT.normal,
};

const VAL: React.CSSProperties = {
  fontSize: FONT_SIZE.sm,
  fontWeight: FONT_WEIGHT.semibold,
};

export function Stat({
  label,
  value,
  warn,
}: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div>
      <div style={LABEL_STYLE}>{label}</div>
      <div style={{ ...VAL, color: warn ? STATUS_COLORS.error : undefined }}>{value}</div>
    </div>
  );
}

export function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: cssVar('white'),
    border: 'none',
    borderRadius: RADIUS.sm,
    padding: `${SPACING[0.5]} ${SPACING[2]}`,
    fontSize: FONT_SIZE['2xs'],
    fontWeight: FONT_WEIGHT.bold,
    cursor: 'pointer',
    fontFamily: FONT_FAMILY.mono,
  };
}

const TYPE_COLORS: Record<string, string> = {
  state: cssVar('violet'),
  score: STATUS_COLORS.success,
  difficulty: STATUS_COLORS.warning,
  jank: STATUS_COLORS.error,
  recording: cssVar('cyan'),
  info: STATUS_COLORS.neutral,
  director: cssVar('magenta'),
  phase: cssVar('midviolet'),
  pattern: cssVar('navy'),
  feel: cssVar('cyan'),
};

export function typeBadgeStyle(type: string): React.CSSProperties {
  return {
    display: 'inline-block',
    background: TYPE_COLORS[type] ?? STATUS_COLORS.neutral,
    color: cssVar('white'),
    borderRadius: RADIUS.sm,
    padding: `0 ${SPACING[1]}`,
    fontSize: FONT_SIZE['2xs'],
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: '14px',
  };
}
