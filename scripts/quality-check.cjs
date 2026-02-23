#!/usr/bin/env node
const { execSync } = require('node:child_process');

let failed = false;

function run(label, cmd) {
  try {
    console.log(`[quality-check] ${label}...`);
    execSync(cmd, { stdio: 'inherit', cwd: `${__dirname}/..` });
    console.log(`[quality-check] ${label} OK`);
  } catch {
    console.error(`[quality-check] ${label} FAILED`);
    failed = true;
  }
}

run('Lint', 'pnpm lint');
run('Typecheck', 'pnpm typecheck');

if (failed) {
  process.exit(2);
}
