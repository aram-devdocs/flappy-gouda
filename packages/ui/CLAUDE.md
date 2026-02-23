# @repo/ui -- Package Guide

This package contains all React presentational components. Every component here is stateless: it receives data through props and communicates user actions through callback props.

## Hard Constraints

- Components MUST be stateless. No `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, or any React hook.
- The only allowed `@repo/*` dependency is `@repo/types`.
- MUST NOT import from `@repo/hooks`, `@repo/engine`, or `@repo/flappy-nature-game`.
- Every component MUST work in Storybook with just props -- no providers, no context, no side effects.
- Files MUST NOT exceed 200 lines.

## Why Stateless?

Stateless components are trivially testable, trivially composable, and render identically given identical props. They can be developed and reviewed in Storybook in complete isolation from the game engine. The hooks layer (`@repo/hooks`) is responsible for connecting engine state to these components.

## Component Contract

Every component SHOULD follow this shape:

```tsx
interface MyComponentProps {
  // Data flows IN via read-only props
  score: number;
  isActive: boolean;

  // Actions flow OUT via callbacks
  onAction: () => void;
}

export function MyComponent({ score, isActive, onAction }: MyComponentProps) {
  return (/* JSX */);
}
```

Rules:
- Props interfaces MUST be exported and named `{ComponentName}Props`.
- Callback props MUST start with `on` (e.g., `onClick`, `onFlap`, `onRestart`).
- Components MUST use named exports, not default exports.
- Type imports from `@repo/types` MUST use `import type` syntax.

## Storybook

This package hosts the project's Storybook instance.

```bash
pnpm storybook                  # dev server on port 6006
pnpm --filter=@repo/ui build-storybook  # static build
```

Every component SHOULD have a corresponding `.stories.tsx` file. Stories SHOULD cover:
- Default/happy path state
- Edge cases (zero score, empty strings, maximum values)
- Interactive states (hover, active) where applicable

## Testing

Components are tested with Vitest + @testing-library/react.

```bash
pnpm test --filter=@repo/ui
```

Tests SHOULD verify:
- Correct rendering given specific props
- Callback invocation on user interaction
- Accessibility attributes (ARIA roles, labels)

Tests MUST NOT verify business logic (that belongs in engine tests).

## File Organization

```
src/
  components/
    Bird.tsx
    Bird.stories.tsx
    Pipe.tsx
    Pipe.stories.tsx
    ...
  index.ts          Barrel export of all components
```

Keep one component per file. If a component needs sub-components, place them in a directory:

```
src/components/
  ScoreBoard/
    ScoreBoard.tsx
    ScoreBoardRow.tsx
    ScoreBoard.stories.tsx
    index.ts
```
