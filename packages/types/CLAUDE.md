# @repo/types -- Package Guide

Pure TypeScript types, interfaces, constants, and design tokens. Zero runtime dependencies.

## Hard Constraints

- MUST NOT depend on any `@repo/*` package.
- MUST NOT import `react`, `react-dom`, or any framework.
- MUST NOT contain business logic, side effects, or runtime behavior beyond constant definitions.
- Files MUST NOT exceed 200 lines.

## Contents

| File | Purpose |
|------|---------|
| `game.ts` | Core game types: `GameState`, `DifficultyKey`, `GameConfig`, `GameColors` |
| `entities.ts` | Entity types: `Bird`, `Pipe`, `Cloud`, `Building`, `Tree`, etc. |
| `engine.ts` | Engine types: `EngineEvents`, `EngineConfig`, `BestScores` |
| `props.ts` | Public API types: `FlappyNatureGameProps`, `BannerTexts` |
| `tokens.ts` | Design tokens: `DESIGN_TOKENS` (centralized colors, CSS var prefix) |
| `index.ts` | Barrel re-export |

## Design Tokens

`tokens.ts` is the single source of truth for all visual constants. The theme validator (`scripts/validate-theme.ts`) enforces that no hardcoded color literals exist outside this file.

## Testing

This package has no runtime behavior to test. Type correctness is verified by `pnpm typecheck`.
