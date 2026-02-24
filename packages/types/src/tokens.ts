import type { GameColors } from './game';

/** Shared design tokens for colors and CSS variable naming. */
export const DESIGN_TOKENS = {
  colors: {
    navy: '#090949',
    violet: '#6500D9',
    cyan: '#00D9FF',
    magenta: '#D76EFF',
    light: '#FBF6F6',
    white: '#FFFFFF',
    midviolet: '#4B00A0',
    skyBottom: '#F5F0F8',
  },
  cssVarPrefix: '--fn',
} as const;

/** Default game color palette derived from design tokens. */
export const DEFAULT_GAME_COLORS: GameColors = { ...DESIGN_TOKENS.colors };
