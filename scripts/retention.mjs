#!/usr/bin/env node
// Retention, activation, funnels and "aha moment" candidates from an event export
// (one row per event: who, when, what). No dependencies, no AI.
//
//   node retention.mjs <events.csv|.json> [--user col] [--time col] [--event col]
//        [--aha <event>] [--funnel ev1,ev2,ev3] [--discover] [--weeks 8] [--json]
//
// Columns are guessed (user_id / user_pseudo_id / distinct_id …, timestamp / event_timestamp /
// date …, event / event_name …). GA4 microsecond timestamps and YYYYMMDD dates are understood.
// Day N = calendar days after a person's first day (UTC). Small groups (< 30 people) are flagged.
import { readFileSync, existsSync } from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const file = args._[0];
if (!file || !existsSync(file)) fail(`usage: retention.mjs <events.csv|.json> [--aha event] [--funnel a,b,c] [--discover]${file ? `\nfile not found: ${file}` : ''}`);

const rows = load(file);
if (!rows.length) fail('no rows');
const cols = Object.keys(rows[0]);
const pick = (forced, wanted) => {
  if (forced) {
    if (!cols.includes(forced)) fail(`column "${forced}" not found; columns: ${cols.join(', ')}`);
    return forced;
  }
  const lower = cols.map((c) => c.toLowerCase());
  for (const w of wanted) {
    const i = lower.indexOf(w);
    if (i >= 0) return cols[i];
  }
  for (const w of wanted) {
    const i = lower.findIndex((c) => c.includes(w));
    if (i >= 0) return cols[i];
  }
  fail(`could not tell which column is ${wanted[0]}; pass it. Columns: ${cols.join(', ')}`);
};
const U = pick(args.user, ['user_id', 'user_pseudo_id', 'distinct_id', 'anonymous_id', 'anon_id', 'uid', 'player_id', 'client_id', 'user']);
const T = pick(args.time, ['event_timestamp', 'timestamp', 'created_at', 'time', 'event_date', 'date']);
const E = pick(args.event, ['event_name', 'event', 'name', 'type', 'action']);

// person → { first: day, days: Set(day), events: Map(event → Set(dayOffset)), day0Counts: Map(event → n) }
const people = new Map();
for (const r of rows) {
  const id = String(r[U] ?? '').trim();
  const day = toDay(r[T]);
  if (!id || day === null) continue;
  if (!people.has(id)) people.set(id, { first: day, events: [] });
  const p = people.get(id);
  if (day < p.first) p.first = day;
  p.events.push({ day, ev: String(r[E] ?? '').trim() });
}
for (const p of people.values()) {
  p.days = new Set(p.events.map((e) => e.day - p.first));
  p.day0 = new Map();
  for (const e of p.events) if (e.day === p.first) p.day0.set(e.ev, (p.day0.get(e.ev) || 0) + 1);
  p.ever = new Set(p.events.map((e) => e.ev));
}
const lastDay = Math.max(...[...people.values()].flatMap((p) => p.events.map((e) => e.day)));
const all = [...people.values()];
const out = { people: all.length, columns: { user: U, time: T, event: E }, lastDate: fromDay(lastDay) };

// Retention: share of people active on day N, among people old enough to have reached day N.
const rate = (group, n, any = false) => {
  const eligible = group.filter((p) => p.first + n <= lastDay);
  if (!eligible.length) return null;
  const hit = eligible.filter((p) => (any ? [...p.days].some((d) => d >= 1 && d <= n) : p.days.has(n))).length;
  return { pct: Math.round((hit / eligible.length) * 1000) / 10, n: eligible.length };
};
out.overall = { d1: rate(all, 1), d7: rate(all, 7), d30: rate(all, 30), returnedWithin7: rate(all, 7, true) };

// Weekly cohorts (by first day's ISO week start).
const weeks = Number(args.weeks || 8);
const byWeek = new Map();
for (const p of all) {
  const wk = p.first - ((p.first + 3) % 7); // Monday-based week start
  if (!byWeek.has(wk)) byWeek.set(wk, []);
  byWeek.get(wk).push(p);
}
out.cohorts = [...byWeek.entries()]
  .sort((a, b) => a[0] - b[0])
  .slice(-weeks)
  .map(([wk, g]) => {
    const cell = (n) => {
      const r = rate(g, n);
      return r ? (r.n < 30 ? `${r.pct}%*` : `${r.pct}%`) : null;
    };
    return { week: fromDay(wk), people: g.length, d1: cell(1), d7: cell(7), d30: cell(30) };
  });

// Activation: did the aha event on day 0?
if (args.aha) {
  const did = all.filter((p) => p.day0.has(args.aha));
  const not = all.filter((p) => !p.day0.has(args.aha));
  out.activation = {
    event: args.aha,
    pct: Math.round((did.length / all.length) * 1000) / 10,
    retainedIfDid: rate(did, 7, true),
    retainedIfNot: rate(not, 7, true),
  };
}

