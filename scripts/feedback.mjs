#!/usr/bin/env node
// Turns user feedback into a GitHub issue for hype-me.
// Adds plugin version, OS and Node automatically, hides personal data, and prints a
// prefilled "new issue" link. The user opens it and submits it themselves.
//
//   node feedback.mjs --file feedback.json [--json]
//   feedback.json: { "kind": "bug|confusing|idea|praise|other", "skill": "setup",
//                    "tried": "...", "stuck": "...", "helpful": "...", "extra": "..." }
import { readFileSync, existsSync } from 'node:fs';
import os from 'node:os';

const REPO = 'Vamp-pire/hype-me';
const VERSION = '0.14.1'; // keep in step with the plugin manifest (a test checks it)
const args = parseArgs(process.argv.slice(2));
const fb = args.file && existsSync(args.file) ? JSON.parse(readFileSync(args.file, 'utf8')) : null;
if (!fb) {
  console.log('usage: feedback.mjs --file feedback.json [--json]');
  process.exit(2);
}

const kind = ['bug', 'confusing', 'idea', 'praise', 'other'].includes(fb.kind) ? fb.kind : 'other';
const first = clean(fb.stuck || fb.tried || fb.helpful || fb.extra || 'feedback').split(/[.\n]/)[0];
const title = `[${kind}] ${fb.skill ? `${clean(fb.skill)}: ` : ''}${first}`.slice(0, 120);
const section = (h, v) => (v ? `### ${h}\n${clean(v)}\n` : '');
const body = [
  section('What I tried', fb.tried),
  section('Where I got stuck / what was confusing', fb.stuck),
  section('What helped', fb.helpful),
  section('Anything else', fb.extra),
  `---\nhype-me ${VERSION} · ${os.platform()} ${os.release()} · Node ${process.version}${fb.skill ? ` · skill: ${clean(fb.skill)}` : ''}\n_sent with /hype-me:feedback_`,
]
  .filter(Boolean)
  .join('\n');

const url = `https://github.com/${REPO}/issues/new?${new URLSearchParams({ title, body: body.slice(0, 6000), labels: 'feedback' })}`;

if (args.json) console.log(JSON.stringify({ title, body, url }, null, 2));
else {
  console.log(`${title}\n\n${body}\n`);
  console.log(`open to submit (needs a GitHub account): ${url}`);
}

// Hide things that should not be in a public issue: home paths, emails, keys/tokens, IPs.
function clean(s) {
  return String(s)
    .replace(/[A-Za-z]:\\Users\\[^\\\s"']+(\\[^\s"']*)?/g, '<path>')
    .replace(/\/(Users|home)\/[^/\s"']+(\/[^\s"']*)?/g, '<path>')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<email>')
    .replace(/\b(sk|pk|rk|ghp|gho|ghs|github_pat|xox[abp])[-_][A-Za-z0-9_-]{12,}\b/g, '<secret>')
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '<secret>')
    .replace(/\b\d{1,3}(\.\d{1,3}){3}\b/g, '<ip>')
    .trim();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      out[a.slice(2)] = next;
      i++;
    } else out[a.slice(2)] = true;
  }
  return out;
}
