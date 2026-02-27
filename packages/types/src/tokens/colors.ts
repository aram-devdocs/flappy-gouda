/** CSS variable prefix for all Flappy Gouda design tokens. */
export const CSS_VAR_PREFIX = '--fg' as const;

/** Core color palette hex values. */
export const COLOR_TOKENS = {
  navy: '#0A3D5C',
  violet: '#5AAFA5',
  cyan: '#8ED5C5',
  magenta: '#6BC8AD',
  light: '#F5FAF8',
  white: '#FFFFFF',
  midviolet: '#1A6B7A',
  skyBottom: '#E8F5F0',
  lavender: '#C5E8DC',
  souls: '#C0392B',
} as const;

/** RGB channel strings for composing rgba() values. */
export const COLOR_RGB = {
  navy: '10, 61, 92',
  violet: '90, 175, 165',
  black: '0, 0, 0',
  souls: '192, 57, 43',
} as const;

/** Semantic status indicator colors. */
export const STATUS_COLORS = {
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  neutral: '#9ca3af',
} as const;

/** Pre-composed RGBA strings used across components. */
export const RGBA_TOKENS = {
  scrimLight: `rgba(${COLOR_RGB.navy}, 0.3)`,
  scrimMedium: `rgba(${COLOR_RGB.navy}, 0.35)`,
  scrimHeavy: `rgba(${COLOR_RGB.navy}, 0.45)`,
  scrimDense: `rgba(${COLOR_RGB.navy}, 0.55)`,
  navyShadow: `rgba(${COLOR_RGB.navy}, 0.12)`,
  shadowXs: `rgba(${COLOR_RGB.black}, 0.05)`,
  shadowSm: `rgba(${COLOR_RGB.black}, 0.08)`,
  shadowMd: `rgba(${COLOR_RGB.black}, 0.1)`,
  shadowLg: `rgba(${COLOR_RGB.black}, 0.12)`,
  shadowXl: `rgba(${COLOR_RGB.black}, 0.15)`,
  shadowBase: `rgba(${COLOR_RGB.black}, 0.09)`,
  violetBgSubtle: `rgba(${COLOR_RGB.violet}, 0.08)`,
  violetBorderSubtle: `rgba(${COLOR_RGB.violet}, 0.15)`,
  soulsBgSubtle: `rgba(${COLOR_RGB.souls}, 0.08)`,
  soulsBorderSubtle: `rgba(${COLOR_RGB.souls}, 0.15)`,
} as const;