// Funnel: people who did each step (in order of first occurrence), any time.
if (args.funnel) {
  const steps = String(args.funnel).split(',').map((s) => s.trim());
  let group = all;
  out.funnel = steps.map((step, i) => {
    group = group.filter((p) => {
      if (!p.ever.has(step)) return false;
      if (i === 0) return true;
      const prev = Math.min(...p.events.filter((e) => e.ev === steps[i - 1]).map((e) => e.day));
      return p.events.some((e) => e.ev === step && e.day >= prev);
    });
    return { step, people: group.length, pctOfStart: all.length ? Math.round((group.length / all.length) * 1000) / 10 : 0 };
  });
}

// Aha discovery: day-0 behaviours whose doers return more often (correlation, not cause).
if (args.discover) {
  const events = [...new Set(all.flatMap((p) => [...p.day0.keys()]))];
  const base = rate(all, 7, true);
  const cand = [];
  for (const ev of events)
    for (const k of [1, 2, 3, 5]) {
      const did = all.filter((p) => (p.day0.get(ev) || 0) >= k);
      if (did.length < 10 || did.length > all.length * 0.95) continue;
      const r = rate(did, 7, true);
      if (r && base) cand.push({ behaviour: `${ev} ×${k}+ on day 0`, people: did.length, returnedWithin7: r.pct, vsEveryone: base.pct, lift: Math.round((r.pct / Math.max(base.pct, 0.1)) * 10) / 10 });
    }
  out.ahaCandidates = cand.sort((a, b) => b.lift - a.lift || b.people - a.people).slice(0, 8);
}

if (args.json) console.log(JSON.stringify(out, null, 2));
else print(out);

function print(o) {
  const f = (r) => (r ? `${r.pct}%${r.n < 30 ? ` (n=${r.n}, small)` : ` (n=${r.n})`}` : '–');
  console.log(`${o.people} people · events until ${o.lastDate} · columns: ${o.columns.user} / ${o.columns.time} / ${o.columns.event}`);
  console.log(`retention: day 1 ${f(o.overall.d1)} · day 7 ${f(o.overall.d7)} · day 30 ${f(o.overall.d30)} · came back within 7 days ${f(o.overall.returnedWithin7)}`);
  console.log('\n| first week | people | day 1 | day 7 | day 30 |\n|---|---|---|---|---|');
  for (const c of o.cohorts) console.log(`| ${c.week} | ${c.people} | ${c.d1 ?? '–'} | ${c.d7 ?? '–'} | ${c.d30 ?? '–'} |`);
  if (o.cohorts.some((c) => [c.d1, c.d7, c.d30].some((v) => String(v).endsWith('*')))) console.log('* fewer than 30 people old enough for that day — treat as a hint');
  if (o.activation) {
    const a = o.activation;
    console.log(`\nactivation "${a.event}" on day 0: ${a.pct}% · came back within 7 days: ${f(a.retainedIfDid)} if they did, ${f(a.retainedIfNot)} if not`);
  }
  if (o.funnel) console.log(`\nfunnel: ${o.funnel.map((s) => `${s.step} ${s.people} (${s.pctOfStart}%)`).join(' → ')}`);
  if (o.ahaCandidates) {
    console.log('\naha-moment candidates (correlation only — test with an experiment):');
    for (const c of o.ahaCandidates) console.log(`  ${c.behaviour}: ${c.returnedWithin7}% came back vs ${c.vsEveryone}% overall (×${c.lift}, n=${c.people}${c.people < 30 ? ', small' : ''})`);
  }
}

// ---------- helpers ----------
function toDay(v) {
  if (v === undefined || v === null || v === '') return null;
  let s = String(v).trim();
  let ms;
  if (/^\d{8}$/.test(s)) ms = Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
  else if (/^\d{15,17}$/.test(s)) ms = Number(s) / 1000; // GA4 microseconds
  else if (/^\d{12,14}$/.test(s)) ms = Number(s); // milliseconds
  else if (/^\d{9,11}$/.test(s)) ms = Number(s) * 1000; // seconds
  else ms = Date.parse(s);
  return Number.isFinite(ms) ? Math.floor(ms / 86400000) : null;
}
function fromDay(d) {
  return new Date(d * 86400000).toISOString().slice(0, 10);
}
function load(path) {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  if (path.toLowerCase().endsWith('.json')) {
    const j = JSON.parse(text);
    return Array.isArray(j) ? j : j.rows || j.events || [];
  }
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const delim = [',', '\t', ';'].sort((a, b) => lines[0].split(b).length - lines[0].split(a).length)[0];
  const head = split(lines[0], delim).map((h) => h.trim());
  return lines.slice(1).map((l) => Object.fromEntries(split(l, delim).map((v, i) => [head[i], v])));
}
function split(line, d) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
    } else if (c === '"') q = true;
    else if (c === d) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out;
}
function fail(m) {
  console.log(m);
  process.exit(2);
}
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) { out[a.slice(2)] = next; i++; } else out[a.slice(2)] = true;
  }
  return out;
}
