## What
<!-- Brief description of changes -->

## Why
<!-- Motivation / issue reference -->

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor (no behavior change)
- [ ] Documentation
- [ ] CI / tooling
- [ ] Breaking change

## Affected Layers
- [ ] `@repo/types`
- [ ] `@repo/engine`
- [ ] `@repo/ui`
- [ ] `@repo/hooks`
- [ ] `@repo/flappy-nature-game`
- [ ] `@repo/web`
- [ ] `supabase/` (migrations, functions)
- [ ] Leaderboard service layer
- [ ] Scripts / CI
- [ ] Documentation

## Testing
- [ ] All tests pass (`pnpm test`)
- [ ] Coverage thresholds met (`pnpm test -- --coverage`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] All validators pass (`pnpm validate:all`)
- [ ] Storybook builds (`pnpm --filter=@repo/ui build-storybook`)
- [ ] New components have stories
- [ ] Leaderboard service tests pass
- [ ] Leaderboard UI components have stories

## Architecture Compliance
- [ ] `pnpm validate:all` passes
- [ ] No new `@repo/*` dependency violations
- [ ] No React imports in engine or types
- [ ] No hooks in UI components
- [ ] All source files under 200 lines
- [ ] No Supabase imports in packages/ (only in apps/web)
- [ ] Leaderboard types are backend-agnostic
- [ ] FlappyNatureGame works without leaderboard props

## Breaking Changes
<!-- If "Breaking change" checked above, describe migration steps. Otherwise write "None." -->

## Screenshots
<!-- If visual changes, add before/after -->
