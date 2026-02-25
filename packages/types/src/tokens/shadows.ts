import { RGBA_TOKENS } from './colors';

/** Box shadow presets. */
export const SHADOW = {
  card: `0 4px 20px ${RGBA_TOKENS.shadowMd}`,
  dropdown: `0 4px 16px ${RGBA_TOKENS.shadowLg}`,
  score: `2px 2px 0 ${RGBA_TOKENS.navyShadow}`,
  cardHeavy: `0 4px 20px ${RGBA_TOKENS.shadowXl}`,
} as const;

/** Text shadow presets. */
export const TEXT_SHADOW = {
  score: `2px 2px 0 ${RGBA_TOKENS.navyShadow}`,
} as const;
