export { FlappyEngine } from './FlappyEngine';
export { DebugMetricsCollector } from './debug-metrics';
export { DEFAULT_CONFIG, DIFFICULTY, BG, BASE_W, BASE_H, validateConfig } from './config';
export { DEFAULT_COLORS, DEFAULT_FONT } from './cache';
export { EngineError } from './errors';
export type { EngineErrorCode } from './errors';
export { createLogger } from './logger';
export type { LogLevel, LogEntry } from './logger';
export { sanitizeFontFamily, sanitizeColors } from './sanitize';

// Draw functions
export {
  drawBird,
  drawPipes,
  drawScore,
  drawSettingsIcon,
  drawSettingsIconCached,
  ICON_SIZE,
  ICON_PAD,
} from './renderer-entities';
export {
  drawBuilding,
  drawTree,
  drawSkylineSegment,
  drawCloudsPrerendered,
} from './renderer-background';
export { drawGround, drawSky } from './renderer-ground';
export {
  prerenderCloud,
  buildPipeLipCache,
  buildSettingsIconCache,
  buildGradients,
} from './renderer-prerender';
export {
  prerenderSkylineSegment,
  prerenderBuilding,
  prerenderTree,
} from './renderer-prerender-entities';
export { generateSkylineSegment } from './skyline';
export { loadCheeseImage } from './cheese';
export { buildFontCache } from './cache';
export { Renderer } from './renderer';

// Supporting types
export type { CanvasContexts } from './renderer';
export type { IconBounds } from './renderer-entities';
export type { PipeLipCache, SettingsIconCache, GradientCache } from './renderer-prerender';
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
