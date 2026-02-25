export { FlappyEngine } from './FlappyEngine';
export { DebugMetricsCollector } from './debug-metrics';
export { DEFAULT_CONFIG, DIFFICULTY, BG, BASE_W, BASE_H, validateConfig } from './config';
export { DEFAULT_COLORS, DEFAULT_FONT } from './cache';
export { DEFAULT_BANNERS } from './banners';
export { EngineError } from './errors';
export type { EngineErrorCode } from './errors';
export { createLogger } from './logger';
export type { LogLevel, LogEntry } from './logger';
export { sanitizeFontFamily, sanitizeBannerTexts, sanitizeColors } from './sanitize';
export {
  MIGRATION_FLAG_KEY,
  BRIDGE_URL,
  mergeBestScores,
  hasScoreImprovements,
  buildScoreComparisons,
  parseBridgeScores,
  areAllScoresZero,
} from './migration';

// Draw functions
export { drawBird, drawPipes, drawScore, drawSettingsIcon } from './renderer-entities';
export {
  drawBuilding,
  drawTree,
  drawPlane,
  drawSkylineSegment,
  drawCloudsPrerendered,
} from './renderer-background';
export { drawGround, drawSky } from './renderer-ground';
export { prerenderCloud, buildPipeLipCache, buildGradients } from './renderer-prerender';
export { generateSkylineSegment } from './skyline';
export { loadHeartImage } from './heart';
export { buildFontCache } from './cache';
export { Renderer } from './renderer';

// Supporting types
export type { IconBounds } from './renderer-entities';
export type { PipeLipCache, GradientCache } from './renderer-prerender';
export type { CachedFonts } from './cache';

// Constants needed by stories
export { TAU, DEG_TO_RAD } from './math';
export {
  PIPE_LIP,
  BIRD_ROTATION,
  CLOUD_PARAMS,
  PIPE_SPAWN_MARGIN,
  SKYLINE_CITIES,
} from './config';
