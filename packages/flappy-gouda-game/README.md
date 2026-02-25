# flappy-gouda-game

[![npm](https://img.shields.io/npm/v/flappy-gouda-game?style=flat-square&logo=npm)](https://www.npmjs.com/package/flappy-gouda-game)
[![GitHub](https://img.shields.io/badge/GitHub-flappy--gouda-181717?logo=github&style=flat-square)](https://github.com/aram-devdocs/flappy-gouda)
[![Storybook](https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&style=flat-square)](https://flappy-gouda.aramhammoudeh.com/storybook/)
[![CI](https://img.shields.io/github/actions/workflow/status/aram-devdocs/flappy-gouda/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/aram-devdocs/flappy-gouda/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/aram-devdocs/flappy-gouda/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/flappy-gouda-game?style=flat-square)](https://bundlephobia.com/package/flappy-gouda-game)

A drop-in canvas-based Flappy Bird game component for React 18+. 60fps rendering, 3 difficulty levels, customizable theme, optional leaderboard, and full TypeScript support.

**[Live Demo](https://flappy-gouda.aramhammoudeh.com)** · **[Storybook](https://flappy-gouda.aramhammoudeh.com/storybook/)**

## Installation

```bash
npm install flappy-gouda-game
# or
pnpm add flappy-gouda-game
# or
yarn add flappy-gouda-game
```

**Peer dependencies:** `react >= 18` and `react-dom >= 18`.

## Basic Usage

```tsx
import { FlappyGoudaGame } from 'flappy-gouda-game';

function App() {
  return <FlappyGoudaGame />;
}
```

That's it. The component renders a self-contained canvas game with title screen, score tracking, difficulty picker, and game-over screen.

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `colors` | `Partial<GameColors>` | Built-in theme | Custom color overrides for the game canvas |
| `bannerTexts` | `string[]` | Built-in texts | Custom texts displayed on animated flying planes |
| `fontFamily` | `string` | `"sans-serif"` | Font family for canvas-rendered text |
| `difficulty` | `DifficultyKey` | `"normal"` | Initial difficulty (`"easy"`, `"normal"`, `"hard"`) |
| `onStateChange` | `(state: GameState) => void` | — | Called on state transitions (`idle` → `play` → `dead` → `paused`) |
| `onScoreChange` | `(score: number) => void` | — | Called when the player scores |
| `onBestScoreChange` | `(scores: BestScores) => void` | — | Called when a new personal best is set |
| `onDifficultyChange` | `(difficulty: DifficultyKey) => void` | — | Called when difficulty changes |
| `className` | `string` | — | CSS class applied to the outer container |
| `showFps` | `boolean` | `false` | Show the FPS counter overlay |
| `showDebug` | `boolean` | `false` | Show the debug analytics panel |
| `onDebugMetrics` | `(metrics: DebugMetricsSnapshot) => void` | — | Debug metrics callback (~8 times/sec) |
| `debugControlsRef` | `{ current: DebugControls \| null }` | — | Ref for recording controls |
| `leaderboard` | `LeaderboardData` | — | Leaderboard data to display (see Leaderboard section) |
| `leaderboardCallbacks` | `LeaderboardCallbacks` | — | Callbacks for score submission and nickname flow |
| `nickname` | `string \| null` | — | Player's nickname. `null` triggers the nickname modal |
| `leaderboardExpanded` | `boolean` | `false` | Hides in-game mini overlay when external panel is open |

## Theming

Pass a partial `GameColors` object to override the default palette:

```tsx
<FlappyGoudaGame
  colors={{
    navy: '#1a1a2e',
    violet: '#e94560',
    cyan: '#0f3460',
    magenta: '#ff6b6b',
    light: '#f8f9fa',
    white: '#ffffff',
    midviolet: '#7c3aed',
    skyBottom: '#dbeafe',
  }}
/>
```

## Leaderboard

The game supports optional leaderboard integration. You provide the data and callbacks; the game handles the UI.

```tsx
import { FlappyGoudaGame, useNickname } from 'flappy-gouda-game';

function App() {
  const { nickname, setNickname } = useNickname();

  return (
    <FlappyGoudaGame
      nickname={nickname}
      leaderboard={{
        entries: [...],
        playerEntry: null,
        isLoading: false,
        connectionStatus: 'connected',
      }}
      leaderboardCallbacks={{
        onScoreSubmit: (score, difficulty) => { /* submit to your backend */ },
        onNicknameSet: (name) => setNickname(name),
        onNicknameCheck: async (name) => ({ available: true }),
      }}
    />
  );
}
```

## Design Tokens

Exported design token constants for consistent styling outside the game canvas:

```tsx
import {
  DESIGN_TOKENS,
  COLOR_TOKENS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
  RADIUS,
  SHADOW,
  Z_INDEX,
  cssVar,
} from 'flappy-gouda-game';

// Use tokens in your own components
const style = { fontFamily: FONT_FAMILY.heading, padding: SPACING.md };

// Generate CSS custom property names
const varName = cssVar('color-navy'); // '--sn-color-navy'
```

## Exported Types

```tsx
import type {
  FlappyGoudaGameProps,
  GameState,            // 'idle' | 'play' | 'dead' | 'paused'
  DifficultyKey,        // 'easy' | 'normal' | 'hard'
  BestScores,           // Record<DifficultyKey, number>
  GameColors,           // Theme color palette
  LeaderboardData,      // Leaderboard state
  LeaderboardCallbacks, // Leaderboard action handlers
  LeaderboardEntry,     // Single leaderboard row
  DebugMetricsSnapshot, // Debug panel metrics
  DebugControls,        // Recording control interface
  DebugRecording,       // Recorded frame data
} from 'flappy-gouda-game';
```

## Browser Support

Requires a browser with Canvas 2D support (all modern browsers). Works with React 18 and React 19.

## License

[MIT](https://github.com/aram-devdocs/flappy-gouda/blob/main/LICENSE)
