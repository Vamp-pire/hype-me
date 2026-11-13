// Builds the directory edition of hype-me: Markdown, JSON and the icon only.
// The Claude plugin directory accepts scripts only from Verified organizations,
// so this edition replaces every script step with text Claude follows itself.
//
//   node tools/build-lite.mjs [--out directory/hype-me] [--check]
//   --check  build into a temp folder and compare with --out (fails if out of date)
//
// Source of truth stays at the repo root. Change the lite text in tools/lite/
// (overrides = whole files, edits.json = exact replacements that must match).
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join, dirname, relative, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LITE = join(ROOT, 'tools', 'lite');
const argv = process.argv.slice(2);
const outArg = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'directory/hype-me';
const OUT = join(ROOT, outArg);

const COPY = ['.claude-plugin/plugin.json', '.claude-plugin/icon.png', 'commands', 'skills', 'agents', 'references', 'templates', 'LICENSE', 'PRIVACY.md'];
const ALLOWED = new Set(['.md', '.json', '.png', '']); // '' = LICENSE

export function build(out) {
  rmSync(out, { recursive: true, force: true });
  for (const p of COPY) copyTree(join(ROOT, p), join(out, p));
  copyTree(join(LITE, 'overrides'), out);
  const edits = JSON.parse(readFileSync(join(LITE, 'edits.json'), 'utf8'));
  for (const e of edits) {
    const f = join(out, e.file);
    const s = readFileSync(f, 'utf8');
    if (!s.includes(e.find)) throw new Error(`edit no longer matches ${e.file}: ${e.find.slice(0, 80)}…`);
    writeFileSync(f, s.split(e.find).join(e.replace));
  }
  return check(out);
}

// Every rule the directory applies to unverified publishers that we can check here.
export function check(out) {
  const problems = [];
  for (const f of walk(out)) {
    const rel = relative(out, f).split(sep).join('/');
    if (!ALLOWED.has(extname(f).toLowerCase())) problems.push(`${rel}: file type not allowed`);
    if (/[^\x20-\x7e]/.test(rel)) problems.push(`${rel}: non-ASCII path`);
    if (extname(f) === '.png') continue;
    const s = readFileSync(f, 'utf8');
    if (s.startsWith('#!')) problems.push(`${rel}: starts with #!`);
    if (s.includes('\0')) problems.push(`${rel}: NUL byte`);
    for (const bad of ['scripts/', '.mjs', 'node "']) if (s.includes(bad)) problems.push(`${rel}: mentions ${bad}`);
  }
  return problems;
}

function copyTree(from, to) {
  if (!existsSync(from)) throw new Error(`missing ${from}`);
  if (statSync(from).isDirectory()) {
    for (const n of readdirSync(from)) copyTree(join(from, n), join(to, n));
    return;
  }
  mkdirSync(dirname(to), { recursive: true });
  if (extname(from) === '.png') return copyFileSync(from, to);
  writeFileSync(to, readFileSync(from, 'utf8').replace(/\r\n/g, '\n')); // UTF-8, LF
}

function walk(d) {
  return readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (argv.includes('--check')) {
    const tmp = mkdtempSync(join(tmpdir(), 'hype-me-lite-'));
    const problems = build(tmp);
    const a = walk(tmp).map((f) => relative(tmp, f)).sort();
    const b = existsSync(OUT) ? walk(OUT).map((f) => relative(OUT, f)).sort() : [];
    const stale = a.length !== b.length || a.some((r, i) => r !== b[i] || !readFileSync(join(tmp, r)).equals(readFileSync(join(OUT, r))));
    rmSync(tmp, { recursive: true, force: true });
    if (problems.length) console.log(problems.join('\n'));
    if (stale) console.log(`${outArg} is out of date — run: node tools/build-lite.mjs`);
    process.exit(problems.length || stale ? 1 : 0);
  }
  const problems = build(OUT);
  if (problems.length) {
    console.log(problems.join('\n'));
    process.exit(1);
  }
  console.log(`built ${outArg} (${walk(OUT).length} files, no scripts)`);
}
