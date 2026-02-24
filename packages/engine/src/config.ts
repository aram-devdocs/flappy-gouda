import type { BackgroundConfig, DifficultyKey, DifficultyMap, GameConfig } from '@repo/types';
import { EngineError } from './errors.js';

/** Logical canvas width in pixels (before HiDPI scaling). */
export const BASE_W = 380;

/** Logical canvas height in pixels (before HiDPI scaling). */
export const BASE_H = 520;

/** Default game configuration using normal-difficulty values. */
export const DEFAULT_CONFIG: GameConfig = {
  width: BASE_W,
  height: BASE_H,
  gravity: 0.28,
  flapForce: -5.0,
  terminalVel: 5.5,
  pipeWidth: 52,
  pipeGap: 162,
  pipeSpeed: 2.2,
  pipeSpawn: 1700,
  hitboxPad: 5,
  groundH: 50,
  birdSize: 28,
  birdX: 70,
  cloudCount: 4,
  resetDelay: 600,
};

/** Physics and spawning presets for each difficulty level. */
export const DIFFICULTY: DifficultyMap = {
  easy: {
    gravity: 0.22,
    flapForce: -4.6,
    terminalVel: 4.8,
    pipeGap: 180,
    pipeSpeed: 1.9,
    pipeSpawn: 1900,
    hitboxPad: 7,
  },
  normal: {
    gravity: 0.28,
    flapForce: -5.0,
    terminalVel: 5.5,
    pipeGap: 162,
    pipeSpeed: 2.2,
    pipeSpawn: 1700,
    hitboxPad: 5,
  },
  hard: {
    gravity: 0.38,
    flapForce: -6.0,
    terminalVel: 7.0,
    pipeGap: 138,
    pipeSpeed: 2.6,
    pipeSpawn: 1450,
    hitboxPad: 2,
  },
};

/** Parallax speed multipliers and opacity values for background layers. */
export const BG: BackgroundConfig = {
  farSpeed: 0.08,
  midSpeed: 0.18,
  nearSpeed: 0.35,
  planeSpeed: 0.6,
  skylineSegW: 120,
  buildingMinW: 25,
  buildingMaxW: 50,
  treeMinW: 8,
  treeMaxW: 18,
  skylineAlpha: 0.06,
  buildingAlpha: 0.07,
  treeAlpha: 0.06,
  planeAlpha: 0.18,
  bannerAlpha: 0.3,
  cloudFarAlpha: 0.06,
  cloudMidAlpha: 0.1,
};

/** Bird rotation parameters for smooth visual tilt. */
export const BIRD_ROTATION = {
  minDeg: -20,
  maxDeg: 55,
  velocityScale: 3.2,
  lerpFactor: 0.22,
} as const;

/** Minimum distance from top/bottom edge when spawning pipe gaps. */
export const PIPE_SPAWN_MARGIN = 60;

/** Cloud layer spawn parameters. */
export const CLOUD_PARAMS = {
  far: { minW: 70, rangeW: 80, spreadX: 1.5, minY: 15, rangeY: 60 },
  mid: { minW: 35, rangeW: 45, spreadX: 1.3, minY: 60, rangeY: 100 },
} as const;

/** Pipe lip cap dimensions. */
export const PIPE_LIP = {
  extraW: 8,
  height: 20,
  radius: 8,
} as const;

/** Plane spawn altitude and timing parameters. */
export const PLANE_PARAMS = {
  altMin: 12,
  altMax: 160,
  altSep: 45,
  spawnDelayMin: 8000,
  spawnDelayRange: 15000,
} as const;

/** Maximum number of pipe pairs in the object pool. */
export const PIPE_POOL_SIZE = 5;

/** City skyline variants available for the parallax background layer. */
export const SKYLINE_CITIES: Array<'phoenix' | 'neworleans' | 'montreal' | 'dallas' | 'nashville'> =
  ['phoenix', 'neworleans', 'montreal', 'dallas', 'nashville'];

/** Overwrite physics-related fields on a GameConfig with the chosen difficulty preset. */
export function applyDifficulty(key: DifficultyKey, config: GameConfig): void {
  const d = DIFFICULTY[key];
  config.gravity = d.gravity;
  config.flapForce = d.flapForce;
  config.terminalVel = d.terminalVel;
  config.pipeGap = d.pipeGap;
  config.pipeSpeed = d.pipeSpeed;
  config.pipeSpawn = d.pipeSpawn;
  config.hitboxPad = d.hitboxPad;
}

/** Validate that a GameConfig has sane values. Throws EngineError on invalid config. */
export function validateConfig(config: GameConfig): void {
  if (config.width <= 0 || config.height <= 0) {
    throw new EngineError('Canvas dimensions must be positive', 'INVALID_CONFIG');
  }
  if (config.gravity <= 0) {
    throw new EngineError('Gravity must be positive', 'INVALID_CONFIG');
  }
  if (config.pipeGap <= 0) {
    throw new EngineError('Pipe gap must be positive', 'INVALID_CONFIG');
  }
  if (config.groundH >= config.height) {
    throw new EngineError('Ground height must be less than canvas height', 'INVALID_CONFIG');
  }
  if (config.birdSize <= 0) {
    throw new EngineError('Bird size must be positive', 'INVALID_CONFIG');
  }
}
