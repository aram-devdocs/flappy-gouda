import { DemoPage } from './components/DemoPage.js';
import { GameWithLeaderboard } from './components/GameWithLeaderboard.js';
import { LeaderboardProvider } from './components/LeaderboardProvider.js';

export function App() {
  return (
    <DemoPage>
      <LeaderboardProvider>
        <GameWithLeaderboard />
      </LeaderboardProvider>
    </DemoPage>
  );
}
