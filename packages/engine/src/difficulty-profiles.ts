import { Difficulty, PatternType } from '@repo/types';
import type {
  DifficultyKey,
  DifficultyProfile,
  MilestoneThreshold,
  PhaseConfig,
} from '@repo/types';

const P = PatternType;
const PK = [
  P.Scatter,
  P.StairUp,
  P.StairDown,
  P.SineWave,
  P.Zigzag,
  P.Tunnel,
  P.Squeeze,
  P.Rapids,
  P.Drift,
] as const;

function pw(v: number[]): Record<PatternType, number> {
  return Object.fromEntries(PK.map((k, i) => [k, v[i] ?? 0])) as Record<PatternType, number>;
}

// Tiers: [scatter, stairUp, stairDown, sineWave, zigzag, tunnel, squeeze, rapids, drift]
const W_WARMUP = pw([3, 0, 0, 0, 0, 0, 0, 0, 2]);
const W_BASIC = pw([3, 2, 2, 2, 0, 0, 0, 0, 1]);
const W_MID = pw([2, 2, 2, 2, 0, 2, 0, 0, 1]);
const W_VARIED = pw([2, 2, 2, 2, 1, 2, 0, 0, 1]);
const W_INTENSE = pw([2, 2, 2, 2, 2, 2, 2, 0, 1]);
const W_FULL = pw([2, 2, 2, 2, 3, 2, 2, 2, 1]);
const W_AGGRO = pw([1, 2, 2, 1, 4, 2, 3, 3, 1]);

function ph(
  name: string,
  score: number,
  gap: number,
  speed: number,
  spawn: number,
  breather: number,
  intensity: [number, number],
  patterns: Record<PatternType, number>,
): PhaseConfig {
  return {
    name,
    scoreThreshold: score,
    gapMultiplier: gap,
    speedMultiplier: speed,
    spawnMultiplier: spawn,
    breatherFrequency: breather,
    intensityRange: intensity,
    patternWeights: patterns,
  };
}

export const MILESTONES: MilestoneThreshold[] = [
  { score: 10, label: 'Getting Started', celebration: 'minor' },
  { score: 25, label: 'Warmed Up', celebration: 'minor' },
  { score: 50, label: 'Half Century', celebration: 'major' },
  { score: 100, label: 'Century', celebration: 'major' },
  { score: 250, label: 'Quarter K', celebration: 'major' },
  { score: 500, label: 'Half K', celebration: 'epic' },
  { score: 1000, label: 'Thousand Club', celebration: 'epic' },
  { score: 2000, label: 'Double K', celebration: 'epic' },
  { score: 3000, label: 'Triple K', celebration: 'epic' },
  { score: 5000, label: 'Five Thousand', celebration: 'epic' },
  { score: 7000, label: 'Seven K', celebration: 'epic' },
  { score: 8001, label: 'The Final Stretch', celebration: 'epic' },
  { score: 9000, label: "It's Over 9000", celebration: 'epic' },
];

const EASY: DifficultyProfile = {
  key: Difficulty.Easy,
  name: 'Easy',
  subtitle: '',
  graceFactor: 0.35,
  gapFloor: 120,
  speedCeiling: 3.2,
  nearMissMargin: 12,
  hasGapVariation: false,
  gapVariationAmount: 0,
  hasTimingVariation: false,
  timingVariationAmount: 0,
  milestones: MILESTONES,
  phases: [
    ph('Warmup', 0, 1.0, 1.0, 1.0, 3, [0.1, 0.3], W_WARMUP),
    ph('Rising', 10, 1.0, 1.0, 1.0, 3, [0.15, 0.35], W_BASIC),
    ph('Development', 30, 0.95, 1.04, 0.97, 3, [0.2, 0.45], W_MID),
    ph('Intensification', 60, 0.9, 1.08, 0.94, 4, [0.25, 0.55], W_VARIED),
    ph('Mastery', 150, 0.85, 1.12, 0.9, 4, [0.3, 0.6], W_INTENSE),
    ph('Endurance', 400, 0.8, 1.16, 0.87, 5, [0.35, 0.65], W_FULL),
    ph('Marathon', 1000, 0.77, 1.22, 0.83, 5, [0.4, 0.7], W_FULL),
    ph('Legendary', 2500, 0.73, 1.28, 0.8, 6, [0.45, 0.75], W_FULL),
    ph('Mythic', 5000, 0.68, 1.34, 0.77, 7, [0.5, 0.8], W_FULL),
    ph('Final', 8001, 0.62, 1.42, 0.73, 8, [0.55, 0.85], W_FULL),
  ],
};

