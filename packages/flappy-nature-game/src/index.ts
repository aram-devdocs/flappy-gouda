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
  LeaderboardData,
  LeaderboardCallbacks,
  LeaderboardEntry,
  LeaderboardConnectionStatus,
  LeaderboardProps,
  NicknameCheckResult,
} from '@repo/types';

export { NICKNAME_LENGTH, NICKNAME_PATTERN } from '@repo/types';

// Re-export hooks needed by web app to maintain architecture compliance
export { useNickname } from '@repo/hooks';
export type { UseNicknameReturn } from '@repo/hooks';
