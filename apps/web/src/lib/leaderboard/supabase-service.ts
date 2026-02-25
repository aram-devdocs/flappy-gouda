import type {
  DifficultyKey,
  LeaderboardEntry,
  NicknameCheckResult,
} from '@repo/flappy-nature-game';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/client.js';
import { isProfane } from './profanity.js';
import { NicknameSchema, ScoreSubmitSchema } from './schemas.js';
import type { LeaderboardService } from './service.js';

export class SupabaseLeaderboardService implements LeaderboardService {
  private channels: RealtimeChannel[] = [];

  async initAuth(): Promise<void> {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      await supabase.auth.signInAnonymously();
    }
  }

  async getLeaderboard(difficulty: DifficultyKey, limit = 25): Promise<LeaderboardEntry[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('scores')
      .select('id, nickname, score, difficulty, created_at')
      .eq('difficulty', difficulty)
      .order('score', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row, index) => ({
      id: row.id,
      nickname: row.nickname,
      score: row.score,
      difficulty: row.difficulty as DifficultyKey,
      createdAt: row.created_at,
      rank: index + 1,
    }));
  }

  async submitScore(score: number, difficulty: DifficultyKey): Promise<LeaderboardEntry> {
    if (!supabase) throw new Error('Supabase not configured');

    const parsed = ScoreSubmitSchema.parse({ score, difficulty });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Try edge function first (server-side validation)
    const { data, error } = await supabase.functions.invoke('validate-score', {
      body: parsed,
    });

    if (!error && data) {
      return {
        id: data.id,
        nickname: data.nickname,
        score: data.score,
        difficulty: data.difficulty,
        createdAt: new Date().toISOString(),
        rank: 0,
      };
    }

    // Fallback: direct DB upsert (local dev when edge function is unavailable)
    return this.submitScoreDirect(session.user.id, parsed.score, parsed.difficulty);
  }

  private async submitScoreDirect(
    userId: string,
    score: number,
    difficulty: string,
  ): Promise<LeaderboardEntry> {
    if (!supabase) throw new Error('Supabase not configured');

    let { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      const raw = localStorage.getItem('sn-flappy-nickname');
      const nickname = raw ? (JSON.parse(raw) as string) : null;
      if (!nickname) throw new Error('No nickname set');
      await supabase.from('profiles').upsert({ id: userId, nickname }, { onConflict: 'id' });
      profile = { nickname };
    }

    const { data: existing } = await supabase
      .from('scores')
      .select('id, score')
      .eq('user_id', userId)
      .eq('difficulty', difficulty)
      .maybeSingle();

    if (existing && existing.score >= score) {
      return {
        id: existing.id,
        nickname: profile.nickname,
        score: existing.score,
        difficulty: difficulty as DifficultyKey,
        createdAt: new Date().toISOString(),
        rank: 0,
      };
    }

    const { data: upserted, error: upsertError } = await supabase
      .from('scores')
      .upsert(
        {
          user_id: userId,
          nickname: profile.nickname,
          score,
          difficulty,
          updated_at: new Date().toISOString(),
          ...(existing ? { id: existing.id } : {}),
        },
        { onConflict: 'user_id,difficulty' },
      )
      .select()
      .single();

    if (upsertError) throw new Error(upsertError.message);
    return {
      id: upserted.id,
      nickname: profile.nickname,
      score: upserted.score,
      difficulty: upserted.difficulty as DifficultyKey,
      createdAt: new Date().toISOString(),
      rank: 0,
    };
  }

  async checkNickname(nickname: string): Promise<NicknameCheckResult> {
    const result = NicknameSchema.safeParse(nickname);
    if (!result.success) {
      return { available: false, reason: 'Must be 3 uppercase letters or numbers' };
    }
    if (isProfane(nickname)) {
      return { available: false, reason: 'Nickname not allowed' };
    }
    if (!supabase) return { available: true };

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle();

    if (data) {
      return { available: false, reason: 'Already taken' };
    }
    return { available: true };
  }

  async registerNickname(nickname: string): Promise<{ nickname: string }> {
    if (!supabase) throw new Error('Supabase not configured');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('profiles').insert({ id: user.id, nickname });

    if (error) throw new Error(error.message);
    return { nickname };
  }

  subscribeToScores(
    difficulty: DifficultyKey,
    onUpdate: (entries: LeaderboardEntry[]) => void,
  ): () => void {
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`scores-${difficulty}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores', filter: `difficulty=eq.${difficulty}` },
        () => {
          // Re-fetch full leaderboard on any change
          this.getLeaderboard(difficulty)
            .then(onUpdate)
            .catch((err: unknown) => {
              // biome-ignore lint/suspicious/noConsole: operational warning for realtime refetch failure
              console.warn('[leaderboard] realtime refetch failed:', err);
            });
        },
      )
      .subscribe();

    this.channels.push(channel);
    return () => {
      supabase?.removeChannel(channel);
      this.channels = this.channels.filter((c) => c !== channel);
    };
  }

  async getNickname(): Promise<string | null> {
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle();

    return data?.nickname ?? null;
  }

  dispose(): void {
    if (!supabase) return;
    for (const channel of this.channels) {
      supabase.removeChannel(channel);
    }
    this.channels = [];
  }
}
