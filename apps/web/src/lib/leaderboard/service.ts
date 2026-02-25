import type {
  DifficultyKey,
  LeaderboardEntry,
  NicknameCheckResult,
} from '@repo/flappy-nature-game';

export interface LiveScoreBroadcast {
  sessionId: string;
  nickname: string;
  score: number;
  difficulty: DifficultyKey;
  timestamp: number;
}

export interface LeaderboardService {
  getLeaderboard(difficulty: DifficultyKey, limit?: number): Promise<LeaderboardEntry[]>;
  submitScore(score: number, difficulty: DifficultyKey): Promise<LeaderboardEntry>;
  checkNickname(nickname: string): Promise<NicknameCheckResult>;
  registerNickname(nickname: string): Promise<{ nickname: string }>;
  subscribeToScores(difficulty: DifficultyKey, onUpdate: () => void): () => void;
  broadcastLiveScore?(score: number, difficulty: DifficultyKey, nickname: string): void;
  subscribeToBroadcasts?(
    difficulty: DifficultyKey,
    onBroadcast: (broadcast: LiveScoreBroadcast) => void,
  ): () => void;
  getNickname(): Promise<string | null>;
  initAuth(): Promise<void>;
  dispose(): void;
}
