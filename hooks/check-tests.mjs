// hype-me Stop hook: a safety net for "leave a test with anything you make".
// Only in projects with a hype-me profile. When the turn ends with changed code files but
// no changed test/check file, it sends Claude back once to add and run a check (or say why
// none is needed). It reminds once per set of changed files, never loops, never fails a session.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CODE = /\.(m?[jt]sx?|cjs|py|gd|cs|lua|rs|go|java|kt|swift|vue|svelte|html|css)$/i;
const TEST = /(^|\/)(tests?|__tests__|spec|e2e|checks?)\/|\.(test|spec)\.[a-z]+$|_test\.[a-z]+$|^\.hype-me\/(checks|bugs\/rule-checks)\//i;
const SKIP = /^(\.hype-me\/(reports|cache|data|ux|bugs\/run-)|docs\/|node_modules\/|dist\/|build\/|release\/)/i;

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return;
  }
  if (input.stop_hook_active) return; // already sent back once this turn
  const cwd = input.cwd || process.cwd();
  if (!existsSync(join(cwd, '.hype-me', 'profile.json'))) return;

  let status;
  try {
    status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd, encoding: 'utf8', timeout: 5000 });
  } catch {
    return; // not a git repo or git missing
  }
  const files = status
    .split('\n')
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, '').split(' -> ').pop())
    .filter(Boolean)
    .map((f) => f.replace(/\\/g, '/'));
  const code = files.filter((f) => CODE.test(f) && !TEST.test(f) && !SKIP.test(f));
  const tests = files.filter((f) => TEST.test(f));
  if (!code.length || tests.length) return;

  // remind once per set of changed code files
  const key = createHash('sha1').update(`${cwd}|${code.sort().join('|')}`).digest('hex').slice(0, 16);
  const mark = join(tmpdir(), `hype-me-tests-${input.session_id || 'x'}-${key}`);
  if (existsSync(mark)) return;
  writeFileSync(mark, '');

  const list = code.slice(0, 8).join(', ') + (code.length > 8 ? ` (+${code.length - 8} more)` : '');
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason:
        `hype-me: code changed without a test or check (${list}). ` +
        'Before finishing, add a check that fits the change and run it once — a failing-then-passing test for a fix, ' +
        'an event check for tracking code, a snap.mjs smoke check for a prototype (see references/rules.md §4). ' +
        'If no test makes sense here, say why in one line instead.',
    }),
  );
}

try {
  main();
} catch {
  // never block a session because of this hook
}
