import type { BestScores, DifficultyKey, GameColors, GameState } from './game';
import type { LeaderboardProps } from './leaderboard';

/** Props for the top-level FlappyNatureGame React component. */
export interface FlappyNatureGameProps extends LeaderboardProps {
  /** Custom color theme overrides. */
  colors?: Partial<GameColors>;
  /** Custom banner texts displayed on flying planes. */
  bannerTexts?: string[];
  /** Custom heading font family for canvas-rendered text. */
  fontFamily?: string;
  /** Initial difficulty level (defaults to persisted or 'normal'). */
  difficulty?: DifficultyKey;
  /** Called when the game transitions between idle, play, dead, or paused. */
  onStateChange?: (state: GameState) => void;
  /** Called when the player's score changes. */
  onScoreChange?: (score: number) => void;
  /** Called when a new personal best score is set. */
  onBestScoreChange?: (scores: BestScores) => void;
  /** Called when the player changes the difficulty level. */
  onDifficultyChange?: (difficulty: DifficultyKey) => void;
  /** Additional CSS class name applied to the outer container. */
  className?: string;
  /** Whether to show the FPS counter overlay. */
  showFps?: boolean;
}
