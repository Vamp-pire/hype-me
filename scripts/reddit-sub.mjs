#!/usr/bin/env node
// Size and self-promotion rules of subreddits, for the channels skill.
//
//   node reddit-sub.mjs chessvariants indiegaming
//
// Reads Reddit's public about/rules pages. Reddit may refuse unauthenticated
// requests (HTTP 403/429); then it says so and the agent falls back to reading
// the subreddit page itself. Never posts anything.
const subs = process.argv.slice(2).map((s) => s.replace(/^\/?r\//, ''));
if (!subs.length) {
  console.log('usage: reddit-sub.mjs <subreddit> [more…]');
  process.exitCode = 2;
}
const UA = { 'user-agent': 'hype-me (community research; read-only)' };

for (const sub of subs) {
  try {
    const about = await getJson(`https://www.reddit.com/r/${sub}/about.json`);
    const d = about.data || {};
    let rules = [];
    try {
      const r = await getJson(`https://www.reddit.com/r/${sub}/about/rules.json`);
      rules = (r.rules || []).map((x) => `${x.short_name}${x.description ? ` — ${oneLine(x.description, 160)}` : ''}`);
    } catch (err) {
      rules = [`(rules not readable: ${err.message})`];
    }
    const promo = rules.filter((x) => /promot|self|advertis|spam|link|own (game|work|content)|10%|ratio/i.test(x));
    console.log(
      JSON.stringify(
        {
          sub: `r/${sub}`,
          url: `https://www.reddit.com/r/${sub}/`,
          subscribers: d.subscribers ?? null,
          activeNow: d.active_user_count ?? d.accounts_active ?? null,
          created: d.created_utc ? new Date(d.created_utc * 1000).toISOString().slice(0, 10) : null,
          nsfw: d.over18 ?? null,
          description: oneLine(d.public_description || '', 200),
          selfPromotionRules: promo,
          allRules: rules,
        },
        null,
        2,
      ),
    );
  } catch (err) {
    console.log(JSON.stringify({ sub: `r/${sub}`, url: `https://www.reddit.com/r/${sub}/`, error: err.message }));
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers: UA, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!type.includes('json')) throw new Error('not JSON (blocked or login page)');
  return res.json();
}

function oneLine(text, max) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
