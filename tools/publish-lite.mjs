// Puts the directory edition on its own branch (default: `directory`), with the
// plugin at the branch root — that is what the Claude plugin directory reads.
//
//   node tools/publish-lite.mjs [--branch directory] [--push]
//
// Builds from the current main checkout, replaces everything on the branch with
// the build, and commits "directory edition from <main sha>". Pushes only with --push.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from './build-lite.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const BRANCH = argv.includes('--branch') ? argv[argv.indexOf('--branch') + 1] : 'directory';
const git = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

if (git(['status', '--porcelain'])) {
  console.log('commit or stash your changes first, so the build matches a commit');
  process.exit(1);
}
const sha = git(['rev-parse', '--short', 'HEAD']);

const out = mkdtempSync(join(tmpdir(), 'hype-me-lite-'));
const problems = build(out);
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}

const wt = mkdtempSync(join(tmpdir(), 'hype-me-branch-'));
rmSync(wt, { recursive: true, force: true });
const exists = git(['branch', '--list', BRANCH]) !== '' || git(['ls-remote', '--heads', 'origin', BRANCH]) !== '';
try {
  if (exists) {
    if (!git(['branch', '--list', BRANCH])) git(['fetch', 'origin', `${BRANCH}:${BRANCH}`]);
    git(['worktree', 'add', wt, BRANCH]);
  } else {
    git(['worktree', 'add', '--detach', wt]);
    git(['checkout', '--orphan', BRANCH], wt);
  }
  for (const n of readdirSync(wt)) if (n !== '.git') rmSync(join(wt, n), { recursive: true, force: true });
  cpSync(out, wt, { recursive: true });
  git(['-c', 'core.autocrlf=false', 'add', '-A'], wt); // keep the build's LF endings
  if (!git(['status', '--porcelain'], wt)) console.log(`${BRANCH} is already up to date with ${sha}`);
  else {
    git(['commit', '-q', '-m', `directory edition from ${sha}`], wt);
    console.log(`committed ${BRANCH}: directory edition from ${sha}`);
  }
  if (argv.includes('--push')) {
    git(['push', '-q', 'origin', BRANCH], wt);
    console.log(`pushed ${BRANCH}`);
  }
} finally {
  if (existsSync(wt)) git(['worktree', 'remove', '--force', wt]);
  rmSync(out, { recursive: true, force: true });
}
