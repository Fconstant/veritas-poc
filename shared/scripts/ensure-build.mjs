import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(packageRoot, 'dist', 'index.js');

const sources = [join(packageRoot, 'index.ts')];
const typesDir = join(packageRoot, 'types');

if (existsSync(typesDir)) {
  for (const name of readdirSync(typesDir)) {
    if (name.endsWith('.ts')) {
      sources.push(join(typesDir, name));
    }
  }
}

const builtAt = existsSync(entry) ? statSync(entry).mtimeMs : 0;
const isStale =
  builtAt === 0 || sources.some((file) => statSync(file).mtimeMs > builtAt);

if (isStale) {
  execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['run', 'build'], {
    cwd: packageRoot,
    stdio: 'inherit',
  });
}
