import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const ALLOWED_DEPS: Record<string, string[]> = {
  '@repo/types': [],
  '@repo/config': [],
  '@repo/engine': ['@repo/types'],
  '@repo/ui': ['@repo/types'],
  '@repo/hooks': ['@repo/engine', '@repo/types'],
  '@repo/flappy-nature-game': ['@repo/ui', '@repo/hooks', '@repo/engine', '@repo/types'],
  '@repo/web': ['@repo/flappy-nature-game'],
};

const NO_REACT_PACKAGES = ['@repo/types', '@repo/engine', '@repo/config'];

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface WorkspacePackage {
  dir: string;
  pkg: PackageJson;
}

function readPackageJson(dir: string): PackageJson | null {
  const path = join(dir, 'package.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
}

function getWorkspacePackages(): WorkspacePackage[] {
  const packages: WorkspacePackage[] = [];
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

function validateDependencyAllowlist(packages: WorkspacePackage[]): void {
  for (const { pkg } of packages) {
    const name = pkg.name;
    const allowed = ALLOWED_DEPS[name];
    if (!allowed) continue;

    const repoDeps = getRepoDeps(pkg);
    for (const dep of repoDeps) {
      if (!allowed.includes(dep)) {
        errors.push(
          `${name} depends on ${dep}, which is not in its allowlist: [${allowed.join(', ')}]`,
        );
      }
    }
  }
}

function hasCycle(
  node: string,
  visited: Set<string>,
  stack: Set<string>,
  graph: Map<string, string[]>,
): boolean {
  visited.add(node);
  stack.add(node);
  for (const dep of graph.get(node) ?? []) {
    if (!visited.has(dep)) {
      if (hasCycle(dep, visited, stack, graph)) return true;
    } else if (stack.has(dep)) {
      errors.push(`Circular dependency detected: ${node} -> ${dep}`);
      return true;
    }
  }
  stack.delete(node);
  return false;
}

function validateNoCycles(packages: WorkspacePackage[]): void {
  const graph = new Map<string, string[]>();
  for (const { pkg } of packages) {
    graph.set(pkg.name, getRepoDeps(pkg));
  }

  const visited = new Set<string>();
  for (const name of graph.keys()) {
    if (!visited.has(name)) {
      hasCycle(name, visited, new Set(), graph);
    }
  }
}

function validateNoReact(packages: WorkspacePackage[]): void {
  for (const { pkg } of packages) {
    if (!NO_REACT_PACKAGES.includes(pkg.name)) continue;
    const allDeps = { ...pkg.dependencies, ...pkg.peerDependencies };
    if (allDeps.react || allDeps['react-dom']) {
      errors.push(`${pkg.name} must not depend on React`);
    }
  }
}

function validateSourceReactImports(packages: WorkspacePackage[]): void {
  for (const { dir, pkg } of packages) {
    if (!NO_REACT_PACKAGES.includes(pkg.name)) continue;
    const srcDir = join(dir, 'src');
    if (!existsSync(srcDir)) continue;
    scanForReactImports(srcDir, pkg.name);
  }
}

function scanForReactImports(dir: string, pkgName: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== '__tests__') {
      scanForReactImports(fullPath, pkgName);
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (/import.*from\s+['"]react/.test(lines[i] ?? '')) {
          const rel = fullPath.replace(`${ROOT}/`, '');
          errors.push(`${pkgName}: React import found at ${rel}:${i + 1}`);
        }
      }
    }
  }
}

function validateNoSupabaseInPackages(packages: WorkspacePackage[]): void {
  for (const { dir, pkg } of packages) {
    if (!pkg.name.startsWith('@repo/') || pkg.name === '@repo/web') continue;
    const srcDir = join(dir, 'src');
    if (!existsSync(srcDir)) continue;
    scanForSupabaseImports(srcDir, pkg.name);
  }
}

function scanForSupabaseImports(dir: string, pkgName: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== '__tests__') {
      scanForSupabaseImports(fullPath, pkgName);
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (/import.*from\s+['"]@supabase/.test(lines[i] ?? '')) {
          const rel = fullPath.replace(`${ROOT}/`, '');
          errors.push(
            `${pkgName}: Supabase import found at ${rel}:${i + 1} (only allowed in apps/web)`,
          );
        }
      }
    }
  }
}

function validate(): void {
  const packages = getWorkspacePackages();
  validateDependencyAllowlist(packages);
  validateNoCycles(packages);
  validateNoReact(packages);
  validateSourceReactImports(packages);
  validateNoSupabaseInPackages(packages);
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
