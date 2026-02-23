import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// Allowlist: each package can only depend on these @repo/ packages
const ALLOWED_DEPS: Record<string, string[]> = {
  '@repo/types': [],
  '@repo/config': [],
  '@repo/engine': ['@repo/types'],
  '@repo/ui': ['@repo/types'],
  '@repo/hooks': ['@repo/engine', '@repo/types'],
  '@repo/flappy-nature-game': ['@repo/ui', '@repo/hooks', '@repo/engine', '@repo/types'],
  '@repo/web': ['@repo/flappy-nature-game'],
};

// Packages that must NOT import React
const NO_REACT_PACKAGES = ['@repo/types', '@repo/engine', '@repo/config'];

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function readPackageJson(dir: string): PackageJson | null {
  const path = join(dir, 'package.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
}

function getWorkspacePackages(): Array<{ dir: string; pkg: PackageJson }> {
  const packages: Array<{ dir: string; pkg: PackageJson }> = [];
  const dirs = ['packages', 'apps'];

  for (const parent of dirs) {
    const parentDir = join(ROOT, parent);
    if (!existsSync(parentDir)) continue;
    for (const name of readdirSync(parentDir)) {
      const dir = join(parentDir, name);
      const pkg = readPackageJson(dir);
      if (pkg) packages.push({ dir, pkg });
    }
  }
  return packages;
}

function getRepoDeps(pkg: PackageJson): string[] {
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.peerDependencies,
  };
  return Object.keys(allDeps).filter((d) => d.startsWith('@repo/'));
}

const errors: string[] = [];

function validate() {
  const packages = getWorkspacePackages();

  for (const { pkg } of packages) {
    const name = pkg.name;
    const allowed = ALLOWED_DEPS[name];
    if (!allowed) continue; // skip packages not in allowlist

    const repoDeps = getRepoDeps(pkg);
    for (const dep of repoDeps) {
      if (!allowed.includes(dep)) {
        errors.push(
          `${name} depends on ${dep}, which is not in its allowlist: [${allowed.join(', ')}]`,
        );
      }
    }
  }

  // Check for circular dependencies (simple DFS)
  const graph = new Map<string, string[]>();
  for (const { pkg } of packages) {
    graph.set(pkg.name, getRepoDeps(pkg));
  }

  function hasCycle(node: string, visited: Set<string>, stack: Set<string>): boolean {
    visited.add(node);
    stack.add(node);
    for (const dep of graph.get(node) ?? []) {
      if (!visited.has(dep)) {
        if (hasCycle(dep, visited, stack)) return true;
      } else if (stack.has(dep)) {
        errors.push(`Circular dependency detected: ${node} -> ${dep}`);
        return true;
      }
    }
    stack.delete(node);
    return false;
  }

  const visited = new Set<string>();
  for (const name of graph.keys()) {
    if (!visited.has(name)) {
      hasCycle(name, visited, new Set());
    }
  }

  // Check that NO_REACT_PACKAGES don't have react in dependencies
  for (const { pkg } of packages) {
    if (NO_REACT_PACKAGES.includes(pkg.name)) {
      const allDeps = { ...pkg.dependencies, ...pkg.peerDependencies };
      if (allDeps.react || allDeps['react-dom']) {
        errors.push(`${pkg.name} must not depend on React`);
      }
    }
  }
}

validate();

if (errors.length > 0) {
  console.error('Architecture validation FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(2);
} else {
  console.log('Architecture validation passed.');
}
