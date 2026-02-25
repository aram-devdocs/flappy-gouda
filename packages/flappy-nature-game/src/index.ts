export { FlappyNatureGame } from './FlappyNatureGame';
export { CanvasStage } from './CanvasStage';

// Re-export GamePage so apps/web can use it without violating dependency rules
export { GamePage } from '@repo/ui';

// Re-export leaderboard UI components for external rendering
export { LeaderboardBottomSheet } from '@repo/ui';
export type { LeaderboardBottomSheetProps } from '@repo/ui';
export { LeaderboardPanel } from '@repo/ui';
export type { LeaderboardPanelProps } from '@repo/ui';
export { LeaderboardTab } from '@repo/ui';
export type { LeaderboardTabProps } from '@repo/ui';

// Re-export debug UI components for external rendering
export { DebugTab } from '@repo/ui';
export type { DebugTabProps } from '@repo/ui';
export { DebugPanel } from '@repo/ui';
export type { DebugPanelProps } from '@repo/ui';
export { DebugBottomSheet } from '@repo/ui';
export type { DebugBottomSheetProps } from '@repo/ui';

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
  LeaderboardSeparator,
  LeaderboardWindowEntry,
  LeaderboardWindowItem,
  DebugMetricsSnapshot,
  DebugControls,
  DebugRecording,
} from '@repo/types';

export { NICKNAME_LENGTH, NICKNAME_PATTERN } from '@repo/types';

// Re-export hooks needed by web app to maintain architecture compliance
export { useNickname } from '@repo/hooks';
export type { UseNicknameReturn } from '@repo/hooks';
