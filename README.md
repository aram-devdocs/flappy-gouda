# Flappy Nature

[![GitHub](https://img.shields.io/badge/GitHub-flappy--nature-181717?logo=github&style=flat-square)](https://github.com/aram-devdocs/flappy-nature)
[![Storybook](https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&style=flat-square)](https://flappy-nature.aramhammoudeh.com/storybook/)
[![npm](https://img.shields.io/npm/v/flappy-nature-game?style=flat-square&logo=npm)](https://www.npmjs.com/package/flappy-nature-game)
[![CI](https://img.shields.io/github/actions/workflow/status/aram-devdocs/flappy-nature/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/aram-devdocs/flappy-nature/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)

A canvas-based Flappy Bird game with a nature/cityscape theme, built as a React component.

**[Live Demo](https://flappy-nature.aramhammoudeh.com)** · **[Storybook](https://flappy-nature.aramhammoudeh.com/storybook/)** · **[npm](https://www.npmjs.com/package/flappy-nature-game)**

## Quick Start

```bash
npm install flappy-nature-game
```

```tsx
import { FlappyNatureGame } from 'flappy-nature-game';

function App() {
  return <FlappyNatureGame />;
}
```

## Features

- 60fps canvas rendering with parallax backgrounds
- 3 difficulty levels (easy, normal, hard) with per-difficulty high scores
- Optional leaderboard integration with real-time updates
- Customizable color theme via `colors` prop
- Custom banner texts on animated flying planes
- Debug panel with real-time engine metrics and frame recording
- Full TypeScript support with exported types
- Works with React 18 and React 19
- Mobile-friendly touch controls

## Architecture

```
packages/
  types/                Pure TS types and constants (zero deps)
  engine/               Game loop, physics, collision (pure TS, no React)
  ui/                   Stateless React presentational components
  hooks/                React hooks bridging engine → React state
  flappy-nature-game/   Orchestration layer (published to npm)

apps/
  web/                  Vite + React host app
```

Dependency flow: `types → engine/ui → hooks → flappy-nature-game → web`

- **engine** owns all game logic: physics, collision, scoring, entity lifecycle. Zero React dependencies.
- **ui** contains stateless components. Props in, callbacks out. No hooks, no state.
- **hooks** bridge engine events into React state via subscriptions.
- **flappy-nature-game** wires everything together into `<FlappyNatureGame />`.

## Development

**Prerequisites:** Node >= 20, pnpm 10+

```bash
pnpm install
pnpm dev          # Start all packages in dev/watch mode
```

| Command | Description |
|---|---|
| `pnpm dev` | Dev mode with hot reload for all packages |
| `pnpm build` | Production build |
| `pnpm lint` | Biome check |
| `pnpm typecheck` | TypeScript strict mode check |
| `pnpm test` | Run all tests |
| `pnpm storybook` | Launch Storybook on port 6006 |
| `pnpm validate-architecture` | Verify dependency DAG and constraints |

### Project Structure

```
.github/workflows/    CI, deploy, release, code review
packages/             Monorepo packages (see Architecture)
apps/web/             Host application
scripts/              Validators and tooling
supabase/             Database migrations and edge functions
```

## Contributing

This project uses [conventional commits](https://www.conventionalcommits.org/):

```
type(scope): description
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
Scopes: `engine`, `hooks`, `ui`, `game`, `web`, `config`, `ci`, `dx`

The pre-push hook runs `typecheck + test + build + validate-architecture`. See [CLAUDE.md](./CLAUDE.md) for the full contributor guide.

## License

[MIT](./LICENSE) -- code is free to use, modify, and distribute.

Second Nature brand assets (name, logo, visuals) are **not** covered by the MIT license. See [LICENSE](./LICENSE) for details.
