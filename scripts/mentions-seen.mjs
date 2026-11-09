#!/usr/bin/env node
// Keeps the list of mentions already reported, so each run shows only new ones.
//
//   node mentions-seen.mjs new <file.json> [--cwd dir]   → prints only unseen items (JSON) and remembers them
//   node mentions-seen.mjs stats [--cwd dir]             → how many seen, per source, last run
//
// Input file: JSON array of { "url": "...", "source": "reddit|youtube|steam|itch|discord|web|…",
//   "date": "YYYY-MM-DD", "title": "...", "kind": "love|gripe|bug|request|question|other" }
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const cwdIdx = argv.indexOf('--cwd');
const cwd = cwdIdx >= 0 ? argv[cwdIdx + 1] : process.cwd();
const [cmd, file] = argv.filter((_, i) => i !== cwdIdx && i !== cwdIdx + 1);
const dir = join(cwd, '.hype-me');
const storePath = join(dir, 'mentions.json');
const store = existsSync(storePath) ? JSON.parse(readFileSync(storePath, 'utf8')) : { lastRun: null, items: [] };

if (cmd === 'new' && file) {
  const incoming = JSON.parse(readFileSync(file, 'utf8'));
  const seen = new Set(store.items.map((x) => norm(x.url)));
  const fresh = [];
  for (const item of incoming) {
    if (!item?.url) continue;
    const key = norm(item.url);
    if (seen.has(key)) continue;
    seen.add(key);
    fresh.push({ ...item, firstSeen: today() });
  }
  store.items.push(...fresh);
  const previousRun = store.lastRun;
  store.lastRun = today();
  mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2) + '\n');
  console.log(JSON.stringify({ previousRun, newCount: fresh.length, items: fresh }, null, 2));
} else if (cmd === 'stats') {
  const bySource = {};
  for (const x of store.items) bySource[x.source || 'other'] = (bySource[x.source || 'other'] || 0) + 1;
  console.log(JSON.stringify({ lastRun: store.lastRun, total: store.items.length, bySource }, null, 2));
} else {
  console.log('usage: mentions-seen.mjs new <file.json> | stats   [--cwd dir]');
  process.exitCode = 2;
}

function norm(u) {
  try {
    const x = new URL(u);
    x.hash = '';
    for (const k of [...x.searchParams.keys()]) if (k.startsWith('utm_')) x.searchParams.delete(k);
    return x.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return String(u).trim().toLowerCase();
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
