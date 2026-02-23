# @repo/engine -- Package Guide

This is the game engine. It owns all game logic: physics, collision detection, entity lifecycle, the game loop, scoring, and difficulty management.

## Hard Constraints

- This package MUST be pure TypeScript. It MUST NOT import from `react`, `react-dom`, or any JSX runtime.
- The only allowed `@repo/*` dependency is `@repo/types`.
- All exported classes SHOULD use an event emitter pattern for state change notifications. Consumers (hooks, game) subscribe to events rather than polling.
- Files MUST NOT exceed 200 lines. Split large systems into focused modules (e.g., `physics.ts`, `collision.ts`, `spawner.ts`).

## Discovery-First Protocol

Before writing or modifying any file in this package:

1. Read the existing source files in `src/` to understand current patterns.
2. Check `@repo/types` for the relevant type definitions -- do not duplicate or shadow them.
3. Identify which events the engine currently emits and follow the same pattern for new events.
4. Run `pnpm test --filter=@repo/engine` to confirm existing tests pass before making changes.

## Architecture

```
src/
  config.ts       Game constants, difficulty presets, applyDifficulty()
  math.ts         Pure math utilities (TAU, DEG_TO_RAD, maxOf)
  cache.ts        Pre-computed RGBA strings, font cache, color defaults
  index.ts        Public barrel export
```

The engine uses class-based design with a typed event emitter. The `EngineEvents` interface in `@repo/types` defines the event contract:

- `stateChange(state)` -- fired when game transitions between idle/play/dead/paused
- `scoreChange(score)` -- fired when player scores a point
- `bestScoreChange(scores)` -- fired when a new personal best is set
- `fpsUpdate(fps)` -- fired each frame with current FPS
- `difficultyChange(key)` -- fired when difficulty level changes

## Patterns to Follow

- Use `readonly` properties where mutation is not intended.
- Prefer `for` loops over `.map()` / `.filter()` in hot paths (game loop runs at 60fps).
- Pre-compute values (see `cache.ts`) rather than allocating strings or objects per frame.
- Accept configuration via constructor options typed as `EngineConfig` from `@repo/types`.
- Mutations to game state SHOULD happen in a single `tick(dt)` method to keep the update path predictable.

## Testing

Tests live alongside source files or in a `__tests__/` directory. Use Vitest.

```bash
pnpm test --filter=@repo/engine          # run once
pnpm test --filter=@repo/engine -- --watch  # watch mode
```

Tests for the engine MUST NOT depend on any DOM APIs (no `document`, no `window`). If canvas-related code needs testing, mock the canvas context.

## What Does NOT Belong Here

- React components, hooks, or JSX.
- DOM manipulation (querySelector, addEventListener on DOM elements).
- Rendering logic (drawing to canvas). The engine computes state; rendering is the UI layer's job.
- Direct localStorage access. Persistence SHOULD be handled by the hooks or game layer.
