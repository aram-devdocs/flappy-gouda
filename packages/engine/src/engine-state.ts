import type { BestScores, Bird, DifficultyKey, GameConfig, GameState } from '@repo/types';
import { applyDifficulty } from './config';
import type { EngineEventEmitter } from './engine-events';
import { saveBestScores, saveDifficulty } from './persistence';

/** Manages mutable game state (score, difficulty, pause) and emits change events. */
export class EngineState {
  state: GameState = 'idle';
  score = 0;
  bestScores: BestScores = { easy: 0, normal: 0, hard: 0 };
  difficulty: DifficultyKey = 'normal';
  deadTime = 0;
  lastPipeTime = 0;
  prevStateBeforePause: GameState | null = null;
  pausedTime = 0;

  constructor(private events: EngineEventEmitter) {}

  /** Transition to a new game state and emit `stateChange`. */
  setState(state: GameState): void {
    if (this.state === state) return;
    this.state = state;
    this.events.emit('stateChange', state);
  }

  /** Update the current score and emit `scoreChange`. */
  setScore(score: number): void {
    if (this.score === score) return;
    this.score = score;
    this.events.emit('scoreChange', score);
  }

  /** Reset score, bird position, and state back to idle for a new round. */
  resetGameState(bird: Bird, config: GameConfig): void {
    bird.y = config.height / 2 - 30;
    bird.vy = 0;
    bird.rot = 0;
    this.setScore(0);
    this.setState('idle');
    this.lastPipeTime = 0;
    this.deadTime = 0;
    this.prevStateBeforePause = null;
    this.pausedTime = 0;
  }

  /** End the current run. Persists a new best score if achieved. */
  die(): void {
    this.setState('dead');
    this.deadTime = performance.now();
    if (this.score > this.bestScores[this.difficulty]) {
      this.bestScores[this.difficulty] = this.score;
      saveBestScores(this.bestScores);
      this.events.emit('bestScoreChange', { ...this.bestScores });
    }
  }

  /** Switch difficulty, apply its physics preset, and persist the choice. */
  setDifficulty(key: DifficultyKey, config: GameConfig): void {
    if (key === this.difficulty) return;
    this.difficulty = key;
    applyDifficulty(key, config);
    saveDifficulty(key);
    this.events.emit('difficultyChange', key);
  }

  /** Pause the game if currently playing, recording the pause timestamp. */
  pause(): void {
    if (this.state === 'play') {
      this.prevStateBeforePause = 'play';
      this.pausedTime = performance.now();
      this.setState('paused');
    }
  }

  /** Resume from pause, adjusting timers to account for the paused duration. */
  resume(): void {
    if (this.state === 'paused' && this.prevStateBeforePause === 'play') {
      const elapsed = performance.now() - this.pausedTime;
      this.lastPipeTime += elapsed;
      this.setState('play');
    }
    this.prevStateBeforePause = null;
  }
}
