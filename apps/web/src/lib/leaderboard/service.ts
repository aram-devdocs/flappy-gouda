import type {
  DifficultyKey,
  LeaderboardEntry,
  NicknameCheckResult,
} from '@repo/flappy-nature-game';

export interface LeaderboardService {
  getLeaderboard(difficulty: DifficultyKey, limit?: number): Promise<LeaderboardEntry[]>;
  submitScore(score: number, difficulty: DifficultyKey): Promise<LeaderboardEntry>;
  checkNickname(nickname: string): Promise<NicknameCheckResult>;
  registerNickname(nickname: string): Promise<{ nickname: string }>;
  subscribeToScores(
    difficulty: DifficultyKey,
    onUpdate: (entries: LeaderboardEntry[]) => void,
  ): () => void;
  getNickname(): Promise<string | null>;
  initAuth(): Promise<void>;
  dispose(): void;
}
