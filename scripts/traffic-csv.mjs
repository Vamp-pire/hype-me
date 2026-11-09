#!/usr/bin/env node
// "Where do players come from?" from analytics CSV exports (GA4, Cloudflare, Plausible,
// Search Console, Steam UTM/traffic reports, itch.io, store consoles…).
//
//   node traffic-csv.mjs <file.csv> [--before <older.csv>] [--by <column>] [--metric <column>]
//                        [--from YYYY-MM-DD --to YYYY-MM-DD] [--vs-from … --vs-to …] [--cwd dir] [--json]
//
// Columns are guessed (source/referrer/utm_source/query… and visits/sessions/users/views/clicks…);
// pass --by / --metric to choose. With a date column, --from/--to and --vs-from/--vs-to compare periods
// inside one file; otherwise --before compares two files. Tracking links from .hype-me/links.json
// are matched by utm_source so rows show the place they came from.
import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const file = args._[0];
if (!file) {
  console.log('usage: traffic-csv.mjs <file.csv> [--before older.csv] [--by col] [--metric col] [--from --to --vs-from --vs-to]');
  process.exit(2);
}
const cwd = args.cwd || process.cwd();
const links = readJson(join(cwd, '.hype-me', 'links.json')) || [];
const channelBySource = Object.fromEntries(links.map((l) => [l.source, l.channel]));

const SOURCE_COLS = ['utm_source', 'session source / medium', 'session source', 'first user source', 'source / medium', 'source', 'referrer', 'referer', 'page referrer', 'referring site', 'referring domain', 'traffic source', 'channel', 'top queries', 'query', 'search term', 'country'];
const METRIC_COLS = ['visits', 'sessions', 'total users', 'users', 'active users', 'visitors', 'unique visitors', 'page views', 'pageviews', 'views', 'clicks', 'wishlists', 'wishlist additions', 'downloads', 'installs', 'impressions', 'count'];
const DATE_COLS = ['date', 'day', 'time', 'timestamp'];

const now = load(file);
const cols = pickColumns(now.header);
let current, previous, label;
if (args.from || args['vs-from']) {
  if (cols.date < 0) fail('this file has no date column; use --before with a second file');
  current = aggregate(now.rows, cols, args.from, args.to);
  previous = args['vs-from'] ? aggregate(now.rows, cols, args['vs-from'], args['vs-to']) : null;
  label = `${args.from || 'start'}…${args.to || 'end'}${previous ? ` vs ${args['vs-from']}…${args['vs-to'] || ''}` : ''}`;
} else {
  current = aggregate(now.rows, cols);
  if (args.before) {
    const old = load(args.before);
    previous = aggregate(old.rows, pickColumns(old.header));
  }
  label = args.before ? `${basename(file)} vs ${basename(args.before)}` : basename(file);
}

const total = sum(current);
const prevTotal = previous ? sum(previous) : null;
const rows = Object.entries(current)
  .sort((a, b) => b[1] - a[1])
  .map(([source, value]) => {
    const before = previous ? previous[source] || 0 : null;
    return {
      source,
      place: channelBySource[slugish(source)] || null,
      value,
      share: total ? value / total : 0,
      before,
      change: before === null ? null : before === 0 ? null : (value - before) / before,
      isNew: previous ? !(source in previous) : false,
    };
  });
const dropped = previous
  ? Object.entries(previous)
      .filter(([s]) => !(s in current))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  : [];

