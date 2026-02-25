import type { DifficultyKey } from './game';

/** Required length for player nicknames. */
export const NICKNAME_LENGTH = 3;

/** Pattern matching valid nicknames: exactly 3 uppercase alphanumeric characters. */
export const NICKNAME_PATTERN = /^[A-Z0-9]{3}$/;

/** A single entry on the leaderboard. */
export interface LeaderboardEntry {
  /** Unique identifier for this score record. */
  id: string;
  /** Player's 3-letter nickname. */
  nickname: string;
  /** Score achieved. */
  score: number;
  /** Difficulty level the score was achieved on. */
  difficulty: DifficultyKey;
  /** ISO 8601 timestamp of when the score was set. */
  createdAt: string;
  /** Position on the leaderboard (1-indexed). */
  rank: number;
}

/** Result of checking nickname availability. */
export interface NicknameCheckResult {
  /** Whether the nickname is available for use. */
  available: boolean;
  /** Reason the nickname is unavailable (profanity, taken, etc). */
  reason?: string;
}

/** Real-time connection status for the leaderboard backend. */
export type LeaderboardConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** Data needed to render the leaderboard UI. */
export interface LeaderboardData {
  /** Ordered list of leaderboard entries. */
  entries: LeaderboardEntry[];
  /** Current player's entry, if they have a score. */
  playerEntry: LeaderboardEntry | null;
  /** Whether leaderboard data is currently loading. */
  isLoading: boolean;
  /** Real-time connection status. */
  connectionStatus: LeaderboardConnectionStatus;
}

/** Callbacks the game component fires for leaderboard actions. */
export interface LeaderboardCallbacks {
  /** Called when a score should be submitted (on game over). */
  onScoreSubmit: (score: number, difficulty: DifficultyKey) => void;
  /** Called when the player sets their nickname. */
  onNicknameSet: (nickname: string) => void;
  /** Called to check if a nickname is available. */
  onNicknameCheck: (nickname: string) => Promise<NicknameCheckResult>;
}

/** Separator marker between non-contiguous leaderboard regions. */
export interface LeaderboardSeparator {
  type: 'separator';
  rankAbove: number;
  rankBelow: number;
}

/** An entry in the windowed leaderboard view. */
export interface LeaderboardWindowEntry {
  type: 'entry';
  entry: LeaderboardEntry;
  /** Whether this entry is a live (ephemeral, not yet persisted) score. */
  isLive?: boolean;
}

/** A single renderable item in the windowed leaderboard list. */
export type LeaderboardWindowItem = LeaderboardWindowEntry | LeaderboardSeparator;

/** Optional leaderboard props passed to the game component. */
export interface LeaderboardProps {
  /** Leaderboard data to display. When undefined, leaderboard UI is hidden. */
  leaderboard?: LeaderboardData;
  /** Callbacks for leaderboard interactions. */
  leaderboardCallbacks?: LeaderboardCallbacks;
  /** Player's current nickname. Null triggers the nickname modal. */
  nickname?: string | null;
  /** Whether the external leaderboard sheet/panel is expanded. Hides the in-game mini overlay. */
  leaderboardExpanded?: boolean;
}
