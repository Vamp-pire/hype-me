#!/usr/bin/env node
// Sends a hype-me update to a webhook: a card on Discord (embed), blocks on Slack,
// plain JSON elsewhere. The webhook URL is read by NAME (notify.urlEnv) from the
// environment, the profile's data.envFile, or ~/.claude/hype-me/.env — never printed.
//
//   node notify.mjs --file report.json [--cwd dir] [--dry-run]
//   node notify.mjs --message "short text"  [--cwd dir] [--dry-run]
//
// Template (report.json):
// {
//   "title": "Stylish · Nov 2–9",            "status": "good" | "warn" | "bad" | "info",
//   "summary": "one or two lines",
//   "sections": [["Traffic", ["visits 2,300 (+334%)", "top: google 1,070"]], ["This week", ["…"]]],
//   "links": [["Full report", "https://…"]],  "footer": "hype-me report"
// }
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ICON = { good: '✅', warn: '⚠️', bad: '❌', info: '📣' };
const COLOR = { good: 0x2e9e5b, warn: 0xe0a100, bad: 0xd64545, info: 0x2c3868 }; // info = hype-me navy

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const profile = readJson(join(cwd, '.hype-me', 'profile.json')) || {};
const notify = profile.notify || {};

let card;
if (args.file) {
  card = readJson(args.file);
  if (!card) fail(`could not read ${args.file} as JSON`, 2);
} else if (typeof args.message === 'string' && args.message.trim()) {
  card = { summary: args.message.trim() };
} else fail('Nothing to send: pass --file <report.json> or --message "…"', 2);

const type = notify.type || (args['dry-run'] ? 'discord' : null);
if (!type) fail('Notifications are not set up (notify.type in .hype-me/profile.json).', 2);
const body = type === 'discord' ? discord(card) : type === 'slack' ? slack(card) : plain(card);

if (args['dry-run']) {
  console.log(`[preview] ${type}:`);
  console.log(JSON.stringify(body, null, 2));
} else {
  const name = notify.urlEnv || 'HYPE_ME_WEBHOOK_URL';
  const hook = secret(name);
  if (!hook) fail(`${name} is not set, so nothing was sent.`, 2);
  try {
    const res = await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) console.log(`sent (${type}, HTTP ${res.status})`);
    else {
      console.log(`not sent: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.log(`not sent: ${err.message}`);
    process.exitCode = 1;
  }
}

// ---------- formats ----------
function discord(c) {
  const status = ICON[c.status] ? c.status : 'info';
  // Discord limits: title 256, description 4096, 25 fields, field name 256 / value 1024, 6000 total.
  const embed = {
    title: cut(`${ICON[status]} ${c.title || 'hype-me'}`, 256),
    color: COLOR[status],
  };
  if (c.summary) embed.description = cut(c.summary, 1500);
  const fields = (c.sections || []).slice(0, 10).map(([name, items]) => ({
    name: cut(String(name), 256),
    value: cut((Array.isArray(items) ? items : [items]).map((x) => `• ${x}`).join('\n') || '—', 1000),
  }));
  if (c.links?.length) fields.push({ name: 'Links', value: cut(c.links.map(([l, u]) => `[${l}](${u})`).join(' · '), 1000) });
  if (fields.length) embed.fields = fields;
  embed.footer = { text: cut(c.footer || 'hype-me', 200) };
  embed.timestamp = new Date().toISOString();
  // Keep the whole card under Discord's 6000-character total.
  while (JSON.stringify(embed).length > 5800 && embed.fields?.length) embed.fields.pop();
  return { embeds: [embed], allowed_mentions: { parse: [] } };
}

function slack(c) {
  const status = ICON[c.status] ? c.status : 'info';
  const blocks = [{ type: 'header', text: { type: 'plain_text', text: cut(`${ICON[status]} ${c.title || 'hype-me'}`, 150) } }];
  if (c.summary) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: cut(c.summary, 2900) } });
  for (const [name, items] of (c.sections || []).slice(0, 10)) {
    const lines = (Array.isArray(items) ? items : [items]).map((x) => `• ${x}`).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: cut(`*${name}*\n${lines}`, 2900) } });
  }
  if (c.links?.length) blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: cut(c.links.map(([l, u]) => `<${u}|${l}>`).join(' · '), 2900) }] });
  return { text: cut(`${c.title || 'hype-me'}: ${c.summary || ''}`, 300), blocks };
}

function plain(c) {
  const lines = [c.title, c.summary, ...(c.sections || []).flatMap(([n, items]) => [`${n}:`, ...(Array.isArray(items) ? items : [items]).map((x) => `- ${x}`)])].filter(Boolean);
  return { source: 'hype-me', status: c.status || 'info', title: c.title || null, text: cut(lines.join('\n'), 4000), links: c.links || [] };
}

// ---------- helpers ----------
function cut(s, n) {
  const t = String(s ?? '');
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}
function secret(name) {
  if (process.env[name]) return process.env[name];
  for (const f of [profile.data?.envFile, join(homedir(), '.claude', 'hype-me', '.env')].filter(Boolean)) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, '');
    }
  }
  return null;
}
function readJson(p) {
  try {
    return p && existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  } catch {
    return null;
  }
}
function fail(msg, code) {
  console.log(msg);
  process.exit(code);
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
