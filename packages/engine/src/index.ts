export { FlappyEngine } from './FlappyEngine.js';
export { DEFAULT_CONFIG, DIFFICULTY, BG, BASE_W, BASE_H, validateConfig } from './config.js';
export { DEFAULT_COLORS, DEFAULT_FONT } from './cache.js';
export { DEFAULT_BANNERS } from './banners.js';
export { EngineError } from './errors.js';
export type { EngineErrorCode } from './errors.js';
export { createLogger } from './logger.js';
export type { LogLevel, LogEntry } from './logger.js';
export { sanitizeFontFamily, sanitizeBannerTexts, sanitizeColors } from './sanitize.js';
export {
  MIGRATION_FLAG_KEY,
  BRIDGE_URL,
  mergeBestScores,
  hasScoreImprovements,
  buildScoreComparisons,
  parseBridgeScores,
  areAllScoresZero,
} from './migration.js';
