/* === Game States === */
export type GameState = 'idle' | 'play' | 'dead' | 'paused';

/* === Difficulty === */
export type DifficultyKey = 'easy' | 'normal' | 'hard';

export interface DifficultyPreset {
  gravity: number;
  flapForce: number;
  terminalVel: number;
  pipeGap: number;
  pipeSpeed: number;
  pipeSpawn: number;
  hitboxPad: number;
}

export type DifficultyMap = Record<DifficultyKey, DifficultyPreset>;

export const DIFF_KEYS: DifficultyKey[] = ['easy', 'normal', 'hard'];

export const DIFF_LABELS: Record<DifficultyKey, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

/* === Game Config === */
export interface GameConfig {
  width: number;
  height: number;
  gravity: number;
  flapForce: number;
  terminalVel: number;
  pipeWidth: number;
  pipeGap: number;
  pipeSpeed: number;
  pipeSpawn: number;
  hitboxPad: number;
  groundH: number;
  birdSize: number;
  birdX: number;
  cloudCount: number;
  resetDelay: number;
}

/* === Colors === */
export interface GameColors {
  navy: string;
  violet: string;
  cyan: string;
  magenta: string;
  light: string;
  white: string;
  midviolet: string;
}

/* === Background Config === */
export interface BackgroundConfig {
  farSpeed: number;
  midSpeed: number;
  nearSpeed: number;
  planeSpeed: number;
  skylineSegW: number;
  buildingMinW: number;
  buildingMaxW: number;
  treeMinW: number;
  treeMaxW: number;
  skylineAlpha: number;
  buildingAlpha: number;
  treeAlpha: number;
  planeAlpha: number;
  bannerAlpha: number;
  cloudFarAlpha: number;
  cloudMidAlpha: number;
}

/* === Entities === */
export interface Bird {
  y: number;
  vy: number;
  rot: number;
}

export interface Pipe {
  x: number;
  topH: number;
  scored: boolean;
}

export interface Plane {
  x: number;
  y: number;
  dir: number;
  bannerText: string;
  bannerW: number;
  wobble: number;
  speed: number;
}

export interface Cloud {
  x: number;
  y: number;
  w: number;
  speed: number;
  _canvas: HTMLCanvasElement | null;
  _pad: number;
  _logW: number;
  _logH: number;
}

/* === Skyline === */
export type SkylineCity = 'phoenix' | 'neworleans' | 'montreal' | 'dallas' | 'nashville';

export interface SkylineBuilding {
  ox: number;
  w: number;
  h: number;
  hasSpire: boolean;
  hasDome: boolean;
  hasCactus: boolean;
}

export interface SkylineSegment {
  x: number;
  groundY: number;
  city: SkylineCity;
  buildings: SkylineBuilding[];
  totalW: number;
  speed: number;
}

export type BuildingType = 'house' | 'apartment' | 'office';

export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  type: BuildingType;
  windows: number;
  speed: number;
  _cacheOffX: number;
  _cacheOffY: number;
  _cacheW: number;
  _cacheH: number;
}

export type TreeType = 'pine' | 'round';

export interface Tree {
  x: number;
  y: number;
  w: number;
  h: number;
  type: TreeType;
  speed: number;
}

export interface GroundDeco {
  x: number;
  type: 'dash' | 'dot';
  speed: number;
}

export interface BgLayers {
  farClouds: Cloud[];
  skyline: SkylineSegment[];
  midClouds: Cloud[];
  buildings: Building[];
  trees: Tree[];
  groundDeco: GroundDeco[];
  maxRightSkyline: number;
  maxRightBuildings: number;
  maxRightTrees: number;
  maxRightGroundDeco: number;
}

/* === Best Scores === */
export type BestScores = Record<DifficultyKey, number>;

/* === Engine Events === */
export interface EngineEvents {
  stateChange: (state: GameState) => void;
  scoreChange: (score: number) => void;
  bestScoreChange: (scores: BestScores) => void;
  fpsUpdate: (fps: number) => void;
  difficultyChange: (key: DifficultyKey) => void;
}

export type EngineEventName = keyof EngineEvents;

/* === Engine Config (constructor options) === */
export interface EngineConfig {
  colors?: Partial<GameColors>;
  bannerTexts?: string[];
  fontFamily?: string;
  difficulty?: DifficultyKey;
}

/* === React Component Props === */
export interface FlappyNatureGameProps {
  /** Custom color theme */
  colors?: Partial<GameColors>;
  /** Custom banner texts for flying planes */
  bannerTexts?: string[];
  /** Custom heading font family */
  fontFamily?: string;
  /** Initial difficulty */
  difficulty?: DifficultyKey;
  /** Callback when game state changes */
  onStateChange?: (state: GameState) => void;
  /** Callback when score changes */
  onScoreChange?: (score: number) => void;
  /** Callback when best score changes */
  onBestScoreChange?: (scores: BestScores) => void;
  /** Additional CSS class for the container */
  className?: string;
  /** Whether to show FPS counter */
  showFps?: boolean;
}
