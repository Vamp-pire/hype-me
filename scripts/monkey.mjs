#!/usr/bin/env node
// Bug "monkey" test: several headless browsers play the game at once — random taps, real clicks
// on buttons/links/canvas, typing, keys, back — and record what breaks: uncaught exceptions,
// console errors, failed requests, HTTP errors, freezes and blank screens. Seeded, so any run
// can be repeated; each problem comes with the exact steps and a screenshot.
//
//   node monkey.mjs [--url <page>] [--cwd dir] [--level light|normal|deep]
//                   [--workers N] [--actions N] [--seed N] [--viewport mobile|desktop|both]
//                   [--minimize] [--json]
//
// Prefer a local or preview build: monkey visits count in your analytics like real visits.
// It never leaves the page's own site and never submits payment or login forms on purpose,
// but do not point it at a live site where clicks have real effects (purchases, posts).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { launch, newPage, watchErrors, sameOrigin, rng, sleep } from './lib/browser.mjs';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const profile = readJson(join(cwd, '.hype-me', 'profile.json')) || {};
const url = args.url || profile.links?.site;
if (!url) fail('No page to test. Pass --url (a local or preview build is best) or add the main link with /hype-me:setup.');
const origin = new URL(url).origin;

// Ranges per level (see references/budget.md); explicit flags win.
const LEVEL = { light: { workers: 2, actions: 30 }, normal: { workers: 4, actions: 60 }, deep: { workers: 8, actions: 150 } };
const level = LEVEL[args.level] ? args.level : LEVEL[profile.budget] ? profile.budget : 'normal';
const workers = Math.min(12, Number(args.workers || LEVEL[level].workers));
const actions = Math.min(500, Number(args.actions || LEVEL[level].actions));
const baseSeed = Number(args.seed || Date.now() % 1e6);
const viewports = args.viewport === 'both' ? ['mobile', 'desktop'] : [args.viewport || 'mobile'];

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const outDir = join(cwd, '.hype-me', 'bugs', `run-${stamp}`);
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const found = new Map(); // signature → issue
const started = Date.now();
try {
  const jobs = [];
  for (let w = 0; w < workers; w++) jobs.push(runWorker(w, baseSeed + w, viewports[w % viewports.length]));
  await Promise.all(jobs);
  if (args.minimize) for (const issue of [...found.values()].sort((a, b) => severity(b) - severity(a)).slice(0, 3)) await minimize(issue);
} finally {
  await browser.close();
}

const issues = [...found.values()].sort((a, b) => severity(b) - severity(a) || b.count - a.count);
const summary = { url, level, workers, actionsPerWorker: actions, seed: baseSeed, seconds: Math.round((Date.now() - started) / 1000), issues };
writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
if (args.json) console.log(JSON.stringify(summary, null, 2));
else {
  console.log(`${issues.length ? `${issues.length} problem(s)` : 'no problems found'} · ${workers} browsers × ${actions} actions · ${level} · seed ${baseSeed} · ${summary.seconds}s`);
  if (issues.length) {
    console.log('\n| # | kind | what | times | first seen |');
    console.log('|---|---|---|---|---|');
    issues.forEach((x, i) => console.log(`| ${i + 1} | ${x.type} | ${x.message.slice(0, 90)} | ${x.count} | worker ${x.worker} step ${x.step} (${x.viewport}) |`));
    console.log(`\nsteps and screenshots: ${outDir}`);
  }
}
process.exitCode = issues.length ? 1 : 0;

// ---------------- worker ----------------
async function runWorker(w, seed, viewport) {
  // Each player gets its own browser: tabs sharing one window wait on each other for input.
  const own = w === 0 ? browser : await launch();
  try {
    await playOn(own, w, seed, viewport);
  } finally {
    if (own !== browser) await own.close();
  }
}

