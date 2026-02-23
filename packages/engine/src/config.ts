import type { BackgroundConfig, DifficultyKey, DifficultyMap, GameConfig } from '@repo/types';

export const BASE_W = 380;
export const BASE_H = 520;

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

export const SKYLINE_CITIES: Array<'phoenix' | 'neworleans' | 'montreal' | 'dallas' | 'nashville'> =
  ['phoenix', 'neworleans', 'montreal', 'dallas', 'nashville'];

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
