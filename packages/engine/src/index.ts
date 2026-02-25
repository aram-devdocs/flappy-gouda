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

// Draw functions
export { drawBird, drawPipes, drawScore, drawSettingsIcon } from './renderer-entities.js';
export {
  drawBuilding,
  drawTree,
  drawPlane,
  drawSkylineSegment,
  drawCloudsPrerendered,
} from './renderer-background.js';
export { drawGround, drawSky } from './renderer-ground.js';
export { prerenderCloud, buildPipeLipCache, buildGradients } from './renderer-prerender.js';
export { generateSkylineSegment } from './skyline.js';
export { loadHeartImage } from './heart.js';
export { buildFontCache } from './cache.js';
export { Renderer } from './renderer.js';

// Supporting types
export type { IconBounds } from './renderer-entities.js';
export type { PipeLipCache, GradientCache } from './renderer-prerender.js';
export type { CachedFonts } from './cache.js';

// Constants needed by stories
export { TAU, DEG_TO_RAD } from './math.js';
export {
  PIPE_LIP,
  BIRD_ROTATION,
  CLOUD_PARAMS,
  PIPE_SPAWN_MARGIN,
  SKYLINE_CITIES,
} from './config.js';
