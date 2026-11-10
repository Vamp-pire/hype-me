#!/usr/bin/env node
// UX snapshots and scripted play with the installed Chrome/Edge (no dependencies).
//
// First screen on phone and PC, with checks a first-time visitor would feel:
//   node snap.mjs --url <page> [--cwd dir] [--viewport mobile|desktop|both]
// Play through steps and capture each screen (for the ux-playtester):
//   node snap.mjs --url <page> --steps steps.json [--viewport mobile]
//   steps.json: [ {"click": "Start"}, {"wait": 800}, {"shot": "after-start"},
//                 {"clickSelector": "#play"}, {"tap": [200, 400]}, {"type": "hello"},
//                 {"key": "Enter"}, {"scroll": 600}, {"goto": "/en/"} ]
// Output: .hype-me/ux/<timestamp>/ (PNG per screen + report.json) and a short summary.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { launch, newPage, watchErrors, sleep } from './lib/browser.mjs';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const profile = readJson(join(cwd, '.hype-me', 'profile.json')) || {};
const url = args.url || profile.links?.site;
if (!url) fail('No page. Pass --url or add the main link with /hype-me:setup.');
const origin = new URL(url).origin;
const viewports = args.viewport === 'both' || !args.viewport ? (args.steps ? ['mobile'] : ['mobile', 'desktop']) : [args.viewport];
const steps = args.steps ? readJson(args.steps) : null;
if (args.steps && !Array.isArray(steps)) fail(`could not read steps from ${args.steps}`);

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const outDir = join(cwd, '.hype-me', 'ux', stamp);
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const report = { url, at: new Date().toISOString(), screens: [] };
try {
  for (const vp of viewports) {
    const page = await newPage(browser.port);
    const errors = [];
    watchErrors(page, origin, (e) => errors.push(e));
    await page.viewport(vp);
    const t0 = Date.now();
    await page.goto(url, 1200);
    const loadMs = Date.now() - t0;
    report.screens.push(await capture(page, vp, 'first-screen', { loadMs }));
    if (steps) {
      let i = 0;
      for (const s of steps) {
        i++;
        const started = Date.now();
        const note = await doStep(page, s);
        await sleep(s.wait ?? 600);
        if (s.shot || note.startsWith('not found')) report.screens.push(await capture(page, vp, s.shot || `step-${i}`, { step: i, did: note, ms: Date.now() - started }));
        else report.screens.push({ viewport: vp, name: `step-${i}`, did: note, ms: Date.now() - started });
      }
    }
    report.errors = (report.errors || []).concat(errors.map((e) => ({ viewport: vp, ...e })));
    page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

for (const s of report.screens.filter((x) => x.file)) {
  const m = s.metrics;
  const flags = [];
  if (m.horizontalScroll) flags.push('sideways scroll');
  if (m.smallTapTargets) flags.push(`${m.smallTapTargets} tap targets under 40px`);
  if (m.tinyText) flags.push(`${m.tinyText} text blocks under 12px`);
  if (!m.actionsAboveFold) flags.push('nothing to tap on the first screen');
  console.log(`${s.viewport} · ${s.name}${s.loadMs ? ` · loaded in ${(s.loadMs / 1000).toFixed(1)}s` : ''}${s.did ? ` · ${s.did}` : ''}`);
  console.log(`  title "${m.title}" · ${m.actionsAboveFold} things to tap above the fold${m.mainAction ? ` · biggest: "${m.mainAction}"` : ''}${flags.length ? ` · ⚠ ${flags.join(', ')}` : ''}`);
  console.log(`  ${s.file}`);
}
for (const s of report.screens.filter((x) => !x.file)) console.log(`${s.viewport} · ${s.name} · ${s.did} (${s.ms}ms)`);
if (report.errors?.length) console.log(`\nerrors while loading/playing: ${report.errors.map((e) => `${e.type}: ${e.message.slice(0, 80)}`).join(' | ')}`);
console.log(`\nfolder: ${outDir}`);

async function capture(page, viewport, name, extra) {
  const metrics = await page
    .eval(`(() => {
      const vw = innerWidth, vh = innerHeight;
      const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0; };
      const taps = [...document.querySelectorAll('a[href],button,[role=button],input,select,textarea,summary,canvas')].filter(visible);
      const small = taps.filter(el => { const r = el.getBoundingClientRect(); return el.tagName !== 'CANVAS' && (r.width < 40 || r.height < 40); }).length;
      const biggest = taps.filter(el => el.tagName !== 'CANVAS').map(el => ({ el, a: el.getBoundingClientRect().width * el.getBoundingClientRect().height }))
        .sort((a, b) => b.a - a.a)[0];
      let tiny = 0;
      for (const el of document.querySelectorAll('p,span,a,li,button,label,small,td')) {
        if (!visible(el) || !el.innerText?.trim()) continue;
        if (parseFloat(getComputedStyle(el).fontSize) < 12) tiny++;
      }
      return { title: document.title, horizontalScroll: document.documentElement.scrollWidth > vw + 2,
        actionsAboveFold: taps.length, smallTapTargets: small, tinyText: tiny,
        mainAction: biggest ? (biggest.el.innerText || biggest.el.value || biggest.el.getAttribute('aria-label') || '').trim().slice(0, 40) : null,
        textAboveFold: (document.body?.innerText || '').slice(0, 300) };
    })()`)
    .catch(() => ({ title: '?', actionsAboveFold: 0, smallTapTargets: 0, tinyText: 0 }));
  const file = join(outDir, `${viewport}-${name}.png`);
  writeFileSync(file, await page.screenshot());
  return { viewport, name, file, metrics, ...extra };
}

async function doStep(page, s) {
  try {
    if (s.goto) {
      await page.goto(new URL(s.goto, url).toString(), 800);
      return `opened ${s.goto}`;
    }
    if (s.click || s.clickSelector) {
      const pos = await page.eval(`(() => {
        const want = ${JSON.stringify(s.click || '')}.toLowerCase(), sel = ${JSON.stringify(s.clickSelector || '')};
        const els = sel ? [...document.querySelectorAll(sel)] : [...document.querySelectorAll('a,button,[role=button],summary,label,input[type=submit],input[type=button],[onclick]')]
          .filter(el => (el.innerText || el.value || el.getAttribute('aria-label') || '').toLowerCase().includes(want));
        const el = els.find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (!pos) return `not found: ${s.click || s.clickSelector}`;
      await page.click(pos.x, pos.y);
      return `clicked "${s.click || s.clickSelector}"`;
    }
    if (s.tap) {
      await page.click(s.tap[0], s.tap[1]);
      return `tapped ${s.tap.join(',')}`;
    }
    if (s.type !== undefined) {
      await page.send('Input.insertText', { text: String(s.type) });
      return `typed "${s.type}"`;
    }
    if (s.key) {
      for (const type of ['keyDown', 'keyUp']) await page.send('Input.dispatchKeyEvent', { type, key: s.key });
      return `key ${s.key}`;
    }
    if (s.scroll) {
      await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 100, y: 300, deltaX: 0, deltaY: s.scroll });
      return `scrolled ${s.scroll}`;
    }
    if (s.wait) return `waited ${s.wait}ms`;
    if (s.shot) return 'screenshot';
    return 'unknown step';
  } catch (err) {
    return `failed: ${err.message}`;
  }
}

function readJson(p) {
  try {
    return p && existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
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
