#!/usr/bin/env node
// Before promoting: is the page up, does a shared link look good, is visitor tracking in place,
// and do the tracking links work?
//
// Usage: node launch-check.mjs [--cwd <dir>] [--url <page>] [--paths /,/en/] [--wait <seconds>] [--no-links]
// Defaults come from .hype-me/profile.json (links.site, launch.checkPaths)
// and .hype-me/links.json (tracking links made with utm.mjs).
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const hm = join(cwd, '.hype-me');
const profile = readJson(join(hm, 'profile.json')) || {};
const launch = { url: profile.links?.site, ...(profile.launch || {}) };
const trackingLinks = args['no-links'] ? [] : readJson(join(hm, 'links.json')) || [];

const url = (args.url || launch.url || '').replace(/\/+$/, '');
if (!url) {
  console.log('No page URL. Pass --url or add the main link with /hype-me:setup.');
  process.exit(2);
}
const paths = args.paths ? String(args.paths).split(',') : launch.checkPaths || ['/'];
const waitSec = Number(args.wait || 0);
const HEADERS = { 'cache-control': 'no-cache', 'user-agent': 'hype-me-launch-check' };

const deadline = Date.now() + waitSec * 1000;
let report;
for (let attempt = 1; ; attempt++) {
  report = await checkOnce();
  if (report.ok || Date.now() + 15000 > deadline) break;
  console.log(`attempt ${attempt}: not ready yet, retrying in 15s…`);
  await new Promise((r) => setTimeout(r, 15000));
}

const passed = report.rows.filter((r) => r.ok).length;
const warns = report.rows.filter((r) => r.ok === 'warn').length;
console.log(`${report.ok ? 'ready' : 'not ready'} · ${passed - warns}/${report.rows.length} passed${warns ? ` · ${warns} to look at` : ''} · ${url}`);
console.log('');
console.log('| check | result | detail |');
console.log('|---|---|---|');
for (const r of report.rows) console.log(`| ${r.name} | ${r.ok === 'warn' ? 'look at' : r.ok ? 'passed' : 'failed'} | ${r.detail} |`);
if (report.preview) {
  const p = report.preview;
  console.log(`\nshare preview: "${p.title || '(no title)'}" — ${p.description || '(no description)'}\nimage: ${p.image || '(none)'}`);
}

if (existsSync(hm)) {
  mkdirSync(join(hm, 'reports'), { recursive: true });
  writeFileSync(join(hm, 'reports', 'last-launch-check.json'), JSON.stringify({ at: new Date().toISOString(), url, ...report }, null, 2));
}
process.exitCode = report.ok ? 0 : 1;

async function checkOnce() {
  const rows = [];
  let homeHtml = '';
  for (const p of paths) {
    const target = url + (p.startsWith('/') ? p : `/${p}`);
    try {
      const res = await fetch(bust(target), { headers: HEADERS, redirect: 'follow' });
      const body = await res.text();
      if (!homeHtml) homeHtml = body;
      rows.push({ name: `page ${p}`, ok: res.status === 200, detail: `HTTP ${res.status}` });
    } catch (err) {
      rows.push({ name: `page ${p}`, ok: false, detail: err.message });
    }
  }

  // Share preview (what Discord, X, KakaoTalk, Reddit show for a pasted link).
  const meta = readMeta(homeHtml);
  const preview = {
    title: meta['og:title'] || meta['twitter:title'] || meta.title,
    description: meta['og:description'] || meta['twitter:description'] || meta.description,
    image: absolutize(meta['og:image'] || meta['twitter:image'], url),
    card: meta['twitter:card'],
  };
  rows.push({
    name: 'share title & description',
    ok: preview.title && preview.description ? true : 'warn',
    detail: `${preview.title ? 'title ok' : 'no og:title'} · ${preview.description ? 'description ok' : 'no og:description'}`,
  });
  if (preview.image) {
    try {
      const res = await fetch(preview.image, { headers: HEADERS, redirect: 'follow' });
      const type = res.headers.get('content-type') || '';
      const ok = res.status === 200 && type.startsWith('image/');
      rows.push({ name: 'share image', ok, detail: `HTTP ${res.status} ${type}${ok ? ' (aim for 1200×630)' : ''}` });
    } catch (err) {
      rows.push({ name: 'share image', ok: false, detail: err.message });
    }
  } else {
    rows.push({ name: 'share image', ok: 'warn', detail: 'no og:image — shared links will show no picture' });
  }

  // Visitor tracking, so "where do players come from" has data.
  const trackers = [
    [/static\.cloudflareinsights\.com|cloudflareinsights/i, 'Cloudflare Web Analytics'],
    [/googletagmanager\.com\/gtag|gtag\(/i, 'Google Analytics'],
    [/plausible\.io\/js|data-domain=/i, 'Plausible'],
    [/umami/i, 'Umami'],
    [/clarity\.ms/i, 'Microsoft Clarity'],
  ].filter(([re]) => re.test(homeHtml)).map(([, name]) => name);
  rows.push({
    name: 'visitor tracking',
    ok: trackers.length ? true : 'warn',
    detail: trackers.length ? trackers.join(', ') : 'none found in the page (it may be added by the host, e.g. Cloudflare)',
  });

  for (const l of trackingLinks.slice(0, 20)) {
    try {
      const res = await fetch(l.url, { headers: HEADERS, redirect: 'follow' });
      const finalUrl = new URL(res.url);
      const kept = finalUrl.searchParams.get('utm_source') === l.source;
      rows.push({
        name: `link ${l.channel}`,
        ok: res.status === 200 ? (kept ? true : 'warn') : false,
        detail: `HTTP ${res.status}${res.status === 200 && !kept ? ' — tracking tag lost in a redirect' : ''}`,
      });
    } catch (err) {
      rows.push({ name: `link ${l.channel}`, ok: false, detail: err.message });
    }
  }

  return { ok: rows.every((r) => r.ok), rows, preview };
}

function readMeta(html) {
  const out = {};
  const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (t) out.title = decode(t[1].trim());
  for (const m of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const tag = m[0];
    const key = (tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i) || [])[1];
    const val = (tag.match(/content\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (key && val !== undefined && !(key.toLowerCase() in out)) out[key.toLowerCase()] = decode(val.trim());
  }
  return out;
}

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function absolutize(src, base) {
  if (!src) return null;
  try {
    return new URL(src, base + '/').toString();
  } catch {
    return src;
  }
}

function bust(target) {
  return `${target}${target.includes('?') ? '&' : '?'}hype-me=${Date.now()}`;
}

function readJson(path) {
  try {
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
  } catch {
    return null;
  }
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
