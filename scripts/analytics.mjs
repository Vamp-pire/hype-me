#!/usr/bin/env node
// "Where do players come from?" straight from analytics tools — no CSV export needed.
//
//   node analytics.mjs cloudflare     [--days 7]  [--cwd dir] [--json]   visits by referrer (+ top pages)
//   node analytics.mjs search-console [--days 28] [--cwd dir] [--json]   Google search clicks by query (+ pages)
//   node analytics.mjs ga4            [--days 28] [--cwd dir] [--json]   sessions by source / medium and campaign
//   node analytics.mjs cloudflare --list-sites                           find your siteTag
//   node analytics.mjs clarity        [--days 3]  [--cwd dir] [--json]   rage/dead clicks, quick backs, script errors by page
//   node analytics.mjs itch                       [--cwd dir] [--json]   views, downloads, purchases per game vs the last check
//   node analytics.mjs status                                            what is connected (names only)
//
// Each compares the last N days with the N days before.
// IDs (not secret) come from .hype-me/profile.json → data.cloudflare {accountId, siteTag},
// data.searchConsole {property}, data.ga4 {propertyId}. If missing, an existing site-report config
// for the same host (~/.claude/site-report/sites/<host>.json) is used.
// Secrets are read by NAME, never printed: environment variable first, then the env file in
// profile data.envFile, then ~/.claude/hype-me/.env.
//   CLOUDFLARE_API_TOKEN                       (Account → Account Analytics → Read)
//   GOOGLE_SERVICE_ACCOUNT_JSON (or GSC_SERVICE_ACCOUNT_JSON) = path to a service-account key file
import { readFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

let envCache = null; // secrets read from env files, by name
const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (k) => argv.includes(`--${k}`);
const cwd = opt('cwd', process.cwd());
const profile = readJson(join(cwd, '.hype-me', 'profile.json')) || {};
const data = profile.data || {};
const host = (() => {
  try {
    return new URL(profile.links?.site).host;
  } catch {
    return null;
  }
})();
const siteReport = host ? readJson(join(homedir(), '.claude', 'site-report', 'sites', `${host}.json`)) : null;

const keyName = (k, d) => data.keys?.[k] || d;
const ids = {
  cloudflare: data.cloudflare?.accountId ? data.cloudflare : siteReport?.cloudflare,
  searchConsole: data.searchConsole?.property ? data.searchConsole : siteReport?.searchConsole,
  ga4: data.ga4?.propertyId ? data.ga4 : siteReport?.ga4,
};
const usedSiteReport = (k) => !data[k] && siteReport?.[k] ? ' (IDs from site-report settings)' : '';

try {
  if (cmd === 'cloudflare') await cloudflare();
  else if (cmd === 'search-console') await searchConsole();
  else if (cmd === 'ga4') await ga4();
  else if (cmd === 'clarity') await clarity();
  else if (cmd === 'itch') await itch();
  else if (cmd === 'status') status();
  else {
    console.log('usage: analytics.mjs cloudflare|search-console|ga4|status [--days N] [--cwd dir] [--json] [--list-sites]');
    process.exitCode = 2;
  }
} catch (err) {
  console.log(`not available: ${String(err.message || err).slice(0, 400)}`);
  process.exitCode = 1;
}

// ---------------- Cloudflare Web Analytics ----------------
async function cloudflare() {
  const token = secret(keyName('cloudflare', 'CLOUDFLARE_API_TOKEN'));
  const cf = ids.cloudflare;
  if (!token) return missing(`${keyName('cloudflare', 'CLOUDFLARE_API_TOKEN')} is not set`, 'Cloudflare → My Profile → API Tokens → custom token with Account → Account Analytics → Read; store it as an environment variable or in ~/.claude/hype-me/.env');
  if (!cf?.accountId) return missing('no Cloudflare accountId in the profile (data.cloudflare.accountId)', 'the ID in your dashboard URL: dash.cloudflare.com/<accountId>/…');
  const gql = async (query, variables) => {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(30000),
    });
    const j = await res.json();
    if (j.errors?.length) throw new Error(j.errors.map((e) => e.message).join(' / '));
    return j.data.viewer.accounts[0];
  };
  if (flag('list-sites') || !cf.siteTag) {
    const a = await gql(
      `query($acc: String!, $since: Time!) { viewer { accounts(filter: { accountTag: $acc }) {
        rumPageloadEventsAdaptiveGroups(filter: { datetime_geq: $since }, limit: 50, orderBy: [count_DESC]) { count dimensions { siteTag requestHost } } } } }`,
      { acc: cf.accountId, since: iso(Date.now() - 30 * 86400000) },
    );
    console.log('Web Analytics sites with traffic in the last 30 days (put the right siteTag in data.cloudflare.siteTag):');
    for (const r of a.rumPageloadEventsAdaptiveGroups) console.log(`${r.dimensions.siteTag}\t${r.dimensions.requestHost}\t${r.count} pageviews`);
    return;
  }
  const days = Number(opt('days', 7));
  const Q = `query($acc: String!, $filter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) {
    viewer { accounts(filter: { accountTag: $acc }) {
      total: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 1) { count sum { visits } }
      referers: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 25, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { refererHost } }
      refpages: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 40, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { refererHost refererPath } }
      paths: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 10, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { requestPath } }
      countries: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 8, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { countryName } }
    } } }`;
  const period = async ([s, e]) => {
    const a = await gql(Q, { acc: cf.accountId, filter: { AND: [{ datetime_geq: iso(s), datetime_leq: iso(e) }, { siteTag: cf.siteTag }] } });
    return {
      visits: a.total[0]?.sum.visits ?? 0,
      pageviews: a.total[0]?.count ?? 0,
      by: Object.fromEntries(a.referers.map((r) => [r.dimensions.refererHost || '(direct)', r.sum.visits])),
      paths: a.paths.map((r) => [r.dimensions.requestPath, r.sum.visits]),
      // Referring pages outside the site and search engines: blog posts, videos, threads that sent visitors.
      refpages: a.refpages
        .filter((r) => r.dimensions.refererHost && r.dimensions.refererPath && r.dimensions.refererPath !== '/' && r.dimensions.refererHost !== host && !/(^|\.)(google|bing|search\.naver|duckduckgo|yahoo|baidu|yandex)/.test(r.dimensions.refererHost) && !/googlequicksearchbox/.test(r.dimensions.refererHost))
        .slice(0, 15)
        .map((r) => [`${r.dimensions.refererHost}${r.dimensions.refererPath}`, r.sum.visits]),
      countries: a.countries.map((r) => [r.dimensions.countryName, r.sum.visits]),
    };
  };
  const [cur, prev] = await Promise.all(windows(days).map(period));
  output('cloudflare', `Cloudflare Web Analytics · visits by referrer · last ${days} days vs the ${days} before${usedSiteReport('cloudflare')}`, 'visits', cur.visits, prev.visits, cur.by, prev.by, {
    'top pages': cur.paths,
    'referring pages': cur.refpages,
    countries: cur.countries,
    note: 'Cloudflare does not record utm_ tags; match tracking links with GA4 or the CSV reader.',
  });
}

