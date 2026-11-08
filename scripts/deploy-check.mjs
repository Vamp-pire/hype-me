#!/usr/bin/env node
// Checks that the live site is up and serves the build you just made.
//
// Usage: node deploy-check.mjs [--cwd <dir>] [--url <site>] [--paths /,/en/]
//                              [--build <dir with index.html>] [--wait <seconds>]
// Defaults come from .fullship/config.json (deploy.url, deploy.checkPaths, deploy.buildDir).
// --wait keeps retrying every 15s until everything passes or time runs out.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const configPath = join(cwd, '.fullship', 'config.json');
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
const deploy = config.deploy || {};

const url = (args.url || deploy.url || '').replace(/\/+$/, '');
if (!url) {
  console.log('No site URL. Pass --url or set deploy.url with /fullship:setup.');
  process.exit(2);
}
const paths = args.paths ? String(args.paths).split(',') : deploy.checkPaths || ['/'];
const buildDir = args.build || deploy.buildDir || null;
const waitSec = Number(args.wait || 0);

const expected = buildDir ? localAssets(resolve(cwd, buildDir)) : [];

const deadline = Date.now() + waitSec * 1000;
let report;
for (let attempt = 1; ; attempt++) {
  report = await checkOnce();
  if (report.ok || Date.now() + 15000 > deadline) break;
  console.log(`attempt ${attempt}: not live yet, retrying in 15s…`);
  await new Promise((r) => setTimeout(r, 15000));
}

const passed = report.rows.filter((r) => r.ok).length;
console.log(`${report.ok ? 'live' : 'not confirmed'} · ${passed}/${report.rows.length} checks passed · ${url}`);
console.log('');
console.log('| check | result | detail |');
console.log('|---|---|---|');
for (const r of report.rows) console.log(`| ${r.name} | ${r.ok ? 'passed' : 'failed'} | ${r.detail} |`);
if (!buildDir) console.log('\n(no build folder given: checked pages only, not whether the new build is live)');

const dir = join(cwd, '.fullship', 'evidence');
if (existsSync(join(cwd, '.fullship'))) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'last-deploy-check.json'), JSON.stringify({ at: new Date().toISOString(), url, ...report }, null, 2));
}
process.exitCode = report.ok ? 0 : 1;

async function checkOnce() {
  const rows = [];
  let homeHtml = '';
  for (const p of paths) {
    const target = url + (p.startsWith('/') ? p : `/${p}`);
    try {
      const res = await fetch(`${target}${target.includes('?') ? '&' : '?'}fullship=${Date.now()}`, {
        headers: { 'cache-control': 'no-cache', 'user-agent': 'fullship-deploy-check' },
        redirect: 'follow',
      });
      const body = await res.text();
      if (p === '/' || p === '') homeHtml = body;
      rows.push({ name: `page ${p}`, ok: res.status === 200, detail: `HTTP ${res.status}` });
    } catch (err) {
      rows.push({ name: `page ${p}`, ok: false, detail: err.message });
    }
  }
  if (expected.length) {
    if (!homeHtml) {
      try {
        homeHtml = await (await fetch(`${url}/?fullship=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } })).text();
      } catch {
        homeHtml = '';
      }
    }
    const missing = expected.filter((a) => !homeHtml.includes(a));
    rows.push({
      name: 'new build is live',
      ok: missing.length === 0,
      detail: missing.length ? `missing on live site: ${missing.slice(0, 3).join(', ')}` : `${expected.length} build files match`,
    });
  }
  return { ok: rows.every((r) => r.ok), rows };
}

// Hashed asset names referenced by the local build's index.html.
function localAssets(dir) {
  const file = join(dir, 'index.html');
  if (!existsSync(file)) {
    console.log(`(no ${file}; skipping build match)`);
    return [];
  }
  const html = readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1].split('/').pop());
  return [...new Set(refs)].filter((name) => /[.-][A-Za-z0-9_-]{6,}\.(js|css)$/.test(name));
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[a.slice(2)] = next;
      i++;
    } else out[a.slice(2)] = true;
  }
  return out;
}
