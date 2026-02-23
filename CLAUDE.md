# Flappy Nature -- Monorepo Guide

This document is the primary reference for any AI agent or human contributor working in this codebase. All statements using RFC 2119 keywords (MUST, MUST NOT, SHOULD, SHALL, etc.) are binding.

## Architecture

Flappy Nature is a Turborepo monorepo that implements a canvas-based Flappy Bird game with a nature/cityscape theme. The codebase enforces strict separation between pure game logic, React bindings, and presentational components.

### Package Map

```
packages/
  types/               Pure TypeScript types and constants. Zero runtime deps.
  config/              Shared build & tool configuration (tsconfig, tsup, vitest).
  engine/              Game loop, physics, collision, entity management. Pure TS, no React.
  ui/                  Stateless React presentational components. Props in, callbacks out.
  hooks/               React hooks that bridge engine state into React. No rendering, no business logic.
  flappy-nature-game/  Orchestration layer. Composes engine + hooks + ui into the public game component.

apps/
  web/                 Vite + React host app. Imports only @repo/flappy-nature-game.
```

### Dependency Flow

The dependency graph is a strict DAG. Violations MUST be caught by `pnpm validate-architecture`.

```
types           --> (nothing)
config          --> (nothing)
engine          --> types
ui              --> types
hooks           --> engine, types
flappy-nature-game --> ui, hooks, engine, types
web             --> flappy-nature-game
```

Rules:
- `@repo/types` and `@repo/config` MUST NOT depend on any `@repo/*` package.
- `@repo/engine` MUST NOT import from `react`, `react-dom`, or any `@repo/` package except `@repo/types`.
- `@repo/ui` MUST NOT import from `@repo/hooks` or `@repo/engine`.
- `@repo/hooks` MUST NOT import from `@repo/ui` or `@repo/flappy-nature-game`.
- `@repo/web` MUST only depend on `@repo/flappy-nature-game`.
- Circular dependencies MUST NOT exist. The architecture validator runs a DFS cycle check.

### Technology Stack

- **Runtime:** Node >= 20 (see `.nvmrc`)
- **Package manager:** pnpm 10+ with workspace protocol
- **Build orchestration:** Turborepo
- **Bundler (packages):** tsup
- **Bundler (web app):** Vite
- **Linter/formatter:** Biome (not ESLint/Prettier)
- **Test runner:** Vitest with jsdom
- **Type checking:** TypeScript 5.9 strict mode
- **Git hooks:** Husky + lint-staged (pre-commit: lint, pre-push: typecheck + test + build + validate-architecture)

## Commands

Run all commands from the repository root.

| Command | What it does |
|---|---|
| `pnpm dev` | Start all packages in dev/watch mode via Turborepo |
| `pnpm build` | Production build all packages |
| `pnpm lint` | Run Biome check across the entire repo |
| `pnpm lint:fix` | Run Biome check with auto-fix |
| `pnpm format` | Run Biome format with auto-fix |
| `pnpm typecheck` | TypeScript `--noEmit` across all packages |
| `pnpm test` | Run Vitest in all packages that have tests |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm storybook` | Launch Storybook for `@repo/ui` |
| `pnpm validate-architecture` | Verify the dependency DAG, no-React constraints, and cycle detection |

Before pushing, the pre-push hook runs: `pnpm typecheck && pnpm test && pnpm build && pnpm validate-architecture`. You SHOULD run this locally before opening a PR.

## Commit Convention

Format: `type(scope): description`

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

**Scopes:** `engine`, `hooks`, `ui`, `game`, `web`, `config`, `ci`, `dx`

Examples:
```
feat(engine): add collision detection for ground plane
fix(hooks): prevent stale closure in useGameLoop
refactor(ui): extract PipeColumn into standalone component
test(engine): cover edge cases in physics step
chore(ci): add architecture validation to CI pipeline
docs(dx): update CLAUDE.md with new dependency rules
```

Rules:
- The description MUST be lowercase and imperative mood ("add", not "added" or "adds").
- The scope MUST match the primary package affected.
- Multi-package changes SHOULD use the most specific scope or `dx` for cross-cutting concerns.
- Breaking changes MUST include `BREAKING CHANGE:` in the commit body.

## Anti-Patterns

These patterns MUST NOT appear in the codebase:

1. **React in engine.** Files under `packages/engine/` MUST NOT import `react`, `react-dom`, or any JSX. The engine is pure TypeScript with zero framework dependencies.

2. **Hooks in UI.** Files under `packages/ui/` MUST NOT call `useState`, `useEffect`, or any React hook. UI components are stateless: data flows in via props, actions flow out via callbacks.

3. **Business logic in UI.** Scoring, physics, collision detection, entity spawning -- these belong in `@repo/engine`. UI components MUST only handle rendering.

4. **Files over 200 lines.** Any source file exceeding 200 lines SHOULD be split. This is a soft limit enforced during code review.

5. **`any` types.** Biome enforces `noExplicitAny: error`. Use `unknown` with type guards instead.

6. **Direct cross-layer imports.** A UI component MUST NOT reach into `@repo/engine` directly. It goes through `@repo/hooks` via `@repo/flappy-nature-game`.

7. **Mutable default exports.** Prefer named exports. Default exports SHOULD be avoided except for React components that are the sole export of their file.

## Available Skills

Use these slash commands when working in this repo:

- `/humanizer` -- Remove robotic AI writing patterns from documentation and comments. Rewrites text to sound like a real developer wrote it.
- `/find-skills` -- Discover all available skills, agents, and rules configured for this project.
- `/sdd` -- Subagent-Driven Development. Orchestrates multi-agent workflows for complex tasks using the TDD pipeline.

## Available Agents

These agents can be dispatched for specialized tasks:

| Agent | Model | Mode | Purpose |
|---|---|---|---|
| `implementer` | Sonnet | Read/Write | Discovery-first implementation. Reads existing code, then writes. |
| `code-quality-reviewer` | Sonnet | READ-ONLY | Audits for dependency violations, `any` types, missing tests, oversized files. |
| `test-first-implementer` | Sonnet | Read/Write | Writes failing tests ONLY (RED phase). Never writes implementation. |
| `tdd-verifier` | Haiku | READ-ONLY | Binary APPROVED/REJECTED verdict on TDD compliance. |

## TDD Pipeline

All feature work SHOULD follow this pipeline:

```
RED --> GREEN --> REFACTOR --> VERIFY
```

1. **RED:** `test-first-implementer` writes a failing test that describes the desired behavior. The test MUST fail. No implementation code is written.

2. **GREEN:** `implementer` writes the minimum code to make the failing test pass. No additional features, no premature optimization.

3. **REFACTOR:** `implementer` cleans up the passing code -- extract helpers, rename variables, reduce duplication -- without changing behavior. Tests MUST still pass.

4. **VERIFY:** `tdd-verifier` checks that all tests pass, no `any` types leaked in, file sizes are within limits, and dependency rules hold. Outputs APPROVED or REJECTED.

If REJECTED, the cycle restarts from the appropriate phase.