if (args.json) {
  console.log(JSON.stringify({ label, by: now.header[cols.source], metric: now.header[cols.metric], total, prevTotal, rows, dropped }, null, 2));
} else {
  console.log(`${now.header[cols.metric]} by ${now.header[cols.source]} · ${label}`);
  console.log(`total ${fmt(total)}${prevTotal !== null ? ` (${pct((total - prevTotal) / (prevTotal || 1))} vs ${fmt(prevTotal)})` : ''}`);
  console.log('');
  console.log(`| source | ${now.header[cols.metric]} | share |${previous ? ' change |' : ''}`);
  console.log(`|---|---|---|${previous ? '---|' : ''}`);
  for (const r of rows.slice(0, Number(args.top || 15))) {
    const name = r.place ? `${r.source} (${r.place})` : r.source;
    const change = previous ? ` ${r.isNew ? 'new' : r.change === null ? '–' : pct(r.change)} |` : '';
    console.log(`| ${name} | ${fmt(r.value)} | ${pct(r.share, false)} |${change}`);
  }
  if (rows.length > Number(args.top || 15)) console.log(`(+${rows.length - Number(args.top || 15)} more sources)`);
  if (dropped.length) console.log(`\ngone this period: ${dropped.map(([s, v]) => `${s} (${fmt(v)} before)`).join(', ')}`);
}

// ---------- helpers ----------
function load(path) {
  if (!existsSync(path)) fail(`file not found: ${path}`);
  let text = readFileSync(path);
  // UTF-16 exports (some consoles) → decode; strip BOM.
  let s = text[0] === 0xff && text[1] === 0xfe ? text.toString('utf16le') : text.toString('utf8');
  s = s.replace(/^﻿/, '');
  const lines = s.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const delim = [',', '\t', ';'].sort((a, b) => count(lines[0], b) - count(lines[0], a))[0];
  const parsed = lines.map((l) => splitCsv(l, delim));
  const header = parsed[0].map((h) => h.trim());
  return { header, rows: parsed.slice(1).filter((r) => r.length >= 2) };
}

function pickColumns(header) {
  const lower = header.map((h) => h.toLowerCase());
  const find = (wanted, forced) => {
    if (forced) {
      const i = lower.indexOf(String(forced).toLowerCase());
      if (i < 0) fail(`column "${forced}" not found; columns: ${header.join(', ')}`);
      return i;
    }
    for (const w of wanted) {
      const i = lower.indexOf(w);
      if (i >= 0) return i;
    }
    for (const w of wanted) {
      const i = lower.findIndex((h) => h.includes(w));
      if (i >= 0) return i;
    }
    return -1;
  };
  const source = find(SOURCE_COLS, args.by);
  const metric = find(METRIC_COLS, args.metric);
  if (source < 0 || metric < 0) fail(`could not tell which columns to use; pass --by and --metric. Columns: ${header.join(', ')}`);
  return { source, metric, date: find(DATE_COLS) };
}

function aggregate(rows, cols, from, to) {
  const out = {};
  for (const r of rows) {
    if ((from || to) && cols.date >= 0) {
      const d = normDate(r[cols.date]);
      if (!d || (from && d < from) || (to && d > to)) continue;
    }
    const key = (r[cols.source] || '(none)').trim() || '(none)';
    const v = num(r[cols.metric]);
    if (Number.isFinite(v)) out[key] = (out[key] || 0) + v;
  }
  return out;
}

function normDate(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (/^\d{8}$/.test(t)) return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`; // GA4 20261109
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function num(s) {
  if (s === undefined) return NaN;
  const t = String(s).replace(/[\s,]/g, '').replace(/%$/, '');
  return t === '' ? NaN : Number(t);
}

function splitCsv(line, delim) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function slugish(s) {
  return String(s).toLowerCase().split(/\s*\/\s*/)[0].trim();
}
function count(s, ch) {
  return (s.match(new RegExp(`\\${ch}`, 'g')) || []).length;
}
function sum(o) {
  return Object.values(o).reduce((a, b) => a + b, 0);
}
function fmt(n) {
  return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(1);
}
function pct(x, signed = true) {
  const v = Math.round(x * 1000) / 10;
  return `${signed && v > 0 ? '+' : ''}${v}%`;
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
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      out[a.slice(2)] = next;
      i++;
    } else out[a.slice(2)] = true;
  }
  return out;
}
