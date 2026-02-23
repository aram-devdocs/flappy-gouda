# /sdd

Subagent-Driven Development. Orchestrates multi-agent workflows for implementing features using the TDD pipeline.

## Trigger

User invokes `/sdd` with a feature description or task specification.

## What This Skill Does

Coordinates the four agents (`test-first-implementer`, `implementer`, `code-quality-reviewer`, `tdd-verifier`) through the RED-GREEN-REFACTOR-VERIFY cycle to deliver a complete, tested feature.

## Process

### Phase 1: Planning

1. Parse the user's feature description.
2. Identify which packages will be affected based on the dependency map:
   - Pure logic changes -> `@repo/engine`
   - New type definitions -> `@repo/types`
   - New UI elements -> `@repo/ui`
   - New state bridges -> `@repo/hooks`
   - Composition changes -> `@repo/flappy-nature-game`
3. Determine the order of implementation (types first, then engine, then hooks, then ui, then game).
4. Present the plan to the user for approval before proceeding.

### Phase 2: RED (test-first-implementer)

1. Dispatch the `test-first-implementer` agent with the feature spec and target packages.
2. The agent writes failing tests that describe the desired behavior.
3. Confirm all new tests fail. If any pass prematurely, the agent rewrites them.
4. Report: which test files were created, how many test cases, all failing.

### Phase 3: GREEN (implementer)

1. Dispatch the `implementer` agent with the failing test files and feature spec.
2. The agent follows discovery-first protocol, then writes minimum code to pass all tests.
3. Run `pnpm test` to confirm all tests pass (both new and existing).
4. If tests still fail, iterate with the implementer until green.

### Phase 4: REFACTOR (implementer)

1. Dispatch the `implementer` agent in refactor mode.
2. The agent reviews the passing code for:
   - Duplication that can be extracted
   - Names that could be clearer
   - Files that exceed 200 lines and need splitting
   - Patterns that deviate from existing codebase conventions
3. Run `pnpm test` after each refactor step to confirm no regressions.

### Phase 5: VERIFY (tdd-verifier)

1. Dispatch the `tdd-verifier` agent.
2. The agent runs the full verification checklist: tests, typecheck, lint, architecture, no-any, file sizes.
3. If APPROVED: report success and suggest a commit message.
4. If REJECTED: identify which phase needs a fix and loop back.

### Phase 6: Review (code-quality-reviewer)

1. Dispatch the `code-quality-reviewer` agent on all changed files.
2. If BLOCKS are found, loop back to the implementer.
3. If only WARNINGS or NOTES, report them to the user and suggest the commit.

## Output at Completion

```
=== SDD COMPLETE ===

Feature: {description}
Packages modified: {list}
Tests added: {count}
Files created: {count}
Files modified: {count}

Verification: APPROVED
Review: APPROVED (N warnings, N notes)

Suggested commit:
  feat(scope): {description}
```

## Failure Handling

- If any phase fails 3 times consecutively, stop and report the issue to the user with full context.
- Never skip the VERIFY phase.
- Never merge code that the tdd-verifier REJECTED.