async function playOn(b, w, seed, viewport) {
  const page = await newPage(b.port);
  const rand = rng(seed);
  const trace = [];
  let step = 0;
  watchErrors(page, origin, (e) => record(e, w, seed, viewport, step, trace, page));
  try {
    await page.viewport(viewport);
    await page.goto(url);
    for (step = 1; step <= actions; step++) {
      const act = await pickAction(page, rand);
      trace.push(act);
      // Freeze: the action itself (a blocked page holds the click) plus a trivial script afterwards
      // must finish quickly.
      const t0 = Date.now();
      await perform(page, act);
      await sleep(150 + Math.floor(rand() * 200));
      let here = url;
      try {
        here = await page.eval('location.href', 8000);
      } catch {
        /* no answer at all */
      }
      const waited = Date.now() - t0 - 350;
      if (waited > 3000 && act.kind !== 'back')
        record({ type: 'freeze', message: `page did not respond for ${Math.round(waited / 1000)}s after: ${describe(act)}` }, w, seed, viewport, step, trace, page);
      // left the site → come back
      if (!sameOrigin(here, origin)) await page.goto(url, 800);
      if (step % 5 === 0) await health(page, w, seed, viewport, step, trace);
    }
  } catch (err) {
    record({ type: 'driver', message: `test stopped: ${err.message}` }, w, seed, viewport, step, trace, page);
  } finally {
    page.close();
  }
}

async function pickAction(page, rand) {
  const r = rand();
  if (r < 0.05) return { kind: 'back' };
  if (r < 0.12) return { kind: 'key', key: ['Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '][Math.floor(rand() * 7)] };
  if (r < 0.17) return { kind: 'scroll', dy: Math.floor(rand() * 800) - 200 };
  const targets = await page
    .eval(`(() => {
      const sel = 'a[href],button,[role=button],[role=tab],[role=menuitem],input,select,textarea,[onclick],canvas,summary,label,[tabindex]';
      const vw = innerWidth, vh = innerHeight;
      return [...document.querySelectorAll(sel)].map(el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        if (r.width < 4 || r.height < 4 || s.visibility === 'hidden' || s.display === 'none' || el.disabled) return null;
        if (r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw) return null;
        if (el.closest('form[action*=pay],form[action*=checkout],form[action*=login]')) return null;
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (tag === 'input' && ['password','file','hidden'].includes(type)) return null;
        if (tag === 'a') { try { if (new URL(el.href, location.href).origin !== location.origin) return null; } catch { return null; } }
        return { tag, type, text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40),
          x: Math.max(1, Math.min(vw - 1, r.left + r.width / 2)), y: Math.max(1, Math.min(vh - 1, r.top + r.height / 2)),
          w: r.width, h: r.height, left: r.left, top: r.top };
      }).filter(Boolean);
    })()`)
    .catch(() => []);
  if (!targets.length) return { kind: 'tap', x: Math.floor(rand() * 380) + 5, y: Math.floor(rand() * 800) + 20, text: '(empty area)' };
  const t = targets[Math.floor(rand() * targets.length)];
  if (t.tag === 'canvas') {
    // games draw on canvas: tap a random point inside it, sometimes drag
    const x = Math.floor(t.left + rand() * t.w), y = Math.floor(t.top + rand() * t.h);
    if (rand() < 0.3) return { kind: 'drag', x, y, x2: Math.floor(t.left + rand() * t.w), y2: Math.floor(t.top + rand() * t.h), text: 'canvas' };
    return { kind: 'tap', x, y, text: 'canvas' };
  }
  if ((t.tag === 'input' && !['checkbox', 'radio', 'button', 'submit', 'range'].includes(t.type)) || t.tag === 'textarea')
    return { kind: 'type', x: Math.round(t.x), y: Math.round(t.y), value: ['', 'a', '테스트', '0', '-1', '9'.repeat(30), '<b>x</b>', ' '][Math.floor(rand() * 8)], text: t.text || t.tag };
  return { kind: 'tap', x: Math.round(t.x), y: Math.round(t.y), text: t.text || t.tag };
}

async function perform(page, a) {
  try {
    if (a.kind === 'tap') await page.click(a.x, a.y);
    else if (a.kind === 'type') {
      await page.click(a.x, a.y);
      await page.eval(`(() => { const el = document.activeElement; if (el && 'value' in el) el.value = ''; })()`);
      if (a.value) await page.send('Input.insertText', { text: a.value });
    } else if (a.kind === 'key') {
      for (const type of ['keyDown', 'keyUp']) await page.send('Input.dispatchKeyEvent', { type, key: a.key, code: a.key === ' ' ? 'Space' : a.key });
    } else if (a.kind === 'scroll') await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 100, y: 300, deltaX: 0, deltaY: a.dy });
    else if (a.kind === 'drag') {
      await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: a.x, y: a.y, button: 'left', clickCount: 1 });
      await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x2, y: a.y2, button: 'left' });
      await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: a.x2, y: a.y2, button: 'left', clickCount: 1 });
    } else if (a.kind === 'back') await page.eval('history.length > 1 && history.back()');
  } catch {
    /* a navigation in the middle of an action is normal */
  }
}

