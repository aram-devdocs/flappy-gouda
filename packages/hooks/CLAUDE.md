# @repo/hooks -- Package Guide

This package contains React hooks that bridge the pure TypeScript engine (`@repo/engine`) into React's reactivity model. Hooks here subscribe to engine events and surface them as React state.

## Hard Constraints

- MUST NOT contain business logic. No physics, no collision math, no scoring rules. That belongs in `@repo/engine`.
- MUST NOT render anything. No JSX, no components. That belongs in `@repo/ui`.
- MUST NOT import from `@repo/ui` or `@repo/flappy-nature-game`.
- Allowed `@repo/*` dependencies: `@repo/engine` and `@repo/types` only.
- React is a peer dependency. Hooks MUST work with React 18 and React 19.
- Files MUST NOT exceed 200 lines.

## Purpose

The hooks layer solves a specific problem: the engine communicates via an event emitter, but React components need reactive state. Each hook in this package subscribes to one or more engine events and returns values that trigger React re-renders when they change.

Pattern:

```tsx
export function useGameState(engine: GameEngine): GameState {
  const [state, setState] = useState<GameState>('idle');

  useEffect(() => {
    const unsubscribe = engine.on('stateChange', setState);
    return unsubscribe;
  }, [engine]);

  return state;
}
```

## Rules for Hook Design

1. Each hook SHOULD map to one or two related engine events. Do not create "god hooks" that subscribe to everything.
2. Hooks MUST clean up subscriptions in their `useEffect` return function.
3. Hooks MUST accept the engine instance as a parameter -- do not use module-level singletons or context internally.
4. Return values SHOULD be primitives or small objects to minimize unnecessary re-renders.
5. Hooks MUST NOT call engine mutation methods in their body. Mutation helpers (like `flap()` or `restart()`) SHOULD be returned as stable callback references via `useCallback`.

## Testing

Tests use Vitest + @testing-library/react's `renderHook`.

```bash
pnpm test --filter=@repo/hooks
```

Test strategy:
- Create a mock engine (or use the real engine with controlled inputs).
- Verify that hook state updates when the engine emits events.
- Verify cleanup on unmount.
- Verify that returned callbacks invoke the correct engine methods.

## File Organization

```
src/
  useGameState.ts
  useScore.ts
  useGameLoop.ts
  useDifficulty.ts
  index.ts            Barrel export
```

One hook per file. The file name MUST match the hook name.
