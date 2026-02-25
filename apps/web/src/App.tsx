import { DemoPage } from './components/DemoPage';
import { GameWithLeaderboard } from './components/GameWithLeaderboard';
import { LeaderboardProvider } from './components/LeaderboardProvider';

export function App() {
  return (
    <DemoPage>
      <LeaderboardProvider>
        <GameWithLeaderboard />
      </LeaderboardProvider>
    </DemoPage>
  );
}
