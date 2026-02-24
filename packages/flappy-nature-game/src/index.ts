export { FlappyNatureGame } from './FlappyNatureGame.js';
export { CanvasStage } from './CanvasStage.js';

// Re-export GamePage so apps/web can use it without violating dependency rules
export { GamePage } from '@repo/ui';

// Re-export design tokens for consumer convenience
export {
  DESIGN_TOKENS,
  COLOR_TOKENS,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  SPACING,
  RADIUS,
  RGBA_TOKENS,
  SHADOW,
  TEXT_SHADOW,
  Z_INDEX,
  OPACITY,
  cssVar,
} from '@repo/types';

// Re-export types for consumer convenience
export type {
  FlappyNatureGameProps,
  GameState,
  DifficultyKey,
  BestScores,
  GameColors,
} from '@repo/types';
