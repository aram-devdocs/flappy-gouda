import type {
  DifficultyKey,
  LeaderboardEntry,
  NicknameCheckResult,
} from '@repo/flappy-nature-game';
import type { LeaderboardService } from './service.js';

const STORAGE_KEY = 'sn-flappy-leaderboard';

interface StoredScore {
  nickname: string;
  score: number;
  difficulty: DifficultyKey;
  createdAt: string;
}

function readScores(): StoredScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredScore[]) : [];
  } catch {
    return [];
  }
}

function writeScores(scores: StoredScore[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    /* storage full */
  }
}

export class LocalLeaderboardService implements LeaderboardService {
  async initAuth(): Promise<void> {
    /* no-op */
  }

  async getLeaderboard(difficulty: DifficultyKey, limit = 100): Promise<LeaderboardEntry[]> {
    const scores = readScores()
      .filter((s) => s.difficulty === difficulty)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores.map((s, i) => ({
      id: `local-${s.nickname}-${s.difficulty}`,
      nickname: s.nickname,
      score: s.score,
      difficulty: s.difficulty,
      createdAt: s.createdAt,
      rank: i + 1,
    }));
  }

  async submitScore(score: number, difficulty: DifficultyKey): Promise<LeaderboardEntry> {
    const raw = localStorage.getItem('sn-flappy-nickname');
    const nickname = raw ? (JSON.parse(raw) as string) : 'AAA';

    const scores = readScores();
    const existing = scores.find((s) => s.nickname === nickname && s.difficulty === difficulty);

    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        existing.createdAt = new Date().toISOString();
      }
    } else {
      scores.push({ nickname, score, difficulty, createdAt: new Date().toISOString() });
    }

    writeScores(scores);
    return {
      id: `local-${nickname}-${difficulty}`,
      nickname,
      score: existing ? Math.max(existing.score, score) : score,
      difficulty,
      createdAt: new Date().toISOString(),
      rank: 0,
    };
  }

  async checkNickname(_nickname: string): Promise<NicknameCheckResult> {
    return { available: true };
  }

  async registerNickname(nickname: string): Promise<{ nickname: string }> {
    return { nickname };
  }

  subscribeToScores(_difficulty: DifficultyKey, onUpdate: () => void): () => void {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      onUpdate();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  async getNickname(): Promise<string | null> {
    try {
      const raw = localStorage.getItem('sn-flappy-nickname');
      return raw ? (JSON.parse(raw) as string) : null;
    } catch {
      return null;
    }
  }

  dispose(): void {
    /* no-op */
  }
}
