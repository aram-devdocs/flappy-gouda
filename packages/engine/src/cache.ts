import { DEFAULT_GAME_COLORS } from '@repo/types';
import type { GameColors } from '@repo/types';

/** Pre-cached RGBA strings to avoid string allocation per frame. */
export const RGBA = {
  scrim30: 'rgba(9, 9, 73, 0.3)',
  scrim35: 'rgba(9, 9, 73, 0.35)',
  scrim45: 'rgba(9, 9, 73, 0.45)',
  shadow09: 'rgba(0,0,0,0.09)',
  shadow08: 'rgba(0,0,0,0.08)',
  shadow05: 'rgba(0,0,0,0.05)',
};

/** Pre-computed CSS font strings to avoid template literal allocation per frame. */
export interface CachedFonts {
  banner: string;
  score: string;
  hint: string;
  diffTitle: string;
  diffBtn: string;
  diffBest: string;
  fps: string;
  deadTitle: string;
  deadScore: string;
  deadRetry: string;
}

/**
 * Build all CSS font shorthand strings from a given font family.
 * @param fontFamily The CSS font-family value, e.g. '"Poppins", sans-serif'.
 * @returns Pre-computed font strings for every text context in the game.
 */
export function buildFontCache(fontFamily: string): CachedFonts {
  return {
    banner: `800 9px ${fontFamily}`,
    score: `800 32px ${fontFamily}`,
    hint: `600 11px ${fontFamily}`,
    diffTitle: `800 12px ${fontFamily}`,
    diffBtn: `700 11px ${fontFamily}`,
    diffBest: `600 9px ${fontFamily}`,
    fps: `600 10px ${fontFamily}`,
    deadTitle: `800 20px ${fontFamily}`,
    deadScore: `700 14px ${fontFamily}`,
    deadRetry: `600 12px ${fontFamily}`,
  };
}

/** Default color palette from DESIGN_TOKENS. */
export const DEFAULT_COLORS: GameColors = DEFAULT_GAME_COLORS;

/** Default font family used when none is provided via EngineConfig. */
export const DEFAULT_FONT = '"Poppins", sans-serif';
