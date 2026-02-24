import type { BestScores, DifficultyKey, GameColors, GameState } from './game';

/** Event signatures emitted by the game engine. */
export interface EngineEvents {
  /** Fired when the game transitions between idle, play, dead, or paused. */
  stateChange: (state: GameState) => void;
  /** Fired when the player scores a point. */
  scoreChange: (score: number) => void;
  /** Fired when a new personal best is set. */
  bestScoreChange: (scores: BestScores) => void;
  /** Fired once per second with the smoothed frame rate. */
  fpsUpdate: (fps: number) => void;
  /** Fired when the difficulty level changes. */
  difficultyChange: (key: DifficultyKey) => void;
}

/** Union of all engine event names. */
export type EngineEventName = keyof EngineEvents;

/** Constructor options for FlappyEngine. */
export interface EngineConfig {
  /** Custom color theme overrides. */
  colors?: Partial<GameColors>;
  /** Custom banner texts for flying planes. */
  bannerTexts?: string[];
  /** Custom heading font family. */
  fontFamily?: string;
  /** Initial difficulty level. */
  difficulty?: DifficultyKey;
}
