import type { DifficultyKey, LeaderboardData } from '@repo/types';
import { LeaderboardPanel, LeaderboardTab, NicknameModal } from '@repo/ui';
import type { LeaderboardState } from './useLeaderboardState.js';

interface LeaderboardOverlayProps {
  leaderboard: LeaderboardData;
  lb: LeaderboardState;
  difficulty: DifficultyKey;
}

/** Renders the leaderboard tab, panel, and nickname modal. */
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
      <NicknameModal
        visible={lb.showNicknameModal}
        value={lb.nicknameValue}
        onChange={lb.handleNicknameChange}
        onSubmit={lb.handleNicknameSubmit}
        onClose={lb.closeNicknameModal}
        error={lb.nicknameError}
        checking={lb.nicknameChecking}
      />
    </>
  );
}
