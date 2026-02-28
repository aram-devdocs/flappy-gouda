import type {
  DifficultyProfile,
  GameConfig,
  PatternType,
  PhaseConfig,
  PipeIntent,
} from '@repo/types';
import { MovementArc, PatternType as PT } from '@repo/types';
import { PATTERN_GENERATORS, type PatternParams } from './patterns';
import {
  ARC_LENGTHS,
  BUILD_PATTERNS,
  CLIMAX_PATTERNS,
  MAX_REROLLS,
  MIN_TIMING_FLOOR_MS,
  PHRASE_MAX,
  PHRASE_MIN,
  nextArcPhase,
  pickRelease,
  weightedPick,
} from './pipe-director-utils';
import type { ProgressionManager } from './progression';
import { validateAndClamp } from './winnability';

/** Optional log callback for debug panel integration. */
export type DirectorLogFn = (
  type: 'director' | 'pattern',
  message: string,
  data?: Record<string, unknown>,
) => void;

/**
 * Orchestrates pipe placement using phrase-based patterns, movement arc cycling,
 * and winnability validation. Owns the intent queue and narrative rhythm.
 */
export class PipeDirector {
  private queue: PipeIntent[] = [];
  private lastCenter: number;
  private lastPattern: PatternType | null = null;
  private arc: MovementArc = MovementArc.Build;
  private arcPhraseIdx = 0;
  private arcTarget = 0;
  private phrasesSinceBreather = 0;
  private log: DirectorLogFn | null = null;
  constructor(
    private progression: ProgressionManager,
    private readonly profile: DifficultyProfile,
    private readonly config: GameConfig,
  ) {
    this.lastCenter = config.height / 2;
    this.arcTarget = this.rollArcLength(MovementArc.Build);
  }

  setLogFn(fn: DirectorLogFn): void {
    this.log = fn;
  }

  get currentArc(): MovementArc {
    return this.arc;
  }

  get effectiveSpeed(): number {
    return this.progression.effectiveSpeed;
  }
  get effectiveSpawnDelay(): number {
    return this.progression.effectiveSpawnDelay;
  }

  /** Pop the next validated PipeIntent, generating a new phrase if the queue is empty. */
  next(): PipeIntent {
    if (this.queue.length === 0) this.enqueuePhrase();
    const intent = this.queue.shift();
    if (!intent) throw new Error('PipeDirector: queue empty after enqueue');
    return intent;
  }

  /** Clear all state for a fresh run. */
  reset(): void {
    this.queue.length = 0;
    this.lastCenter = this.config.height / 2;
    this.lastPattern = null;
    this.arc = MovementArc.Build;
    this.arcPhraseIdx = 0;
    this.arcTarget = this.rollArcLength(MovementArc.Build);
    this.phrasesSinceBreather = 0;
  }

  private enqueuePhrase(): void {
    const phase = this.progression.phase;
    const breatherOverdue = this.phrasesSinceBreather >= phase.breatherFrequency;

    const pattern: PatternType =
      this.arc === MovementArc.Release || breatherOverdue ? pickRelease() : this.pickPattern(phase);

    if (this.arc === MovementArc.Release || breatherOverdue) {
      this.phrasesSinceBreather = 0;
    }

    const [minI, maxI] = phase.intensityRange;
    const intensity = minI + Math.random() * (maxI - minI);
    const count = PHRASE_MIN + Math.floor(Math.random() * (PHRASE_MAX - PHRASE_MIN + 1));

    const params: PatternParams = {
      count,
      startCenter: this.lastCenter,
      baseGap: this.progression.effectiveGap,
      canvasH: this.config.height,
      groundH: this.config.groundH,
      margin: this.config.pipeSpawnMargin,
      baseDelay: this.progression.effectiveSpawnDelay,
      intensity,
      rng: Math.random,
    };

    const raw = PATTERN_GENERATORS[pattern](params);
    let prev = this.lastCenter;
    for (let i = 0; i < raw.length; i++) {
      const base = raw[i];
      if (!base) continue;
      let intent: PipeIntent = this.applyVariations(base);
      intent = validateAndClamp(intent, prev, this.config, this.profile.graceFactor);
      raw[i] = intent;
      prev = intent.gapCenter;
    }

    this.queue.push(...raw);
    this.lastCenter = prev;
    this.lastPattern = pattern;
    this.phrasesSinceBreather++;

    if (this.log) {
      const breatherTag = breatherOverdue ? ' [breather]' : '';
      this.log(
        'pattern',
        `${pattern} ×${count} i=${intensity.toFixed(2)} arc=${this.arc}${breatherTag}`,
        {
          pattern,
          count,
          intensity,
          arc: this.arc,
          gap: this.progression.effectiveGap,
          speed: this.progression.effectiveSpeed,
        },
      );
    }

    this.advanceArc();
  }

  private pickPattern(phase: PhaseConfig): PatternType {
    const allowed = this.arc === MovementArc.Climax ? CLIMAX_PATTERNS : BUILD_PATTERNS;
    const weights = phase.patternWeights;

    for (let roll = 0; roll <= MAX_REROLLS; roll++) {
      const pick = weightedPick(weights, allowed);
      if (pick !== this.lastPattern || roll === MAX_REROLLS) return pick;
    }
    return PT.Scatter;
  }

  private applyVariations(intent: PipeIntent): PipeIntent {
    let { gapSize, delay } = intent;
    const { gapCenter } = intent;
    let changed = false;

    if (this.profile.hasGapVariation) {
      const v = this.profile.gapVariationAmount;
      gapSize += (Math.random() * 2 - 1) * v;
      gapSize = Math.max(this.profile.gapFloor, gapSize);
      changed = true;
    }
    if (this.profile.hasTimingVariation && delay > 0) {
      const v = this.profile.timingVariationAmount;
      delay += (Math.random() * 2 - 1) * v;
      delay = Math.max(MIN_TIMING_FLOOR_MS, delay);
      changed = true;
    }

    return changed ? { gapCenter, gapSize, delay } : intent;
  }

  private advanceArc(): void {
    this.arcPhraseIdx++;
    if (this.arcPhraseIdx < this.arcTarget) return;
    this.arcPhraseIdx = 0;
    const prev = this.arc;
    this.arc = nextArcPhase(this.arc);
    this.arcTarget = this.rollArcLength(this.arc);
    this.log?.('director', `Arc: ${prev} → ${this.arc} (${this.arcTarget} phrases)`);
  }

  private rollArcLength(arc: MovementArc): number {
    const lengths = ARC_LENGTHS[this.profile.key] ?? ARC_LENGTHS.normal;
    const range = lengths?.[arc] ?? [3, 4];
    return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
  }
}