function describe(a) {
  if (a.kind === 'tap' || a.kind === 'type') return `${a.kind} "${a.text || ''}"${a.kind === 'type' ? ` = "${String(a.value).slice(0, 12)}"` : ''}`;
  if (a.kind === 'key') return `key ${a.key}`;
  return a.kind;
}

async function health(page, w, seed, viewport, step, trace) {
  // Blank screen: nothing visible to read or tap.
  const s = await page
    .eval(`(() => ({ text: (document.body?.innerText || '').trim().length, els: document.querySelectorAll('canvas,img,svg,video,button,a').length }))()`)
    .catch(() => null);
  if (s && s.text === 0 && s.els === 0) record({ type: 'blank', message: 'blank screen (no text or visible content)' }, w, seed, viewport, step, trace, page);
}

function record(e, worker, seed, viewport, step, trace, page) {
  const sig = `${e.type}|${normalize(e.message)}`;
  const known = found.get(sig);
  if (known) return void known.count++;
  const issue = { type: e.type, message: e.message, where: e.where || '', count: 1, worker, seed, viewport, step, steps: trace.slice(), signature: sig };
  found.set(sig, issue);
  const n = found.size;
  page
    .screenshot()
    .then((png) => {
      writeFileSync(join(outDir, `issue-${n}.png`), png, 'base64');
      issue.screenshot = `issue-${n}.png`;
    })
    .catch(() => {});
  writeFileSync(join(outDir, `issue-${n}-steps.json`), JSON.stringify({ url, viewport, seed, steps: issue.steps }, null, 2));
}

// Shorten the steps that reproduce an issue: first the shortest prefix (binary search),
// then try dropping each remaining step (a few replays, capped). Freezes are timed like the live run.
async function minimize(issue) {
  const replay = async (steps) => {
    const page = await newPage(browser.port);
    let hit = false;
    watchErrors(page, origin, (e) => {
      if (`${e.type}|${normalize(e.message)}` === issue.signature) hit = true;
    });
    try {
      await page.viewport(issue.viewport);
      await page.goto(url);
      for (const a of steps) {
        const t0 = Date.now();
        await perform(page, a);
        await sleep(300);
        let here = url;
        try {
          here = await page.eval('location.href', 8000);
        } catch {
          /* no answer */
        }
        if (issue.type === 'freeze' && Date.now() - t0 - 300 > 3000) hit = true;
        if (hit) break;
        // same rule as the live run: if the page left the site, come back to the start page
        if (!sameOrigin(here, origin)) await page.goto(url, 800);
      }
      await sleep(400);
    } finally {
      page.close();
    }
    return hit;
  };
  if (!(await replay(issue.steps))) return void (issue.reproducible = false);
  let lo = 0, hi = issue.steps.length;
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    (await replay(issue.steps.slice(0, mid))) ? (hi = mid) : (lo = mid);
  }
  let steps = issue.steps.slice(0, hi);
  // Drop steps one at a time, keeping the last one (it usually triggers the problem).
  for (let i = steps.length - 2, tries = 0; i >= 0 && tries < 10; i--, tries++) {
    const without = steps.filter((_, j) => j !== i);
    if (await replay(without)) steps = without;
  }
  issue.reproducible = true;
  issue.minimalSteps = steps;
}

function severity(x) {
  return { freeze: 6, blank: 6, exception: 5, 'http-500': 4, 'http-404': 3, 'console-error': 3, 'log-error': 2, 'network-failed': 2, driver: 1 }[x.type] ?? (x.type.startsWith('http-5') ? 4 : 2);
}
function normalize(m) {
  return String(m).replace(/\d+/g, '#').replace(/https?:\/\/\S+/g, 'URL').slice(0, 160);
}
function readJson(p) {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  } catch {
    return null;
  }
}
function fail(msg) {
  console.log(msg);
  process.exit(2);
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