// ---------------- Google Search Console ----------------
async function searchConsole() {
  const prop = ids.searchConsole?.property;
  if (!prop) return missing('no Search Console property in the profile (data.searchConsole.property)', 'e.g. "https://example.com/" or "sc-domain:example.com"');
  const token = await googleToken('https://www.googleapis.com/auth/webmasters.readonly');
  if (!token) return;
  const days = Number(opt('days', 28));
  // Search data arrives 2–3 days late.
  const end = dayAgo(3), start = dayAgo(2 + days), pEnd = dayAgo(3 + days), pStart = dayAgo(2 + 2 * days);
  const sa = (body) =>
    googleApi(token, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(prop)}/searchAnalytics/query`, body);
  const rows = async (s, e, dim, n) => (await sa({ startDate: s, endDate: e, dimensions: [dim], rowLimit: n })).rows || [];
  const total = async (s, e) => (await sa({ startDate: s, endDate: e })).rows?.[0]?.clicks ?? 0;
  const [cq, pq, cp, ct, pt] = await Promise.all([
    rows(start, end, 'query', 25),
    rows(pStart, pEnd, 'query', 250),
    rows(start, end, 'page', 10),
    total(start, end),
    total(pStart, pEnd),
  ]);
  const by = (r) => Object.fromEntries(r.map((x) => [x.keys[0], x.clicks]));
  output('search-console', `Google Search · clicks by search term · ${start}…${end} vs the ${days} days before${usedSiteReport('searchConsole')}`, 'clicks', ct, pt, by(cq), by(pq), {
    'top pages': cp.map((x) => [x.keys[0], x.clicks]),
  });
}

// ---------------- Google Analytics 4 ----------------
async function ga4() {
  const pid = ids.ga4?.propertyId;
  if (!pid) return missing('no GA4 property ID in the profile (data.ga4.propertyId)', 'GA4 → Admin → Property details → the numeric Property ID; add the service account email as a Viewer in Property access management');
  const token = await googleToken('https://www.googleapis.com/auth/analytics.readonly');
  if (!token) return;
  const days = Number(opt('days', 28));
  const report = (dims, s, e, limit) =>
    googleApi(token, `https://analyticsdata.googleapis.com/v1beta/properties/${pid}:runReport`, {
      dateRanges: [{ startDate: s, endDate: e }],
      dimensions: dims.map((name) => ({ name })),
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });
  const end = dayAgo(1), start = dayAgo(days), pEnd = dayAgo(days + 1), pStart = dayAgo(2 * days);
  const [cs, ps, cc] = await Promise.all([
    report(['sessionSourceMedium'], start, end, 25),
    report(['sessionSourceMedium'], pStart, pEnd, 250),
    report(['sessionCampaignName', 'sessionSource'], start, end, 15),
  ]);
  const by = (r) => Object.fromEntries((r.rows || []).map((x) => [x.dimensionValues.map((d) => d.value).join(' / '), Number(x.metricValues[0].value)]));
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const cur = by(cs), prev = by(ps);
  const links = readJson(join(cwd, '.hype-me', 'links.json')) || [];
  const campaigns = (cc.rows || [])
    .filter((x) => x.dimensionValues[0].value && x.dimensionValues[0].value !== '(not set)' && x.dimensionValues[0].value !== '(direct)')
    .map((x) => {
      const [campaign, source] = x.dimensionValues.map((d) => d.value);
      const link = links.find((l) => l.campaign === campaign && l.source === source);
      return [`${campaign} · ${source}${link ? ` (${link.channel})` : ''}`, Number(x.metricValues[0].value)];
    });
  output('ga4', `Google Analytics 4 · sessions by source / medium · last ${days} days vs the ${days} before${usedSiteReport('ga4')}`, 'sessions', sum(cur), sum(prev), cur, prev, {
    'tracking-link campaigns': campaigns,
  });
}

