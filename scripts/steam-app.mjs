#!/usr/bin/env node
// Public Steam store data for case studies. No key needed.
//
//   node steam-app.mjs search "<name>"        → matching apps (id, name)
//   node steam-app.mjs info <appid>           → release date, genres, price, developers, review totals
//   node steam-app.mjs history <appid>        → reviews per month (helps spot when a game took off)
//
// Uses the store's public endpoints only. Be gentle: one game at a time.
const [cmd, arg] = process.argv.slice(2);
const UA = { 'user-agent': 'hype-me/0.2 (case study helper)' };

try {
  if (cmd === 'search' && arg) await search(arg);
  else if (cmd === 'info' && arg) await info(arg);
  else if (cmd === 'history' && arg) await history(arg);
  else {
    console.log('usage: steam-app.mjs search "<name>" | info <appid> | history <appid>');
    process.exitCode = 2;
  }
} catch (err) {
  console.log(`failed: ${err.message}`);
  process.exitCode = 1;
}

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function search(term) {
  const j = await getJson(
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=en`,
  );
  const items = j.items || [];
  if (!items.length) return console.log('no matches');
  for (const it of items.slice(0, 10)) console.log(`${it.id}\t${it.name}`);
}

async function info(appid) {
  const d = await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`);
  const data = d?.[appid]?.data;
  if (!d?.[appid]?.success || !data) return console.log('not found');
  const out = {
    appid: Number(appid),
    name: data.name,
    released: data.release_date?.date || null,
    comingSoon: data.release_date?.coming_soon || false,
    developers: data.developers || [],
    publishers: data.publishers || [],
    genres: (data.genres || []).map((g) => g.description),
    price: data.is_free ? 'free' : data.price_overview?.final_formatted || null,
    platforms: Object.entries(data.platforms || {}).filter(([, v]) => v).map(([k]) => k),
    // Steam's own count of user reviews ("recommendations"); per-month history: `history <appid>`.
    reviews: data.recommendations?.total ?? null,
    metacritic: data.metacritic?.score ?? null,
    shortDescription: data.short_description || null,
    store: `https://store.steampowered.com/app/${appid}/`,
  };
  console.log(JSON.stringify(out, null, 2));
}

async function history(appid) {
  const j = await getJson(`https://store.steampowered.com/appreviewhistogram/${appid}?l=english`);
  const rows = j?.results?.rollups || [];
  if (!rows.length) return console.log('no review history available');
  const type = j.results.rollup_type || 'month';
  console.log(`reviews per ${type} (positive / negative):`);
  let peak = { total: 0 };
  for (const row of rows) {
    const date = new Date(row.date * 1000).toISOString().slice(0, 10);
    const total = row.recommendations_up + row.recommendations_down;
    if (total > peak.total) peak = { date, total };
    console.log(`${date}\t${row.recommendations_up}\t${row.recommendations_down}`);
  }
  console.log(`peak: ${peak.date} (${peak.total} reviews)`);
}
