#!/usr/bin/env node
// Sends a short message to a webhook (Discord, Slack or any JSON webhook).
// The webhook URL is read from an environment variable whose NAME is in the config;
// the value is never printed.
//
// Usage: node notify.mjs [--cwd <dir>] --message "text"
// Config (.hype-me/profile.json):
//   "notify": { "type": "discord" | "slack" | "webhook", "urlEnv": "HYPE_ME_WEBHOOK_URL" }
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const configPath = join(cwd, '.hype-me', 'profile.json');
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
const notify = config.notify || {};

const message = String(args.message || '').trim();
if (!message) {
  console.log('Nothing to send: pass --message "…"');
  process.exit(2);
}
if (!notify.type || !notify.urlEnv) {
  console.log('Notifications are not set up (notify.type and notify.urlEnv in .hype-me/profile.json).');
  process.exit(2);
}
const hook = process.env[notify.urlEnv];
if (!hook) {
  console.log(`Environment variable ${notify.urlEnv} is not set, so nothing was sent.`);
  process.exit(2);
}

const text = message.slice(0, 1900);
const body =
  notify.type === 'discord' ? { content: text } : notify.type === 'slack' ? { text } : { text, source: 'hype-me' };

try {
  const res = await fetch(hook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    console.log(`sent (${notify.type}, HTTP ${res.status})`);
  } else {
    console.log(`not sent: HTTP ${res.status}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.log(`not sent: ${err.message}`);
  process.exitCode = 1;
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
