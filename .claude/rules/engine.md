Files in `packages/engine/` MUST NOT import from `react`, `react-dom`, or any `@repo/` package except `@repo/types`.

This rule exists because the engine is a pure TypeScript library with zero framework dependencies. It MUST be usable outside of React (e.g., in a Node.js test harness, a Canvas-only app, or a future non-React frontend).

Violations to check:
- `import ... from 'react'` or `import ... from 'react-dom'` in any `.ts` file under `packages/engine/`.
- `import ... from '@repo/hooks'`, `import ... from '@repo/ui'`, or `import ... from '@repo/flappy-nature-game'` in any file under `packages/engine/`.
- JSX syntax (`.tsx` file extension) in `packages/engine/`. Engine files MUST use `.ts` only.
- `react` or `react-dom` appearing in `packages/engine/package.json` dependencies or peerDependencies.

When you encounter a situation where engine code seems to need React, the correct solution is to move the React-dependent code into `@repo/hooks` or `@repo/flappy-nature-game`.
