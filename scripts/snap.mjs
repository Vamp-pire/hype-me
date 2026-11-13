#!/usr/bin/env node
// UX snapshots and bot play with the installed Chrome/Edge (no dependencies, no AI).
//
// First look (text outline of what is on screen and what can be tapped, plus checks):
//   node snap.mjs --url <page> [--cwd dir] [--viewport mobile|desktop|both] [--outline]
// Run a play bot (built once by the ux-playtester, reused every release):
//   node snap.mjs --url <page> --bot bot.json [--shots none|key|all] [--scale 0.5]
//   bot.json: { "persona": "...", "viewport": "mobile", "goal": "Game over",
//               "steps": [ {"click":"Start"}, {"wait":800}, {"tap":[200,400]}, {"type":"hi"},
//                          {"key":"Enter"}, {"scroll":600}, {"goto":"/en/"},
//                          {"expect":"Your result"}, {"outline":true}, {"shot":"after-start"} ] }
//   {"outline":true} prints what is on screen at that point as text (cheap for an AI to read).
//   (a plain array of steps also works, and --steps is an alias of --bot)
// Per step it measures time and whether the screen visibly responded (taps with no visible change
// are counted as dead taps). Screenshots: "key" = first screen, named shots and problems (default).
// Output: .hype-me/ux/<timestamp>/ (report.json, images) and a short text summary.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { launch, newPage, watchErrors, sleep } from './lib/browser.mjs';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const profile = readJson(join(cwd, '.hype-me', 'profile.json')) || {};
const url = args.url || profile.links?.site;
if (!url) fail('No page. Pass --url or add the main link with /hype-me:setup.');
const origin = new URL(url).origin;
const botFile = args.bot || args.steps;
const bot = botFile ? normalizeBot(readJson(botFile)) : null;
if (botFile && !bot) fail(`could not read the bot from ${botFile}`);
const viewports = args.viewport === 'both' ? ['mobile', 'desktop'] : args.viewport ? [args.viewport] : bot ? [bot.viewport || 'mobile'] : ['mobile', 'desktop'];
const shots = args.shots || 'key';
const scale = Math.min(1, Math.max(0.25, Number(args.scale || (bot ? 0.5 : 1))));

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const outDir = join(cwd, '.hype-me', 'ux', stamp);
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const report = { url, at: new Date().toISOString(), persona: bot?.persona || null, goal: bot?.goal || null, runs: [] };
try {
  for (const vp of viewports) {
    const page = await newPage(browser.port);
    const errors = [];
    watchErrors(page, origin, (e) => errors.push(e));
    await page.viewport(vp);
    const t0 = Date.now();
    await page.goto(url, 1200);
    const run = { viewport: vp, loadMs: Date.now() - t0, first: await look(page), steps: [], errors };
    if (shots !== 'none') run.first.image = await shot(page, vp, 'first-screen');
    if (bot) {
      const started = Date.now();
      let i = 0;
      for (const s of bot.steps) {
        i++;
        const before = await signature(page);
        const t = Date.now();
        const did = await doStep(page, s);
        await sleep(s.wait ?? 500);
        const after = await signature(page);
        const isTap = !!(s.click || s.clickSelector || s.tap);
        const responded = before !== after;
        const step = { i, did, ms: Date.now() - t };
        if (isTap && !did.startsWith('not found') && !responded) step.deadTap = true;
        if (s.expect !== undefined) {
          step.expect = s.expect;
          step.found = did.startsWith('found');
          if (step.found && bot.goal && s.expect === bot.goal && run.goalAtMs == null) {
            run.goalAtMs = Date.now() - started;
            run.goalAtStep = i;
          }
        }
        const problem = did.startsWith('not found') || step.deadTap || (s.expect !== undefined && !step.found);
        if (shots === 'all' || (shots === 'key' && (s.shot || problem))) step.image = await shot(page, vp, s.shot || `step-${i}${problem ? '-problem' : ''}`);
        run.steps.push(step);
      }
      run.totalMs = Date.now() - started;
      if (bot.goal && run.goalAtMs == null) run.goalReached = false;
      else if (bot.goal) run.goalReached = true;
    }
    report.runs.push(run);
    page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
print();

function print() {
  for (const r of report.runs) {
    const f = r.first;
    const flags = [];
    if (f.horizontalScroll) flags.push('sideways scroll');
    if (f.smallTapTargets) flags.push(`${f.smallTapTargets} tap targets under 40px`);
    if (f.tinyText) flags.push(`${f.tinyText} text blocks under 12px`);
    if (!f.taps.length) flags.push('nothing to tap on the first screen');
    console.log(`${r.viewport} · loaded in ${(r.loadMs / 1000).toFixed(1)}s · title "${f.title}"${flags.length ? ` · ⚠ ${flags.join(', ')}` : ''}`);
    if (args.outline || !bot) {
      console.log(`  heading: ${f.headings.join(' / ') || '—'}`);
      console.log(`  text: ${f.text.slice(0, 220).replace(/\s+/g, ' ')}`);
      console.log(`  can tap (${f.taps.length}): ${f.taps.slice(0, 25).map((t) => `"${t.label}"${t.small ? '(small)' : ''}`).join(' · ')}`);
    }
    if (f.image) console.log(`  image: ${f.image}`);
    if (bot) {
      const dead = r.steps.filter((s) => s.deadTap).length;
      const missing = r.steps.filter((s) => s.did.startsWith('not found')).length;
      console.log(`  bot "${report.persona || 'player'}": ${r.steps.length} steps in ${(r.totalMs / 1000).toFixed(1)}s · dead taps ${dead} · not found ${missing}${bot.goal ? ` · goal "${bot.goal}" ${r.goalReached ? `reached at step ${r.goalAtStep} (${(r.goalAtMs / 1000).toFixed(1)}s)` : 'NOT reached'}` : ''}`);
      for (const s of r.steps) if (s.deadTap || s.did.startsWith('not found') || s.found === false || s.image || s.did.startsWith('outline'))
        console.log(`   ${s.i}. ${s.did}${s.deadTap ? ' — no visible response' : ''}${s.found === false ? ' — expected text not on screen' : ''}${s.image ? ` [${s.image}]` : ''}`);
    }
    if (r.errors.length) console.log(`  errors: ${r.errors.map((e) => `${e.type}: ${e.message.slice(0, 80)}`).join(' | ')}`);
  }
  console.log(`\nfolder: ${outDir}`);
}

async function look(page) {
  return page
    .eval(`(() => {
      const vw = innerWidth, vh = innerHeight;
      const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0; };
      const taps = [...document.querySelectorAll('a[href],button,[role=button],[role=tab],input,select,textarea,summary,canvas,[onclick]')].filter(visible).map(el => {
        const r = el.getBoundingClientRect();
        return { label: (el.tagName === 'CANVAS' ? '[canvas]' : (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.tagName.toLowerCase())).trim().replace(/\\s+/g, ' ').slice(0, 40),
          small: el.tagName !== 'CANVAS' && (r.width < 40 || r.height < 40) };
      });
      let tiny = 0;
      for (const el of document.querySelectorAll('p,span,a,li,button,label,small,td'))
        if (visible(el) && el.innerText?.trim() && parseFloat(getComputedStyle(el).fontSize) < 12) tiny++;
      return { title: document.title, headings: [...document.querySelectorAll('h1,h2')].filter(visible).map(h => h.innerText.trim().slice(0, 60)).slice(0, 4),
        text: (document.body?.innerText || '').trim().slice(0, 600), taps,
        horizontalScroll: document.documentElement.scrollWidth > vw + 2, smallTapTargets: taps.filter(t => t.small).length, tinyText: tiny };
    })()`)
    .catch(() => ({ title: '?', headings: [], text: '', taps: [], smallTapTargets: 0, tinyText: 0 }));
}

// What a player would notice changing: the address, the visible text, the canvas pixels, open dialogs.
async function signature(page) {
  return page
    .eval(`(() => {
      let h = 0; const add = s => { for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; };
      add(location.href); add(document.body?.innerText || '');
      for (const c of document.querySelectorAll('canvas')) { try { add(c.toDataURL('image/png', 0.1).slice(-2000)); } catch { add('tainted'); } }
      add(String(document.querySelectorAll('[open],dialog[open],[aria-expanded=true],.active,.selected,[aria-selected=true]').length));
      return String(h);
    })()`, 5000)
    .catch(() => String(Math.random()));
}

async function shot(page, vp, name) {
  const ext = scale < 1 ? 'jpg' : 'png';
  const file = join(outDir, `${vp}-${name}.${ext}`);
  writeFileSync(file, await page.screenshot(scale), 'base64');
  return file;
}

async function doStep(page, s) {
  try {
    if (s.goto) {
      await page.goto(new URL(s.goto, url).toString(), 800);
      return `opened ${s.goto}`;
    }
    if (s.expect !== undefined) {
      const ok = await page.eval(`(document.body?.innerText || '').toLowerCase().includes(${JSON.stringify(String(s.expect).toLowerCase())})`);
      return ok ? `found "${s.expect}"` : `missing "${s.expect}"`;
    }
    if (s.click || s.clickSelector) {
      const pos = await page.eval(`(() => {
        const want = ${JSON.stringify(s.click || '')}.toLowerCase(), sel = ${JSON.stringify(s.clickSelector || '')};
        const els = sel ? [...document.querySelectorAll(sel)] : [...document.querySelectorAll('a,button,[role=button],[role=tab],summary,label,input[type=submit],input[type=button],[onclick]')]
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
    if (s.outline) {
      const o = await look(page);
      return `outline · ${o.headings.join(' / ') || o.title} · text: ${o.text.slice(0, 160).replace(/\s+/g, ' ')} · can tap: ${o.taps.slice(0, 15).map((t) => `"${t.label}"`).join(' ')}`;
    }
    if (s.wait) return `waited ${s.wait}ms`;
    if (s.shot) return `screenshot "${s.shot}"`;
    return 'unknown step';
  } catch (err) {
    return `failed: ${err.message}`;
  }
}

function normalizeBot(b) {
  if (!b) return null;
  if (Array.isArray(b)) return { steps: b };
  return Array.isArray(b.steps) ? b : null;
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