const NORMAL: DifficultyProfile = {
  key: Difficulty.Normal,
  name: 'Normal',
  subtitle: '',
  graceFactor: 0.2,
  gapFloor: 118,
  speedCeiling: 3.8,
  nearMissMargin: 8,
  hasGapVariation: false,
  gapVariationAmount: 0,
  hasTimingVariation: false,
  timingVariationAmount: 0,
  milestones: MILESTONES,
  phases: [
    ph('Warmup', 0, 1.0, 1.0, 1.0, 3, [0.15, 0.35], W_WARMUP),
    ph('Rising', 5, 1.0, 1.0, 1.0, 3, [0.2, 0.45], W_BASIC),
    ph('Development', 12, 0.95, 1.06, 0.96, 4, [0.25, 0.55], W_MID),
    ph('Intensification', 28, 0.88, 1.12, 0.92, 4, [0.35, 0.65], W_INTENSE),
    ph('Mastery', 50, 0.82, 1.18, 0.88, 5, [0.45, 0.75], W_FULL),
    ph('Endurance', 120, 0.77, 1.24, 0.84, 5, [0.55, 0.82], W_FULL),
    ph('Marathon', 400, 0.73, 1.3, 0.8, 6, [0.65, 0.88], W_FULL),
    ph('Legendary', 1500, 0.68, 1.36, 0.77, 7, [0.75, 0.92], W_FULL),
    ph('Mythic', 4000, 0.64, 1.4, 0.74, 8, [0.82, 0.96], W_FULL),
    ph('Final', 8001, 0.6, 1.45, 0.7, 9, [0.9, 1.0], W_FULL),
  ],
};

const HARD: DifficultyProfile = {
  key: Difficulty.Hard,
  name: 'Hard',
  subtitle: '',
  graceFactor: 0.1,
  gapFloor: 100,
  speedCeiling: 4.8,
  nearMissMargin: 5,
  hasGapVariation: false,
  gapVariationAmount: 0,
  hasTimingVariation: false,
  timingVariationAmount: 0,
  milestones: MILESTONES,
  phases: [
    ph('Warmup', 0, 1.0, 1.0, 1.0, 4, [0.3, 0.55], W_VARIED),
    ph('Rising', 3, 0.96, 1.04, 0.97, 4, [0.35, 0.65], W_VARIED),
    ph('Development', 7, 0.91, 1.09, 0.94, 4, [0.4, 0.7], W_INTENSE),
    ph('Intensification', 14, 0.85, 1.15, 0.9, 5, [0.5, 0.78], W_INTENSE),
    ph('Mastery', 25, 0.8, 1.22, 0.86, 5, [0.6, 0.85], W_FULL),
    ph('Endurance', 60, 0.75, 1.28, 0.82, 5, [0.65, 0.88], W_AGGRO),
    ph('Marathon', 200, 0.7, 1.34, 0.78, 6, [0.72, 0.92], W_AGGRO),
    ph('Legendary', 600, 0.65, 1.4, 0.75, 6, [0.8, 0.95], W_AGGRO),
    ph('Mythic', 2000, 0.6, 1.46, 0.72, 7, [0.87, 0.98], W_AGGRO),
    ph('Final', 8001, 0.55, 1.52, 0.68, 8, [0.92, 1.0], W_AGGRO),
  ],
};

const SOULS: DifficultyProfile = {
  key: Difficulty.Souls,
  name: 'Souls',
  subtitle: '',
  graceFactor: 0.04,
  gapFloor: 82,
  speedCeiling: 5.8,
  nearMissMargin: 3,
  hasGapVariation: true,
  gapVariationAmount: 15,
  hasTimingVariation: true,
  timingVariationAmount: 200,
  milestones: MILESTONES,
  phases: [
    ph('Warmup', 0, 1.0, 1.0, 1.0, 5, [0.5, 0.75], W_AGGRO),
    ph('Rising', 2, 0.94, 1.06, 0.96, 5, [0.55, 0.82], W_AGGRO),
    ph('Development', 5, 0.88, 1.12, 0.92, 5, [0.6, 0.87], W_AGGRO),
    ph('Intensification', 10, 0.82, 1.18, 0.88, 6, [0.65, 0.9], W_AGGRO),
    ph('Mastery', 18, 0.77, 1.24, 0.85, 6, [0.7, 0.93], W_AGGRO),
    ph('Endurance', 40, 0.72, 1.3, 0.82, 6, [0.75, 0.95], W_AGGRO),
    ph('Marathon', 120, 0.67, 1.36, 0.78, 7, [0.82, 0.97], W_AGGRO),
    ph('Legendary', 400, 0.62, 1.42, 0.75, 7, [0.88, 0.98], W_AGGRO),
    ph('Mythic', 1500, 0.57, 1.48, 0.72, 7, [0.92, 0.99], W_AGGRO),
    ph('Final', 8001, 0.52, 1.55, 0.68, 8, [0.96, 1.0], W_AGGRO),
  ],
};

export const DIFFICULTY_PROFILES: Record<DifficultyKey, DifficultyProfile> = {
  [Difficulty.Easy]: EASY,
  [Difficulty.Normal]: NORMAL,
  [Difficulty.Hard]: HARD,
  [Difficulty.Souls]: SOULS,
};

export function getDifficultyProfile(key: DifficultyKey): DifficultyProfile {
  return DIFFICULTY_PROFILES[key];
}
