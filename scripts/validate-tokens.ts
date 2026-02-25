import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

interface Violation {
  file: string;
  line: number;
  rule: string;
  snippet: string;
}

const violations: Violation[] = [];

const SKIP_DIRS = new Set(['__tests__', 'node_modules', 'dist']);

/** SVG icon components contain illustration-specific colors that are not design tokens. */
const SVG_ICON_FILES = new Set(['CheeseIcon.tsx']);

function shouldSkipFile(name: string, rel: string): boolean {
  if (name.includes('.stories.') || name.includes('.test.')) return true;
  if (rel.startsWith('packages/types/src/tokens')) return true;
  if (SVG_ICON_FILES.has(name)) return true;
  return false;
}

// --- Patterns ---

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const CSS_VAR_FALLBACK = /var\(--[^,]+,\s*#[0-9a-fA-F]{3,8}\)/g;

const RULE_PATTERNS: Array<{ rule: string; pattern: RegExp }> = [
  { rule: 'fontSize', pattern: /fontSize:\s*'(\d+)px'/g },
  { rule: 'fontWeight', pattern: /fontWeight:\s*(\d{3})\b/g },
  { rule: 'fontFamily', pattern: /fontFamily:\s*['"]/g },
  { rule: 'borderRadius', pattern: /borderRadius:\s*'(\d+)px'/g },
  { rule: 'boxShadow', pattern: /boxShadow:\s*'[^']*rgba\(/g },
  { rule: 'textShadow', pattern: /textShadow:\s*'[^']*rgba\(/g },
  { rule: 'zIndex', pattern: /zIndex:\s*(\d+)\b/g },
  { rule: 'opacity', pattern: /opacity:\s*(0\.\d+)\b/g },
  {
    rule: 'spacing',
    pattern:
      /(?:padding|margin|marginTop|marginBottom|marginLeft|marginRight|gap|top|left|right|bottom):\s*'(\d+)px/g,
  },
  { rule: 'spacing', pattern: /(?:padding|margin):\s*'(\d+px\s+\d+px)/g },
];

function checkLineForPatterns(line: string, file: string, lineNum: number): void {
  for (const { rule, pattern } of RULE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const m of line.matchAll(pattern)) {
      violations.push({ file, line: lineNum, rule, snippet: m[0] });
    }
  }
}

function checkLineForColors(line: string, file: string, lineNum: number): void {
  const withoutFallbacks = line.replace(CSS_VAR_FALLBACK, '');
  const hexMatches = withoutFallbacks.match(HEX_PATTERN);
  if (hexMatches) {
    for (const hex of hexMatches) {
      violations.push({ file, line: lineNum, rule: 'color', snippet: hex });
    }
  }
}

function scan(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) scan(full);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      const rel = full.replace(`${ROOT}/`, '');
      if (!shouldSkipFile(entry.name, rel)) checkFile(full, rel);
    }
  }
}

function checkFile(filePath: string, rel: string): void {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trimStart();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

    checkLineForColors(line, rel, i + 1);
    checkLineForPatterns(line, rel, i + 1);
  }
}

const scanDirs = [join(ROOT, 'packages', 'ui', 'src'), join(ROOT, 'apps', 'web', 'src')];

for (const dir of scanDirs) {
  try {
    statSync(dir);
    scan(dir);
  } catch {
    // dir doesn't exist
  }
}

if (violations.length > 0) {
  console.error(`Token validation FAILED: ${violations.length} violation(s) found.\n`);

  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    const list = grouped.get(v.rule) ?? [];
    list.push(v);
    grouped.set(v.rule, list);
  }

  for (const [rule, items] of grouped) {
    console.error(`  [${rule}] ${items.length} violation(s):`);
    for (const v of items) {
      console.error(`    ${v.file}:${v.line} -- ${v.snippet}`);
    }
  }

  console.error('\nUse design tokens from @repo/types instead of hardcoded values.');
  process.exit(2);
} else {
  console.log('Token validation passed. No hardcoded design values outside token files.');
}
