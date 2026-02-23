import { FlappyNatureGame } from '@repo/flappy-nature-game';

export function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: '"Poppins", "Inter", system-ui, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#090949',
          marginBottom: '16px',
        }}
      >
        Flappy Nature
      </h1>
      <FlappyNatureGame showFps />
    </div>
  );
}
