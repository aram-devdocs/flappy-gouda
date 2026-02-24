import { FlappyNatureGame, GamePage } from '@repo/flappy-nature-game';

export function App() {
  return (
    <GamePage title="Flappy Nature">
      <FlappyNatureGame showFps />
    </GamePage>
  );
}
