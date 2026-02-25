/** Font family stacks. */
export const FONT_FAMILY = {
  heading: '"Poppins", sans-serif',
  body: '"apertura", "Inter", system-ui, sans-serif',
  mono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
} as const;

/** Font size scale (t-shirt sizing). */
export const FONT_SIZE = {
  '2xs': '9px',
  xs: '10px',
  sm: '11px',
  md: '12px',
  lg: '13px',
  xl: '14px',
  '2xl': '18px',
  '3xl': '20px',
  '4xl': '24px',
  '5xl': '32px',
  '6xl': '48px',
} as const;

/** Font weight presets. */
export const FONT_WEIGHT = {
  normal: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/** Line height presets. */
export const LINE_HEIGHT = {
  tight: '18px',
  normal: '1.4',
  relaxed: '1.6',
} as const;
