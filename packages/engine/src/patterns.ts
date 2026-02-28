import type { PipeIntent } from '@repo/types';
import { PatternType } from '@repo/types';

/** Parameters shared by all pattern generators. */
export interface PatternParams {
  /** Number of pipes in this phrase (typically 3–8). */
  count: number;
  /** Y center to start from (continuity with previous phrase). */
  startCenter: number;
  /** Base gap size for current phase (already phase-multiplied). */
  baseGap: number;
  /** Canvas logical height in pixels. */
  canvasH: number;
  /** Ground strip height in pixels. */
  groundH: number;
  /** Minimum distance from top/bottom edge for gap placement. */
  margin: number;
  /** Base spawn delay in ms (already phase-multiplied). */
  baseDelay: number;
  /** 0.0–1.0, controls pattern aggressiveness. */
  intensity: number;
  /** Deterministic random in [0,1) for reproducibility. */
  rng: () => number;
}

/** A function that generates a phrase of PipeIntents from shared params. */
export type PatternGenerator = (params: PatternParams) => PipeIntent[];

/** Clamp a gap center Y so the full gap stays within the playable area. */
export function clampToBounds(
  center: number,
  gap: number,
  canvasH: number,
  groundH: number,
  margin: number,
): number {
  const min = margin + gap / 2;
  const max = canvasH - groundH - margin - gap / 2;
  if (min > max) return (min + max) / 2;
  return Math.max(min, Math.min(max, center));
}

function bounded(p: PatternParams, raw: number, gap = p.baseGap): number {
  return clampToBounds(raw, gap, p.canvasH, p.groundH, p.margin);
}

function randomCenter(p: PatternParams): number {
  const min = p.margin + p.baseGap / 2;
  const range = p.canvasH - p.groundH - 2 * p.margin - p.baseGap;
  return bounded(p, min + p.rng() * Math.max(0, range));
}

function scatter(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  for (let i = 0; i < p.count; i++) {
    out.push({ gapCenter: randomCenter(p), gapSize: p.baseGap, delay: 0 });
  }
  return out;
}

function stairUp(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const step = 20 + p.intensity * 30;
  for (let i = 0; i < p.count; i++) {
    const c = bounded(p, p.startCenter - i * step);
    out.push({ gapCenter: c, gapSize: p.baseGap, delay: 0 });
  }
  return out;
}

function stairDown(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const step = 20 + p.intensity * 30;
  for (let i = 0; i < p.count; i++) {
    const c = bounded(p, p.startCenter + i * step);
    out.push({ gapCenter: c, gapSize: p.baseGap, delay: 0 });
  }
  return out;
}

function sineWave(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const amp = 40 + p.intensity * 60;
  const freq = 0.8 + p.rng() * 0.4;
  const phase = p.rng() * Math.PI * 2;
  for (let i = 0; i < p.count; i++) {
    const raw = p.startCenter + amp * Math.sin(i * freq + phase);
    out.push({ gapCenter: bounded(p, raw), gapSize: p.baseGap, delay: 0 });
  }
  return out;
}

function zigzag(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const amp = 30 + p.intensity * 50;
  for (let i = 0; i < p.count; i++) {
    const offset = i % 2 === 0 ? -amp : amp;
    const c = bounded(p, p.startCenter + offset);
    out.push({ gapCenter: c, gapSize: p.baseGap, delay: 0 });
  }
  return out;
}

function tunnel(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const gap = p.baseGap * (0.85 - p.intensity * 0.1);
  for (let i = 0; i < p.count; i++) {
    const noise = (p.rng() - 0.5) * 10;
    const c = bounded(p, p.startCenter + noise, gap);
    out.push({ gapCenter: c, gapSize: gap, delay: 0 });
  }
  return out;
}

function squeeze(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const mid = Math.floor(p.count / 2);
  const shrink = p.intensity * 0.25;
  for (let i = 0; i < p.count; i++) {
    const dist = mid > 0 ? Math.abs(i - mid) / mid : 0;
    const gap = p.baseGap * (1 - shrink * (1 - dist));
    const noise = (p.rng() - 0.5) * 20;
    out.push({ gapCenter: bounded(p, p.startCenter + noise, gap), gapSize: gap, delay: 0 });
  }
  return out;
}

function rapids(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const factor = 0.5 + (1 - p.intensity) * 0.2;
  for (let i = 0; i < p.count; i++) {
    const d = p.baseDelay * factor;
    out.push({ gapCenter: randomCenter(p), gapSize: p.baseGap, delay: d });
  }
  return out;
}

function drift(p: PatternParams): PipeIntent[] {
  const out: PipeIntent[] = [];
  const gap = p.baseGap * 1.05;
  const factor = 1.05 + (1 - p.intensity) * 0.1;
  const amp = 15 + (1 - p.intensity) * 15;
  const freq = 0.5;
  for (let i = 0; i < p.count; i++) {
    const raw = p.startCenter + amp * Math.sin(i * freq);
    const d = p.baseDelay * factor;
    out.push({ gapCenter: bounded(p, raw, gap), gapSize: gap, delay: d });
  }
  return out;
}

/** All pattern generators keyed by PatternType. */
export const PATTERN_GENERATORS: Record<PatternType, PatternGenerator> = {
  [PatternType.Scatter]: scatter,
  [PatternType.StairUp]: stairUp,
  [PatternType.StairDown]: stairDown,
  [PatternType.SineWave]: sineWave,
  [PatternType.Zigzag]: zigzag,
  [PatternType.Tunnel]: tunnel,
  [PatternType.Squeeze]: squeeze,
  [PatternType.Rapids]: rapids,
  [PatternType.Drift]: drift,
};
