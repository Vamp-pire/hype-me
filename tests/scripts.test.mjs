// Tests for hype-me's scripts. Run: node --test tests/scripts.test.mjs
// Browser tests (monkey, snap) run only when Chrome or Edge is installed and Node has WebSocket (22+).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { deflateSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = (name) => join(ROOT, 'scripts', name);
const run = (script, args, opts = {}) => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [S(script), ...args], { encoding: 'utf8', timeout: 180000, ...opts }) };
  } catch (e) {
    return { code: e.status, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
};
const tmp = () => mkdtempSync(join(tmpdir(), 'hype-me-test-'));

test('traffic-csv: GA4 export, two periods in one file, tracking-link names', () => {
  const d = tmp();
  mkdirSync(join(d, '.hype-me'));
  writeFileSync(join(d, '.hype-me', 'links.json'), JSON.stringify([{ source: 'reddit-chessvariants', channel: 'r/chessvariants' }]));
  writeFileSync(
    join(d, 'ga4.csv'),
    '# Traffic acquisition\n#\nDate,Session source / medium,Sessions\n20261027,google / organic,40\n20261102,google / organic,55\n20261103,reddit-chessvariants / community,31\n20261105,(direct) / (none),"1,020"\n',
  );
  const r = run('traffic-csv.mjs', [join(d, 'ga4.csv'), '--cwd', d, '--from', '2026-11-02', '--vs-from', '2026-10-26', '--vs-to', '2026-11-01', '--json']);
  assert.equal(r.code, 0, r.out);
  const j = JSON.parse(r.out);
  assert.equal(j.total, 1106);
  assert.equal(j.rows.find((x) => x.source.startsWith('google')).value, 55);
  assert.equal(j.rows.find((x) => x.source.startsWith('reddit')).place, 'r/chessvariants');
  rmSync(d, { recursive: true, force: true });
});

test('traffic-csv: friendly errors', () => {
  const d = tmp();
  writeFileSync(join(d, 'a.csv'), 'Referrer;Visits\nx;1\n');
  assert.equal(run('traffic-csv.mjs', [join(d, 'nope.csv')]).code, 2);
  const r = run('traffic-csv.mjs', [join(d, 'a.csv'), '--metric', 'Foo']);
  assert.equal(r.code, 2);
  assert.match(r.out, /column "Foo" not found/);
  rmSync(d, { recursive: true, force: true });
});

test('utm: builds links from the profile and keeps them', () => {
  const d = tmp();
  mkdirSync(join(d, '.hype-me'));
  writeFileSync(join(d, '.hype-me', 'profile.json'), JSON.stringify({ links: { site: 'https://example.com' } }));
  const r = run('utm.mjs', ['add', '--cwd', d, '--channel', 'r/chessvariants', '--campaign', 'Launch Nov']);
  assert.equal(r.code, 0, r.out);
  const u = new URL(r.out.trim());
  assert.equal(u.searchParams.get('utm_source'), 'reddit-chessvariants');
  assert.equal(u.searchParams.get('utm_medium'), 'community');
  assert.equal(u.searchParams.get('utm_campaign'), 'launch-nov');
  const links = JSON.parse(readFileSync(join(d, '.hype-me', 'links.json'), 'utf8'));
  assert.equal(links.length, 1);
  rmSync(d, { recursive: true, force: true });
});

test('mentions-seen: reports only new mentions (tracking tags and slashes ignored)', () => {
  const d = tmp();
  writeFileSync(join(d, 'a.json'), JSON.stringify([{ url: 'https://reddit.com/r/x/1?utm_source=a', source: 'reddit' }, { url: 'https://youtu.be/abc', source: 'youtube' }]));
  writeFileSync(join(d, 'b.json'), JSON.stringify([{ url: 'https://reddit.com/r/x/1/', source: 'reddit' }, { url: 'https://itch.io/c/9', source: 'itch' }]));
  assert.equal(JSON.parse(run('mentions-seen.mjs', ['new', join(d, 'a.json'), '--cwd', d]).out).newCount, 2);
  const second = JSON.parse(run('mentions-seen.mjs', ['new', join(d, 'b.json'), '--cwd', d]).out);
  assert.equal(second.newCount, 1);
  assert.equal(second.items[0].url, 'https://itch.io/c/9');
  rmSync(d, { recursive: true, force: true });
});

test('image-size: reads PNG size and compares with a platform size', () => {
  const d = tmp();
  writeFileSync(join(d, 'og.png'), png(1200, 630));
  writeFileSync(join(d, 'small.png'), png(460, 215));
  assert.match(run('image-size.mjs', [join(d, 'og.png'), '--expect', '1200x630']).out, /1200×630.*matches/);
  const r = run('image-size.mjs', [join(d, 'small.png'), '--expect', '920x430']);
  assert.equal(r.code, 1);
  assert.match(r.out, /same shape, too small/);
  rmSync(d, { recursive: true, force: true });
});

test('retention: cohorts, activation and an aha-moment candidate', () => {
  const d = tmp();
  let s = 1;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rows = ['user_id,event_timestamp,event_name'];
  const start = Date.UTC(2026, 8, 28);
  for (let u = 0; u < 300; u++) {
    const t0 = start + Math.floor(r() * 35) * 864e5;
    const games = Math.floor(r() * 5);
    rows.push(`u${u},${t0 * 1000},first_visit`);
    for (let g = 0; g < games; g++) rows.push(`u${u},${(t0 + (g + 1) * 6e4) * 1000},game_complete`);
    const p = games >= 3 ? 0.7 : 0.1;
    for (const k of [1, 3, 7]) if (r() < p) rows.push(`u${u},${(t0 + k * 864e5) * 1000},game_start`);
  }
  writeFileSync(join(d, 'events.csv'), rows.join('\n'));
  const out = run('retention.mjs', [join(d, 'events.csv'), '--aha', 'game_complete', '--discover', '--json']);
  assert.equal(out.code, 0, out.out);
  const j = JSON.parse(out.out);
  assert.equal(j.people, 300);
  assert.ok(j.overall.d1.pct > 0);
  assert.ok(j.activation.retainedIfDid.pct > j.activation.retainedIfNot.pct);
  assert.match(j.ahaCandidates[0].behaviour, /game_complete ×[35]\+/);
  rmSync(d, { recursive: true, force: true });
});

test('feedback: builds an issue with version info, hides personal data, gives a prefilled link', () => {
  const d = tmp();
  writeFileSync(
    join(d, 'fb.json'),
    JSON.stringify({
      kind: 'confusing',
      tried: 'ran /hype-me:setup in C:\\Users\\Alice\\games\\chess',
      stuck: 'it asked for my key sk-abcdefghijklmnopqrstuvwx and my mail alice@example.com',
      helpful: 'channels list was good',
      skill: 'setup',
    }),
  );
  const r = run('feedback.mjs', ['--file', join(d, 'fb.json'), '--json']);
  assert.equal(r.code, 0, r.out);
  const j = JSON.parse(r.out);
  assert.match(j.title, /^\[confusing\] setup: /);
  assert.match(j.body, /hype-me 0\.\d+\.\d+/); // plugin version
  assert.match(j.body, /Node v\d+/);
  assert.doesNotMatch(j.body, /Alice|alice@example\.com|sk-abcdefghijklmnop/);
  assert.match(j.body, /<path>|<email>|<secret>/);
  const u = new URL(j.url);
  assert.equal(u.origin + u.pathname, 'https://github.com/Vamp-pire/hype-me/issues/new');
  assert.equal(u.searchParams.get('labels'), 'feedback');
  assert.ok(j.url.length < 8000);
  // only builds a link; never posts
  assert.equal(j.posted, undefined);
  const manifest = JSON.parse(readFileSync(join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
  assert.ok(j.body.includes(`hype-me ${manifest.version} `), 'VERSION in feedback.mjs must match plugin.json');
  rmSync(d, { recursive: true, force: true });
});

// ---------- browser tests ----------
const { findBrowser } = await import(new URL('../scripts/lib/browser.mjs', import.meta.url));
const canBrowse = typeof WebSocket !== 'undefined' && !!findBrowser();

test('monkey: finds planted bugs and shortens the steps', { skip: !canBrowse && 'no Chrome/Edge or Node < 22', timeout: 240000 }, async () => {
  const html = `<!doctype html><meta name=viewport content="width=device-width"><title>t</title>
    <button onclick="null.f()">Boom</button><a href="/missing">Broken</a>
    <canvas id=c width=300 height=200></canvas>
    <script>c.onclick=e=>{ if(e.offsetX>150) throw new Error('canvas bug') }</script>`;
  const server = createServer((q, s) => (q.url === '/' ? (s.writeHead(200, { 'content-type': 'text/html' }), s.end(html)) : (s.writeHead(404), s.end())));
  await new Promise((ok) => server.listen(0, ok));
  const d = tmp();
  try {
    const r = await runAsync('monkey.mjs', ['--url', `http://127.0.0.1:${server.address().port}/`, '--cwd', d, '--workers', '2', '--actions', '20', '--seed', '3', '--minimize', '--json']);
    const j = JSON.parse(r.slice(r.indexOf('{')));
    const kinds = j.issues.map((x) => x.message).join(' | ');
    assert.match(kinds, /reading 'f'/);
    assert.ok(j.issues.some((x) => x.minimalSteps && x.minimalSteps.length <= 2), 'at least one issue shortened to 1–2 steps');
  } finally {
    server.close();
    rmSync(d, { recursive: true, force: true });
  }
});

test('snap: first screen with checks and a screenshot', { skip: !canBrowse && 'no Chrome/Edge or Node < 22', timeout: 120000 }, async () => {
  const html = `<!doctype html><meta name=viewport content="width=device-width"><title>Snap</title><button style="width:20px;height:20px">x</button><p>hello</p>`;
  const server = createServer((q, s) => (s.writeHead(200, { 'content-type': 'text/html' }), s.end(html)));
  await new Promise((ok) => server.listen(0, ok));
  const d = tmp();
  try {
    const out = await runAsync('snap.mjs', ['--url', `http://127.0.0.1:${server.address().port}/`, '--cwd', d, '--viewport', 'mobile']);
    assert.match(out, /title "Snap"/);
    assert.match(out, /1 tap targets under 40px/);
    const file = out.match(/(\S+mobile-first-screen\.png)/)?.[1];
    assert.ok(file && existsSync(file));
  } finally {
    server.close();
    rmSync(d, { recursive: true, force: true });
  }
});

test('snap bot: reaches the goal, counts dead taps, canvas taps count as responses', { skip: !canBrowse && 'no Chrome/Edge or Node < 22', timeout: 120000 }, async () => {
  const html = `<!doctype html><meta name=viewport content="width=device-width"><title>Bot</title>
    <button id=s onclick="document.getElementById('o').textContent='Game over'">Start</button>
    <button>Dead</button><p id=o>ready</p>
    <canvas id=c width=200 height=100 style="border:1px solid"></canvas>
    <script>let n=0;c.onclick=()=>{const x=c.getContext('2d');x.fillRect(n++*10,10,8,8)}</script>`;
  const server = createServer((q, s) => (s.writeHead(200, { 'content-type': 'text/html' }), s.end(html)));
  await new Promise((ok) => server.listen(0, ok));
  const d = tmp();
  writeFileSync(join(d, 'bot.json'), JSON.stringify({ persona: 'tester', viewport: 'mobile', goal: 'Game over', steps: [{ click: 'Start' }, { expect: 'Game over' }, { click: 'Dead' }, { clickSelector: '#c' }, { click: 'Nope' }] }));
  try {
    const out = await runAsync('snap.mjs', ['--url', `http://127.0.0.1:${server.address().port}/`, '--cwd', d, '--bot', join(d, 'bot.json')]);
    assert.match(out, /goal "Game over" reached at step 2/);
    assert.match(out, /dead taps 1 · not found 1/);
    assert.match(out, /clicked "Dead" — no visible response/);
    assert.doesNotMatch(out, /clicked "#c" — no visible response/);
    assert.match(out, /\.jpg/);
  } finally {
    server.close();
    rmSync(d, { recursive: true, force: true });
  }
});

// ---------- helpers ----------
function runAsync(script, args, env) {
  return new Promise((ok) => {
    let out = '';
    const p = spawn(process.execPath, [S(script), ...args], env ? { env } : undefined);
    p.stdout.on('data', (b) => (out += b));
    p.stderr.on('data', (b) => (out += b));
    p.on('close', () => ok(out));
  });
}

function png(w, h) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  const crcT = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (b) => {
    let c = 0xffffffff;
    for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (t, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(t), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('directory edition is up to date and has no scripts', () => {
  const r = execFileSync(process.execPath, [join(ROOT, 'tools', 'build-lite.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(r.trim(), '');
});
