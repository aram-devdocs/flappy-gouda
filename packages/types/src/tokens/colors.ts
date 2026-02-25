/** CSS variable prefix for all Flappy Nature design tokens. */
export const CSS_VAR_PREFIX = '--fn' as const;

/** Core color palette hex values. */
export const COLOR_TOKENS = {
  navy: '#090949',
  violet: '#6500D9',
  cyan: '#00D9FF',
  magenta: '#D76EFF',
  light: '#FBF6F6',
  white: '#FFFFFF',
  midviolet: '#4B00A0',
  skyBottom: '#F5F0F8',
} as const;

/** RGB channel strings for composing rgba() values. */
export const COLOR_RGB = {
  navy: '9, 9, 73',
  violet: '101, 0, 217',
  black: '0, 0, 0',
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
} as const;
