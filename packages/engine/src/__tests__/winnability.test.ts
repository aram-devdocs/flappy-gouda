import type { GameConfig, PipeIntent } from '@repo/types';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../config';
import { computeReachableBand, validateAndClamp } from '../winnability';

const NORMAL = DEFAULT_CONFIG;

function makeIntent(overrides: Partial<PipeIntent> = {}): PipeIntent {
  return {
    gapCenter: 260,
    gapSize: DEFAULT_CONFIG.pipeGap,
    delay: DEFAULT_CONFIG.pipeSpawn,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

// ---------------------------------------------------------------------------
// computeReachableBand
// ---------------------------------------------------------------------------

describe('computeReachableBand', () => {
  it('returns the starting position for both bounds when ticks = 0', () => {
    const band = computeReachableBand(200, 0, NORMAL.gravity, NORMAL.flapForce, NORMAL.terminalVel);
    expect(band.minY).toBe(200);
    expect(band.maxY).toBe(200);
  });

  it('computes correct band for 1 tick with Normal physics', () => {
    const band = computeReachableBand(200, 1, NORMAL.gravity, NORMAL.flapForce, NORMAL.terminalVel);
    // Up: vy = flapForce + gravity = -5.2 + 0.30 = -4.90, y = 200 - 4.90 = 195.10
    expect(band.minY).toBeCloseTo(195.1, 1);
    // Down: vy = 0.30, y = 200 + 0.30 = 200.30
    expect(band.maxY).toBeCloseTo(200.3, 1);
  });

  it('computes correct band for 3 ticks with Normal physics', () => {
    const band = computeReachableBand(200, 3, NORMAL.gravity, NORMAL.flapForce, NORMAL.terminalVel);
    // Up: 3 × -4.90 = -14.70, y = 185.30
    expect(band.minY).toBeCloseTo(185.3, 1);
    // Down: 0.30 + 0.60 + 0.90 = 1.80, y = 201.80
    expect(band.maxY).toBeCloseTo(201.8, 1);
  });

  it('clamps to ceiling (y = 0) during upward simulation', () => {
    const band = computeReachableBand(3, 2, NORMAL.gravity, NORMAL.flapForce, NORMAL.terminalVel);
    // Tick 1: vy = -4.90, y = 3 - 4.90 → 0
    // Tick 2: vy = -4.90, y = 0 - 4.90 → 0
    expect(band.minY).toBe(0);
    expect(band.maxY).toBeCloseTo(3.9, 1);
  });

  it('respects terminal velocity during free-fall', () => {
    // With gravity 5.0 and terminalVel 5.5, terminal is hit on tick 2
    const band = computeReachableBand(100, 4, 5.0, -5.0, 5.5);
    // Down: tick 1 vy=5.0, tick 2 vy=10→5.5, tick 3 vy=10.5→5.5, tick 4 vy=10.5→5.5
    // y: 105, 110.5, 116, 121.5
    expect(band.maxY).toBeCloseTo(121.5, 1);
  });

  it('minY is always <= maxY', () => {
    const configs = [
      { g: 0.22, f: -4.6, t: 4.8 },
      { g: 0.28, f: -5.0, t: 5.5 },
      { g: 0.38, f: -6.0, t: 7.0 },
      { g: 0.48, f: -7.2, t: 8.5 },
    ];
    for (const c of configs) {
      for (const ticks of [1, 10, 50, 100]) {
        const band = computeReachableBand(250, ticks, c.g, c.f, c.t);
        expect(band.minY).toBeLessThanOrEqual(band.maxY);
      }
    }
  });

  it('upward reach increases monotonically with more ticks', () => {
    let prevMin = 200;
    for (const t of [1, 5, 10, 20]) {
      const band = computeReachableBand(
        200,
        t,
        NORMAL.gravity,
        NORMAL.flapForce,
        NORMAL.terminalVel,
      );
      expect(band.minY).toBeLessThanOrEqual(prevMin);
      prevMin = band.minY;
    }
  });

  it('downward reach increases monotonically with more ticks', () => {
    let prevMax = 200;
    for (const t of [1, 5, 10, 20]) {
      const band = computeReachableBand(
        200,
        t,
        NORMAL.gravity,
        NORMAL.flapForce,
        NORMAL.terminalVel,
      );
      expect(band.maxY).toBeGreaterThanOrEqual(prevMax);
      prevMax = band.maxY;
    }
  });
});

// ---------------------------------------------------------------------------
// validateAndClamp
// ---------------------------------------------------------------------------

describe('validateAndClamp', () => {
  it('returns the intent unchanged when target is within the graced band', () => {
    const intent = makeIntent({ gapCenter: 265 });
    const result = validateAndClamp(intent, 260, makeConfig(), 0.25);
    expect(result).toBe(intent);
  });

  it('clamps an unreachably high target downward', () => {
    const config = makeConfig();
    const intent = makeIntent({ gapCenter: 50, delay: 400 });
    const result = validateAndClamp(intent, 260, config, 0.25);
    expect(result.gapCenter).toBeGreaterThan(50);
    expect(result.gapSize).toBe(intent.gapSize);
    expect(result.delay).toBe(intent.delay);
  });

  it('clamps an unreachably low target upward', () => {
    const config = makeConfig();
    const intent = makeIntent({ gapCenter: 460, delay: 400 });
    const result = validateAndClamp(intent, 260, config, 0.25);
    expect(result.gapCenter).toBeLessThan(460);
  });

  it('uses config.pipeSpawn when intent delay is 0', () => {
    const intent = makeIntent({ gapCenter: 265, delay: 0 });
    const result = validateAndClamp(intent, 260, makeConfig(), 0.25);
    expect(result).toBe(intent);
  });

  it('with graceFactor 0, the full reachable band is valid', () => {
    const config = makeConfig();
    const band = computeReachableBand(
      260,
      78,
      config.gravity,
      config.flapForce,
      config.terminalVel,
    );
    const playableMax = config.height - config.groundH;
    const boundedMax = Math.min(playableMax, band.maxY);
    const target = boundedMax - 1;
    const intent = makeIntent({ gapCenter: target });
    const result = validateAndClamp(intent, 260, config, 0);
    expect(result).toBe(intent);
  });

  it('with graceFactor 1, collapses to band midpoint', () => {
    const config = makeConfig();
    const intent = makeIntent({ gapCenter: 100, delay: 600 });
    const result = validateAndClamp(intent, 260, config, 1.0);

    const TICK_MS = 1000 / 60;
    const delayTicks = 600 / TICK_MS;
    const horizontalDist = config.pipeSpeed * delayTicks - config.pipeWidth;
    const ticks = Math.max(1, Math.floor(horizontalDist / config.pipeSpeed));

    const band = computeReachableBand(
      260,
      ticks,
      config.gravity,
      config.flapForce,
      config.terminalVel,
    );
    const playableMax = config.height - config.groundH;
    const boundedMin = Math.max(0, band.minY);
    const boundedMax = Math.min(playableMax, band.maxY);
    const mid = (boundedMin + boundedMax) / 2;
    expect(result.gapCenter).toBeCloseTo(mid, 1);
  });

  it('preserves gapSize and delay when clamping gapCenter', () => {
    const intent = makeIntent({ gapCenter: 50, gapSize: 140, delay: 400 });
    const result = validateAndClamp(intent, 260, makeConfig(), 0.25);
    expect(result.gapSize).toBe(140);
    expect(result.delay).toBe(400);
  });

  it('clamps within playable area even with large downward reach', () => {
    const config = makeConfig();
    const playableMax = config.height - config.groundH;
    const intent = makeIntent({ gapCenter: playableMax + 50 });
    const result = validateAndClamp(intent, 260, config, 0.25);
    expect(result.gapCenter).toBeLessThanOrEqual(playableMax);
  });

  it('works with Souls difficulty physics', () => {
    const config = makeConfig({
      gravity: 0.48,
      flapForce: -7.2,
      terminalVel: 8.5,
      pipeGap: 118,
      pipeSpeed: 3.2,
      pipeSpawn: 1150,
      pipeWidth: 52,
    });
    const intent = makeIntent({ gapCenter: 250, gapSize: 118, delay: 1150 });
    const result = validateAndClamp(intent, 260, config, 0.05);
    expect(result.gapCenter).toBeGreaterThanOrEqual(0);
    expect(result.gapCenter).toBeLessThanOrEqual(config.height - config.groundH);
  });

  it('ensures at least 1 tick even with very short delays', () => {
    const config = makeConfig();
    const intent = makeIntent({ gapCenter: 260, delay: 50 });
    const result = validateAndClamp(intent, 260, config, 0.25);
    expect(result.gapCenter).toBeGreaterThanOrEqual(0);
  });
});
