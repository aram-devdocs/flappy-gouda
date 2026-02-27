/** Current state of the game lifecycle. */
export type GameState = 'idle' | 'play' | 'dead' | 'paused';

/** Identifier for a difficulty level. */
export type DifficultyKey = 'easy' | 'normal' | 'hard' | 'souls';

/** Configuration for a single difficulty level. */
export interface DifficultyPreset {
  /** Downward acceleration in pixels/tick. */
  gravity: number;
  /** Upward impulse applied on flap. */
  flapForce: number;
  /** Maximum downward velocity. */
  terminalVel: number;
  /** Vertical gap between top and bottom pipe in pixels. */
  pipeGap: number;
  /** Horizontal pipe scroll speed in pixels/tick. */
  pipeSpeed: number;
  /** Interval between pipe spawns in milliseconds. */
  pipeSpawn: number;
  /** Hitbox padding shrink in pixels (larger = more forgiving). */
  hitboxPad: number;
  /** Per-pipe gap size variation in pixels (±). 0 = fixed gap. */
  pipeGapVariation: number;
  /** Minimum distance from top/bottom edge when spawning pipe gaps. */
  pipeSpawnMargin: number;
  /** Random variation in spawn timing in milliseconds (±). 0 = fixed interval. */
  pipeSpawnVariation: number;
}

/** Maps each difficulty key to its preset values. */
export type DifficultyMap = Record<DifficultyKey, DifficultyPreset>;

/** Ordered list of all difficulty keys. */
export const DIFF_KEYS: DifficultyKey[] = ['easy', 'normal', 'hard', 'souls'];

/** Human-readable labels for each difficulty level. */
export const DIFF_LABELS: Record<DifficultyKey, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  souls: 'Souls',
};

/** Full runtime game configuration including physics and layout values. */
export interface GameConfig {
  /** Canvas logical width in pixels. */
  width: number;
  /** Canvas logical height in pixels. */
  height: number;
  /** Downward acceleration in pixels/tick. */
  gravity: number;
  /** Upward impulse applied on flap. */
  flapForce: number;
  /** Maximum downward velocity. */
  terminalVel: number;
  /** Width of a pipe column in pixels. */
  pipeWidth: number;
  /** Vertical gap between top and bottom pipe in pixels. */
  pipeGap: number;
  /** Horizontal pipe scroll speed in pixels/tick. */
  pipeSpeed: number;
  /** Interval between pipe spawns in milliseconds. */
  pipeSpawn: number;
  /** Hitbox padding shrink in pixels. */
  hitboxPad: number;
  /** Height of the ground strip in pixels. */
  groundH: number;
  /** Bird sprite diameter in pixels. */
  birdSize: number;
  /** Bird horizontal position from the left edge. */
  birdX: number;
  /** Number of ambient near-clouds to spawn. */
  cloudCount: number;
  /** Delay before allowing restart after death, in milliseconds. */
  resetDelay: number;
  /** Per-pipe gap size variation in pixels (±). 0 = fixed gap. */
  pipeGapVariation: number;
  /** Minimum distance from top/bottom edge when spawning pipe gaps. */
  pipeSpawnMargin: number;
  /** Random variation in spawn timing in milliseconds (±). 0 = fixed interval. */
  pipeSpawnVariation: number;
}

/** Theme color palette used for canvas and UI rendering. */
export interface GameColors {
  navy: string;
  violet: string;
  cyan: string;
  magenta: string;
  light: string;
  white: string;
  midviolet: string;
  skyBottom: string;
}

/** Parallax speed and opacity settings for background layers. */
export interface BackgroundConfig {
  /** Scroll speed multiplier for the far cloud layer. */
  farSpeed: number;
  /** Scroll speed multiplier for the mid/building layer. */
  midSpeed: number;
  /** Scroll speed multiplier for the near/tree layer. */
  nearSpeed: number;
  /** Width of a single skyline segment in pixels. */
  skylineSegW: number;
  /** Minimum building width in pixels. */
  buildingMinW: number;
  /** Maximum building width in pixels. */
  buildingMaxW: number;
  /** Minimum tree width in pixels. */
  treeMinW: number;
  /** Maximum tree width in pixels. */
  treeMaxW: number;
  /** Draw opacity for skyline silhouettes. */
  skylineAlpha: number;
  /** Draw opacity for mid-ground buildings. */
  buildingAlpha: number;
  /** Draw opacity for near-ground trees. */
  treeAlpha: number;
  /** Draw opacity for far-layer clouds. */
  cloudFarAlpha: number;
  /** Draw opacity for mid-layer clouds. */
  cloudMidAlpha: number;
}

/** Per-difficulty best scores persisted across sessions. */
export type BestScores = Record<DifficultyKey, number>;
