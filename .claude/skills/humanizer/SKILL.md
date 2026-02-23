# /humanizer

Remove AI writing patterns from documentation, comments, and text content.

## Trigger

User invokes `/humanizer` and provides text or a file path.

## What This Skill Does

Rewrites text to sound like a real developer wrote it. Targets and removes common AI writing artifacts:

### Patterns to Remove

- Filler phrases: "It's important to note that", "It's worth mentioning", "As you can see"
- Hedging: "basically", "essentially", "fundamentally", "generally speaking"
- Over-enthusiasm: "Great!", "Excellent!", "Perfect!", "Absolutely!"
- Redundant transitions: "Furthermore", "Moreover", "Additionally", "In conclusion"
- Passive voice where active is clearer: "The function is called by" -> "X calls the function"
- Unnecessary meta-commentary: "Let me explain", "I'll walk you through", "Here's how it works"
- Robotic list intros: "Here are the key benefits:", "The following are important:"
- Emoji abuse in technical writing
- Overly formal phrasing that no developer would actually write

### Patterns to Preserve

- Technical precision. Do not dumb down correct terminology.
- RFC 2119 keywords (MUST, SHOULD, etc.) when used intentionally.
- Code examples and inline code.
- Structured formatting (tables, headers, lists) when they serve clarity.

## Process

1. Read the input text or file.
2. Identify AI writing patterns.
3. Rewrite affected sentences to be direct, concise, and natural.
4. Preserve all technical content and meaning.
5. Output the rewritten text or apply the edit to the file.

## Style Target

Write like a senior developer writing internal docs: direct, slightly informal, assumes the reader is competent, wastes no words. Short sentences. Active voice. Concrete examples over abstract descriptions.

## Example

Before:
> It's important to note that the engine module essentially provides the core game logic. Furthermore, it's worth mentioning that this module fundamentally handles all physics calculations. Additionally, the engine is responsible for managing the game state.

After:
> The engine owns game logic: physics, collision detection, and state management.
