import type { DifficultyKey, LeaderboardData } from '@repo/types';
import { LeaderboardPanel, LeaderboardTab } from '@repo/ui';
import type { LeaderboardState } from './useLeaderboardState.js';

interface LeaderboardOverlayProps {
  leaderboard: LeaderboardData;
  lb: LeaderboardState;
  difficulty: DifficultyKey;
}

/** Renders the leaderboard tab and panel overlay. */
export function LeaderboardOverlay({ leaderboard, lb, difficulty }: LeaderboardOverlayProps) {
  return (
    <>
      <LeaderboardTab
        visible
        expanded={lb.leaderboardOpen}
        onClick={lb.toggleLeaderboard}
        connectionStatus={leaderboard.connectionStatus}
      />
      <LeaderboardPanel
        visible={lb.leaderboardOpen}
        entries={leaderboard.entries}
        playerEntry={leaderboard.playerEntry}
        isLoading={leaderboard.isLoading}
        onClose={lb.closeLeaderboard}
        difficulty={difficulty}
      />
    </>
  );
}
