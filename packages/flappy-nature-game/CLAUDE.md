# @repo/flappy-nature-game -- Package Guide

This is the orchestration layer. It composes `@repo/engine`, `@repo/hooks`, and `@repo/ui` into the public-facing `<FlappyNatureGame />` component that consumers (like `@repo/web`) import.

## Hard Constraints

- This package MUST be the only place where engine, hooks, and ui are wired together.
- Allowed `@repo/*` dependencies: `@repo/engine`, `@repo/hooks`, `@repo/ui`, `@repo/types`.
- `@repo/web` MUST only import from this package, never from engine/hooks/ui directly.
- React is a peer dependency. MUST work with React 18 and React 19.
- Files MUST NOT exceed 200 lines.

## Responsibilities

1. **Engine instantiation.** Create the engine instance with the consumer's configuration.
2. **Hook wiring.** Use hooks from `@repo/hooks` to subscribe to engine state.
3. **Component composition.** Pass hook-derived state into UI components from `@repo/ui` as props.
4. **Lifecycle management.** Start/stop the engine when the component mounts/unmounts.
5. **Public API surface.** The `FlappyNatureGameProps` interface (from `@repo/types`) defines what consumers can configure.

## Pattern

```tsx
import { GameEngine } from '@repo/engine';
import { useGameState, useScore } from '@repo/hooks';
import { GameCanvas, ScoreDisplay } from '@repo/ui';
import type { FlappyNatureGameProps } from '@repo/types';

export function FlappyNatureGame(props: FlappyNatureGameProps) {
  // 1. Instantiate engine
  const engine = useEngine(props);

  // 2. Subscribe to engine state via hooks
  const gameState = useGameState(engine);
  const score = useScore(engine);

  // 3. Pass state as props to stateless UI components
  return (
    <GameCanvas>
      <ScoreDisplay score={score} />
    </GameCanvas>
  );
}
```

## What Does NOT Belong Here

- Game logic (physics, collision) -- that is `@repo/engine`.
- Generic hooks that could be reused -- those belong in `@repo/hooks`.
- Reusable presentational components -- those belong in `@repo/ui`.
- This package SHOULD contain minimal code. If a file is getting large, the logic probably belongs in one of the lower packages.

## Testing

Integration tests verify that the full composition works: engine produces state, hooks relay it, UI renders correctly.

```bash
pnpm test --filter=@repo/flappy-nature-game
```

Test strategy:
- Mount `<FlappyNatureGame />` with test props.
- Simulate user interactions (click/tap to flap).
- Assert that score updates, state transitions, and visual output match expectations.
- Mock the canvas context for rendering assertions.

## File Organization

```
src/
  FlappyNatureGame.tsx     Main composed component
  useEngine.ts             Engine instantiation and lifecycle hook (local to this package)
  index.ts                 Barrel export
```
