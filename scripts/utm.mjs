#!/usr/bin/env node
// Tracking links (UTM) for promotions, kept in .hype-me/links.json so results can be matched later.
//
//   node utm.mjs add --channel "r/chessvariants" --campaign launch-2026-11 [--url https://…] [--content gif1] [--cwd dir]
//   node utm.mjs list [--cwd dir]
//
// --url defaults to the profile's main link (links.site).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
const cwd = args.cwd || process.cwd();
const dir = join(cwd, '.hype-me');
const linksPath = join(dir, 'links.json');
const profilePath = join(dir, 'profile.json');

const links = existsSync(linksPath) ? JSON.parse(readFileSync(linksPath, 'utf8')) : [];

if (cmd === 'add') {
  const profile = existsSync(profilePath) ? JSON.parse(readFileSync(profilePath, 'utf8')) : {};
  const base = args.url || profile.links?.site;
  if (!base || !args.channel || !args.campaign) {
    console.log('need --channel and --campaign (and --url if the profile has no main link)');
    process.exitCode = 2;
  } else {
    const source = slug(args.channel);
    const medium = args.medium || guessMedium(args.channel);
    const campaign = slug(args.campaign);
    const u = new URL(base);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', campaign);
    if (args.content) u.searchParams.set('utm_content', slug(args.content));
    const entry = {
      id: `${campaign}:${source}${args.content ? `:${slug(args.content)}` : ''}`,
      channel: args.channel,
      source,
      medium,
      campaign,
      content: args.content ? slug(args.content) : null,
      url: u.toString(),
      created: new Date().toISOString().slice(0, 10),
    };
    const i = links.findIndex((l) => l.id === entry.id);
    if (i >= 0) links[i] = { ...links[i], ...entry };
    else links.push(entry);
    mkdirSync(dir, { recursive: true });
    writeFileSync(linksPath, JSON.stringify(links, null, 2) + '\n');
    console.log(entry.url);
  }
} else if (cmd === 'list') {
  if (!links.length) console.log('no tracking links yet');
  for (const l of links) console.log(`${l.created}\t${l.campaign}\t${l.channel}\t${l.url}`);
} else {
  console.log('usage: utm.mjs add --channel <where> --campaign <name> [--url] [--content] | list');
  process.exitCode = 2;
}

// Steam ignores utm_* on store links; it uses its own ?utm_source= reporting only for links you
// register in Steamworks UTM analytics — the parameters still work, results show there.

function guessMedium(channel) {
  const c = channel.toLowerCase();
  if (/^r\/|reddit|discord|forum|cafe|gallery|갤|카페|lichess|chess\.com/.test(c)) return 'community';
  if (/youtube|twitch|streamer|tiktok|shorts|creator/.test(c)) return 'video';
  if (/twitter|x\.com|^x$|instagram|threads|bluesky|facebook/.test(c)) return 'social';
  if (/press|news|curator|blog|newsletter|naver/.test(c)) return 'press';
  if (/mail|email/.test(c)) return 'email';
  return 'referral';
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/^r\//, 'reddit-')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      out[argv[i].slice(2)] = next;
      i++;
    } else out[argv[i].slice(2)] = true;
  }
  return out;
}