// ---------------- itch.io (your own games) ----------------
// itch.io's API gives totals only (views, downloads, purchases) — no referrers. Each run is saved
// so the next run shows the change since then.
async function itch() {
  const name = keyName('itch', 'ITCH_API_KEY');
  const key = secret(name);
  if (!key) return missing(`${name} is not set`, 'itch.io → Settings → API keys → Generate new API key; store it as an environment variable or in ~/.claude/hype-me/.env');
  const base = process.env.HYPE_ME_ITCH_API_BASE || 'https://itch.io/api/1';
  const res = await fetch(`${base}/${encodeURIComponent(key)}/my-games`, { signal: AbortSignal.timeout(30000) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.errors) throw new Error(`itch.io: ${(j.errors || [res.status]).join(', ')}`);
  const games = (j.games || []).map((g) => ({
    id: g.id,
    title: g.title,
    url: g.url,
    views: Number(g.views_count || 0),
    downloads: Number(g.downloads_count || 0),
    purchases: Number(g.purchases_count || 0),
    published: g.published_at || null,
  }));
  const histPath = join(cwd, '.hype-me', 'data', 'itch-history.json');
  const hist = readJson(histPath) || [];
  const last = hist[hist.length - 1];
  const prevOf = (id) => last?.games?.find((g) => g.id === id);
  const now = new Date().toISOString();
  if (existsSync(join(cwd, '.hype-me'))) {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    mkdirSync(join(cwd, '.hype-me', 'data'), { recursive: true });
    writeFileSync(histPath, JSON.stringify([...hist.slice(-60), { at: now, games }], null, 2));
  }
  if (flag('json')) return console.log(JSON.stringify({ source: 'itch', at: now, since: last?.at || null, games: games.map((g) => ({ ...g, before: prevOf(g.id) || null })) }, null, 2));
  console.log(`itch.io · ${games.length} game(s)${last ? ` · change since ${last.at.slice(0, 10)}` : ' · first check (saved as the baseline)'}`);
  console.log('\n| game | views | downloads | purchases |\n|---|---|---|---|');
  const d = (now_, before) => (before == null ? '' : ` (${now_ - before >= 0 ? '+' : ''}${now_ - before})`);
  for (const g of games) {
    const p = prevOf(g.id);
    console.log(`| ${g.title} | ${fmt(g.views)}${d(g.views, p?.views)} | ${fmt(g.downloads)}${d(g.downloads, p?.downloads)} | ${fmt(g.purchases)}${d(g.purchases, p?.purchases)} |`);
  }
  console.log('\nitch.io gives totals only; for where visitors came from use its Analytics page (referrers) as CSV with traffic-csv.');
}

// ---------------- Microsoft Clarity (behaviour signals) ----------------
// Data Export API: last 1–3 days only, 10 calls a day per project (this uses 2).
async function clarity() {
  const name = keyName('clarity', 'CLARITY_API_TOKEN');
  const token = secret(name);
  if (!token) return missing(`${name} is not set`, 'Clarity project → Settings → Data Export → generate an API token; store it as an environment variable or in ~/.claude/hype-me/.env');
  const days = Math.min(3, Math.max(1, Number(opt('days', 3))));
  const call = async (dimension) => {
    const q = new URLSearchParams({ numOfDays: String(days), ...(dimension ? { dimension1: dimension } : {}) });
    const res = await fetch(`https://www.clarity.ms/export-data/api/v1/project-live-insights?${q}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    if (res.status === 429) throw new Error('Clarity allows 10 calls a day — try again tomorrow');
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
    return Object.fromEntries((await res.json()).map((m) => [m.metricName, m.information]));
  };
  const [all, byUrl] = [await call(null), await call('URL')];
  const n = (x) => (x == null || x === '' ? null : Number(x));
  const first = (k) => all[k]?.[0] || {};
  const summary = {
    sessions: n(first('Traffic').totalSessionCount),
    users: n(first('Traffic').distinctUserCount),
    scrollDepthPct: n(first('ScrollDepth').averageScrollDepth),
    activeSec: n(first('EngagementTime').activeTime),
    rageClickPct: n(first('RageClickCount').sessionsWithMetricPercentage),
    deadClickPct: n(first('DeadClickCount').sessionsWithMetricPercentage),
    quickBackPct: n(first('QuickbackClick').sessionsWithMetricPercentage),
    excessiveScrollPct: n(first('ExcessiveScroll').sessionsWithMetricPercentage),
    scriptErrorPct: n(first('ScriptErrorCount').sessionsWithMetricPercentage),
  };
  const pages = (k) =>
    (byUrl[k] || [])
      .map((r) => ({ url: r.Url ?? r.URL ?? r.url, pct: n(r.sessionsWithMetricPercentage), count: n(r.subTotal) }))
      .filter((r) => r.url && (r.count || r.pct))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 8);
  const signals = { 'rage clicks': pages('RageClickCount'), 'dead clicks': pages('DeadClickCount'), 'quick backs': pages('QuickbackClick'), 'script errors': pages('ScriptErrorCount') };
  if (flag('json')) return console.log(JSON.stringify({ source: 'clarity', days, summary, pages: signals }, null, 2));
  const pct = (v) => (v == null ? '–' : `${v}%`);
  console.log(`Microsoft Clarity · last ${days} day(s) · ${summary.sessions ?? '?'} sessions, ${summary.users ?? '?'} users`);
  console.log(`scroll depth ${pct(summary.scrollDepthPct)} · active time ${summary.activeSec ?? '?'}s`);
  console.log(`sessions with: rage clicks ${pct(summary.rageClickPct)} · dead clicks ${pct(summary.deadClickPct)} · quick backs ${pct(summary.quickBackPct)} · excessive scroll ${pct(summary.excessiveScrollPct)} · script errors ${pct(summary.scriptErrorPct)}`);
  for (const [k, list] of Object.entries(signals)) if (list.length) console.log(`\n${k} by page: ${list.map((r) => `${r.url.replace(/^https?:\/\/[^/]+/, '') || '/'} ${r.count ?? ''}${r.pct != null ? ` (${r.pct}%)` : ''}`).join(' · ')}`);
}

// ---------------- shared ----------------
function status() {
  const has = (n) => (secret(n) ? 'set' : 'not set');
  console.log(`profile: ${existsSync(join(cwd, '.hype-me', 'profile.json')) ? 'yes' : 'no'} · site: ${host || '—'}${siteReport ? ' · site-report settings found' : ''}`);
  console.log(`cloudflare: ids ${ids.cloudflare?.accountId ? (ids.cloudflare.siteTag ? 'ok' : 'accountId only') : 'missing'} · ${keyName('cloudflare', 'CLOUDFLARE_API_TOKEN')} ${has(keyName('cloudflare', 'CLOUDFLARE_API_TOKEN'))}`);
  const g = googleKeyName();
  console.log(`search-console: property ${ids.searchConsole?.property ? 'ok' : 'missing'} · ${g || 'GOOGLE_SERVICE_ACCOUNT_JSON'} ${g ? 'set' : 'not set'}`);
  console.log(`clarity: ${keyName('clarity', 'CLARITY_API_TOKEN')} ${has(keyName('clarity', 'CLARITY_API_TOKEN'))}`);
  console.log(`itch: ${keyName('itch', 'ITCH_API_KEY')} ${has(keyName('itch', 'ITCH_API_KEY'))}`);
  console.log(`ga4: propertyId ${ids.ga4?.propertyId ? 'ok' : 'missing'} · ${g || 'GOOGLE_SERVICE_ACCOUNT_JSON'} ${g ? 'set' : 'not set'}`);
}

function output(source, title, metric, total, prevTotal, cur, prev, extra) {
  const rows = Object.entries(cur)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ source: k, value: v, before: prev[k] ?? 0, isNew: !(k in prev) }));
  if (flag('json')) {
    console.log(JSON.stringify({ source, title, metric, total, prevTotal, rows, extra }, null, 2));
    return;
  }
  console.log(title);
  console.log(`total ${fmt(total)} ${metric} (${change(total, prevTotal)} vs ${fmt(prevTotal)})`);
  console.log('');
  console.log(`| source | ${metric} | change |`);
  console.log('|---|---|---|');
  for (const r of rows.slice(0, 15)) console.log(`| ${r.source} | ${fmt(r.value)} | ${r.isNew && Object.keys(prev).length ? 'new' : change(r.value, r.before)} |`);
  const gone = Object.entries(prev).filter(([k]) => !(k in cur)).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (gone.length) console.log(`\ngone this period: ${gone.map(([k, v]) => `${k} (${fmt(v)})`).join(', ')}`);
  for (const [name, list] of Object.entries(extra || {})) {
    if (typeof list === 'string') console.log(`\n${list}`);
    else if (list?.length) console.log(`\n${name}: ${list.map(([k, v]) => `${k} ${fmt(v)}`).join(' · ')}`);
  }
}

async function googleToken(scope) {
  const name = googleKeyName();
  const path = name ? secret(name) : null;
  if (path && !existsSync(path)) {
    missing(`${name} is set, but no key file exists at that path`, 'put the service-account JSON key file back at that path, or point the variable to where it is now');
    return null;
  }
  if (!path) {
    missing('no Google service-account key (GOOGLE_SERVICE_ACCOUNT_JSON = path to the JSON key file)', 'Google Cloud → enable the Search Console API / Analytics Data API → create a service account → JSON key; add its email as a user of the Search Console property or GA4 property');
    return null;
  }
  const key = JSON.parse(readFileSync(path, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: key.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error(`Google sign-in failed: ${j.error_description || j.error || res.status}`);
  return j.access_token;
}

function googleKeyName() {
  const preferred = keyName('google', 'GOOGLE_SERVICE_ACCOUNT_JSON');
  if (secret(preferred)) return preferred;
  return secret('GSC_SERVICE_ACCOUNT_JSON') ? 'GSC_SERVICE_ACCOUNT_JSON' : null;
}

async function googleApi(token, url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const j = await res.json();
  if (j.error) throw new Error(`${res.status} ${j.error.message}`);
  return j;
}

function secret(name) {
  if (!name) return null;
  if (process.env[name]) return process.env[name];
  if (envCache === null) {
    envCache = {};
    const files = [data.envFile, join(homedir(), '.claude', 'hype-me', '.env')].filter(Boolean);
    for (const f of files) {
      if (!existsSync(f)) continue;
      for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && !(m[1] in envCache)) envCache[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
  return envCache[name] ?? null;
}

function missing(reason, howTo) {
  console.log(`not connected: ${reason}\nhow: ${howTo}`);
  process.exitCode = 3;
}

function windows(days) {
  const now = Date.now();
  return [
    [now - days * 86400000, now],
    [now - 2 * days * 86400000, now - days * 86400000],
  ];
}
function iso(ms) {
  return new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
}
function dayAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}
function change(a, b) {
  if (!b) return a ? 'new' : '–';
  const v = Math.round(((a - b) / b) * 1000) / 10;
  return `${v > 0 ? '+' : ''}${v}%`;
}
function fmt(n) {
  return Number(n).toLocaleString('en-US');
}
function readJson(p) {
  try {
    return p && existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  } catch {
    return null;
  }
}
