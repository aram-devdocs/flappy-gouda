# /find-skills

Discover all available skills, agents, and rules configured for this project.

## Trigger

User invokes `/find-skills` optionally with a filter keyword.

## What This Skill Does

Scans the `.claude/` directory tree and reports what is available.

## Process

1. List all files in `.claude/skills/*/SKILL.md` -- these are skills (slash commands).
2. List all files in `.claude/agents/*.md` -- these are dispatchable agents.
3. List all files in `.claude/rules/*.md` -- these are enforcement rules.
4. Read the root `CLAUDE.md` for the skills/agents/TDD summary tables.
5. Read each `packages/*/CLAUDE.md` for package-specific guidance.

## Output Format

```
=== SKILLS (slash commands) ===

/humanizer     Remove AI writing patterns from docs
/find-skills   Discover available skills, agents, rules (this command)
/sdd           Subagent-Driven Development orchestration

=== AGENTS ===

implementer              Sonnet  Read/Write  Discovery-first implementation
code-quality-reviewer    Sonnet  READ-ONLY   Dependency + quality auditing
test-first-implementer   Sonnet  Read/Write  Writes failing tests (RED phase)
tdd-verifier             Haiku   READ-ONLY   Binary APPROVED/REJECTED verdict

=== RULES ===

engine.md   Engine must not import React or cross-layer packages
ui.md       UI must be stateless, no hooks/engine imports

=== PACKAGE GUIDES ===

CLAUDE.md                           Root monorepo guide
packages/engine/CLAUDE.md           Engine package constraints
packages/ui/CLAUDE.md               UI package constraints
packages/hooks/CLAUDE.md            Hooks package constraints
packages/flappy-nature-game/CLAUDE.md  Game orchestration guide
```

If the user provides a filter keyword (e.g., `/find-skills tdd`), only show items whose name or description matches the keyword.
