import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_SCORE = 9999;
const DIFFICULTY_VALUES = ['easy', 'normal', 'hard', 'souls'] as const;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function validateOrigin(req: Request): boolean {
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');

  const origin = req.headers.get('origin') ?? '';
  if (!origin) return true;

  return allowedOrigins.some((allowed) => origin.startsWith(allowed));
}

function isValidScore(score: unknown): score is number {
  return typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= MAX_SCORE;
}

function isValidDifficulty(d: unknown): d is string {
  return DIFFICULTY_VALUES.includes(d as (typeof DIFFICULTY_VALUES)[number]);
}

async function authenticateUser(authHeader: string, supabaseUrl: string, anonKey: string) {
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  return userClient.auth.getUser();
}

async function parseAndValidateBody(
  req: Request,
): Promise<{ score: number; difficulty: string } | Response> {
  let body: { score: unknown; difficulty: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { score, difficulty } = body;
  if (!isValidScore(score))
    return jsonResponse({ error: 'Invalid score: must be integer 0-9999' }, 400);
  if (!isValidDifficulty(difficulty)) {
    return jsonResponse({ error: 'Invalid difficulty: must be easy, normal, hard, or souls' }, 400);
  }

  return { score, difficulty };
}

async function handleScoreSubmission(req: Request): Promise<Response> {
  if (!validateOrigin(req)) return jsonResponse({ error: 'Origin not allowed' }, 403);

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  const {
    data: { user },
    error: authError,
  } = await authenticateUser(authHeader, supabaseUrl, supabaseAnonKey);
  if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);
  if (isRateLimited(user.id)) return jsonResponse({ error: 'Rate limit exceeded' }, 429);

  const parsed = await parseAndValidateBody(req);
  if (parsed instanceof Response) return parsed;

  const { score, difficulty } = parsed;
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) {
    return jsonResponse({ error: 'Profile not found. Set a nickname first.' }, 400);
  }

  const { data: existing } = await serviceClient
    .from('scores')
    .select('id, score')
    .eq('user_id', user.id)
    .eq('difficulty', difficulty)
    .single();

  if (existing && existing.score >= score) {
    return jsonResponse(
      {
        id: existing.id,
        nickname: profile.nickname,
        score: existing.score,
        difficulty,
        updated: false,
      },
      200,
    );
  }

  const { data: upserted, error: upsertError } = await serviceClient
    .from('scores')
    .upsert(
      {
        user_id: user.id,
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

  if (upsertError) return jsonResponse({ error: 'Failed to save score' }, 500);

  return jsonResponse(
    {
      id: upserted.id,
      nickname: profile.nickname,
      score: upserted.score,
      difficulty: upserted.difficulty,
      updated: true,
    },
    200,
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  return handleScoreSubmission(req);
});
