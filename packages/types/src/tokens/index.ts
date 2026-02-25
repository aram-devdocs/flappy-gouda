import type { GameColors } from '../game';
import { COLOR_TOKENS, CSS_VAR_PREFIX } from './colors';

export { COLOR_TOKENS, COLOR_RGB, CSS_VAR_PREFIX, RGBA_TOKENS, STATUS_COLORS } from './colors';
export { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from './typography';
export { SPACING, RADIUS, BORDER_WIDTH } from './spacing';
export { SHADOW, TEXT_SHADOW } from './shadows';
export { Z_INDEX, OPACITY } from './elevation';
export { cssVar } from './helpers';

/** Backward-compatible design tokens object. */
export const DESIGN_TOKENS = {
  colors: COLOR_TOKENS,
  cssVarPrefix: CSS_VAR_PREFIX,
} as const;

/** Default game color palette derived from design tokens. */
export const DEFAULT_GAME_COLORS: GameColors = { ...COLOR_TOKENS };
