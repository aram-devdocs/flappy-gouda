import { z } from 'zod';

export const NicknameSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z0-9]{3}$/, 'Must be 3 uppercase letters or numbers');

export const ScoreSubmitSchema = z.object({
  score: z.number().int().min(0).max(9999),
  difficulty: z.enum(['easy', 'normal', 'hard']),
});

export const LeaderboardQuerySchema = z.object({
  difficulty: z.enum(['easy', 'normal', 'hard']),
  limit: z.number().int().min(1).max(100).default(25),
});
