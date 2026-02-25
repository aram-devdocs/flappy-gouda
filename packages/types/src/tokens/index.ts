import type { GameColors } from '../game.js';
import { COLOR_TOKENS, CSS_VAR_PREFIX } from './colors.js';

export { COLOR_TOKENS, COLOR_RGB, CSS_VAR_PREFIX, RGBA_TOKENS, STATUS_COLORS } from './colors.js';
export { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from './typography.js';
export { SPACING, RADIUS, BORDER_WIDTH } from './spacing.js';
export { SHADOW, TEXT_SHADOW } from './shadows.js';
export { Z_INDEX, OPACITY } from './elevation.js';
export { cssVar } from './helpers.js';

/** Backward-compatible design tokens object. */
export const DESIGN_TOKENS = {
  colors: COLOR_TOKENS,
  cssVarPrefix: CSS_VAR_PREFIX,
} as const;

/** Default game color palette derived from design tokens. */
export const DEFAULT_GAME_COLORS: GameColors = { ...COLOR_TOKENS };
