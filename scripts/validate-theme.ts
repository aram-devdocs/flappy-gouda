import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const CSS_VAR_FALLBACK = /var\(--[^,]+,\s*#[0-9a-fA-F]{3,8}\)/g;

const violations: Array<{ file: string; line: number; hex: string }> = [];

// Token file is the single source of truth -- skip it
const TOKEN_FILE = 'packages/types/src/tokens.ts';

const SKIP_DIRS = new Set(['__tests__', 'node_modules', 'dist']);

/** SVG icon components contain illustration-specific colors that are not theme tokens. */
const SVG_ICON_FILES = new Set(['CheeseIcon.tsx']);

function shouldSkipFile(name: string, rel: string): boolean {
  return (
    name.includes('.stories.') ||
    name.includes('.test.') ||
    rel === TOKEN_FILE ||
    SVG_ICON_FILES.has(name)
  );
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
    // Skip lines that are CSS var fallbacks -- var(--fg-*, #xxx)
    const withoutFallbacks = line.replace(CSS_VAR_FALLBACK, '');
    // Skip comment lines
    if (
      withoutFallbacks.trimStart().startsWith('//') ||
      withoutFallbacks.trimStart().startsWith('*')
    )
      continue;
    const matches = withoutFallbacks.match(HEX_PATTERN);
    if (matches) {
      for (const hex of matches) {
        violations.push({ file: rel, line: i + 1, hex });
      }
    }
  }
}

const scanDirs = [join(ROOT, 'packages', 'ui', 'src'), join(ROOT, 'packages', 'engine', 'src')];

for (const dir of scanDirs) {
  try {
    statSync(dir);
    scan(dir);
  } catch {
    // dir doesn't exist
  }
}

if (violations.length > 0) {
  console.error(
    `Theme validation FAILED: ${violations.length} hardcoded color(s) found outside tokens.`,
  );
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} -- ${v.hex}`);
  }
  console.error('\nMove colors to packages/types/src/tokens.ts and import from @repo/types.');
  process.exit(2);
} else {
  console.log('Theme validation passed. No hardcoded colors outside token file.');
}
