export { FlappyNatureGame } from './FlappyNatureGame.js';

// Re-export GamePage so apps/web can use it without violating dependency rules
export { GamePage } from '@repo/ui';

// Re-export types for consumer convenience
export type {
  FlappyNatureGameProps,
  GameState,
  DifficultyKey,
  BestScores,
  GameColors,
} from '@repo/types';
