import type { GameColors } from '@repo/types';
import { DEFAULT_FONT } from './cache.js';
import { createLogger } from './logger.js';

const log = createLogger('sanitize');

const FONT_FAMILY_PATTERN = /^[a-zA-Z0-9\s\-'"(),]+$/;

export function sanitizeFontFamily(input: string): string {
  if (FONT_FAMILY_PATTERN.test(input)) return input;
  log.warn('Invalid fontFamily rejected, using default', { input });
  return DEFAULT_FONT;
}

const MAX_BANNER_LENGTH = 50;
const MAX_BANNER_COUNT = 20;
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional -- stripping control chars from user input
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/g;

export function sanitizeBannerTexts(texts: string[]): string[] {
  return texts
    .slice(0, MAX_BANNER_COUNT)
    .map((t) => t.replace(CONTROL_CHAR_PATTERN, '').slice(0, MAX_BANNER_LENGTH))
    .filter((t) => t.length > 0);
}

const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]+$/;

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
