Files in `packages/ui/` MUST be stateless. MUST NOT import from `@repo/hooks` or `@repo/engine`.

Stateless means:
- No `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`, or any custom hook calls.
- No internal component state whatsoever. All data arrives via props. All user actions leave via callback props.
- Components MUST produce identical output for identical props (referential transparency).

Violations to check:
- Any React hook call (`use*`) inside a component in `packages/ui/src/`.
- `import ... from '@repo/hooks'` in any file under `packages/ui/`.
- `import ... from '@repo/engine'` in any file under `packages/ui/`.
- `import ... from '@repo/flappy-nature-game'` in any file under `packages/ui/`.
- Side effects in the component body (subscriptions, timers, direct DOM manipulation).

The only allowed `@repo/*` import is `@repo/types` (for shared type definitions).

When you encounter a situation where a UI component seems to need state or engine access, the correct solution is:
1. The state SHOULD live in a hook in `@repo/hooks`.
2. The wiring SHOULD happen in `@repo/flappy-nature-game`.
3. The UI component receives the already-computed value as a prop.
