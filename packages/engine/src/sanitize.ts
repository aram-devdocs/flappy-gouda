import type { EngineConfig, GameColors } from '@repo/types';
import { DEFAULT_BANNERS } from './banners';
import { type CachedFonts, DEFAULT_COLORS, DEFAULT_FONT, buildFontCache } from './cache';
import { createLogger } from './logger';

const log = createLogger('sanitize');

const FONT_FAMILY_PATTERN = /^[a-zA-Z0-9\s\-'"(),]+$/;

/** Validate a CSS font-family string, falling back to the default font if invalid. */
export function sanitizeFontFamily(input: string): string {
  if (FONT_FAMILY_PATTERN.test(input)) return input;
  log.warn('Invalid fontFamily rejected, using default', { input });
  return DEFAULT_FONT;
}

const MAX_BANNER_LENGTH = 50;
const MAX_BANNER_COUNT = 20;
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional -- stripping control chars from user input
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/g;

/** Strip control characters, enforce length limits, and cap the number of banner texts. */
export function sanitizeBannerTexts(texts: string[]): string[] {
  return texts
    .slice(0, MAX_BANNER_COUNT)
    .map((t) => t.replace(CONTROL_CHAR_PATTERN, '').slice(0, MAX_BANNER_LENGTH))
    .filter((t) => t.length > 0);
}

const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]+$/;

/** Validate color values against hex/named-color patterns, discarding invalid entries. */
export function sanitizeColors(colors: Partial<GameColors>): Partial<GameColors> {
  const result: Partial<GameColors> = {};
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string' && COLOR_PATTERN.test(value)) {
      (result as Record<string, string>)[key] = value;
    } else {
      log.warn('Invalid color rejected', { key, value: String(value) });
    }
  }
  return result;
}

/** Fully resolved engine configuration with defaults applied and inputs sanitized. */
interface ResolvedConfig {
  /** Merged game color palette (user overrides on top of defaults). */
  colors: GameColors;
  /** Pre-built font cache derived from the resolved font family. */
  fonts: CachedFonts;
  /** Sanitized banner strings displayed during gameplay. */
  bannerTexts: string[];
}

/** Merge user-supplied engine config with defaults, sanitizing all inputs. */
export function resolveEngineConfig(engineConfig?: EngineConfig): ResolvedConfig {
  const colors: GameColors = {
    ...DEFAULT_COLORS,
    ...(engineConfig?.colors ? sanitizeColors(engineConfig.colors) : {}),
  };
  const fontFamily = engineConfig?.fontFamily
    ? sanitizeFontFamily(engineConfig.fontFamily)
    : DEFAULT_FONT;
  const fonts = buildFontCache(fontFamily);
  const bannerTexts = engineConfig?.bannerTexts
    ? sanitizeBannerTexts(engineConfig.bannerTexts)
    : DEFAULT_BANNERS;
  return { colors, fonts, bannerTexts };
}
