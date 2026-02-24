import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LocalLeaderboardService, SupabaseLeaderboardService } from '../lib/leaderboard/index.js';
import type { LeaderboardService } from '../lib/leaderboard/index.js';
import { isSupabaseConfigured } from '../lib/supabase/client.js';

const ServiceContext = createContext<LeaderboardService | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2 },
  },
});

export function useLeaderboardService(): LeaderboardService {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useLeaderboardService must be used within LeaderboardProvider');
  return ctx;
}

interface LeaderboardProviderProps {
  children: ReactNode;
}

export function LeaderboardProvider({ children }: LeaderboardProviderProps) {
  const serviceRef = useRef<LeaderboardService | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const service = isSupabaseConfigured
      ? new SupabaseLeaderboardService()
      : new LocalLeaderboardService();

    serviceRef.current = service;
    service
      .initAuth()
      .then(() => setReady(true))
      .catch((err: unknown) => {
        // biome-ignore lint/suspicious/noConsole: operational warning for auth failure
        console.warn('[leaderboard] auth init failed, continuing without auth:', err);
        setReady(true);
      });

    return () => {
      service.dispose();
    };
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceContext.Provider value={serviceRef.current}>{children}</ServiceContext.Provider>
    </QueryClientProvider>
  );
}
