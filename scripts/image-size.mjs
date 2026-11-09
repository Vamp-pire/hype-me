#!/usr/bin/env node
// Width, height, format and file size of local images — no dependencies.
// Optionally checks against an expected size.
//
//   node image-size.mjs <file> [more files] [--expect 920x430]
//
// Reads PNG, JPEG, GIF and WebP headers only.
import { readFileSync, statSync, existsSync } from 'node:fs';
import { basename } from 'node:path';

const argv = process.argv.slice(2);
const ei = argv.indexOf('--expect');
const expect = ei >= 0 ? argv[ei + 1] : null;
const files = ei >= 0 ? argv.filter((_, i) => i !== ei && i !== ei + 1) : argv;
if (!files.length) {
  console.log('usage: image-size.mjs <file> [more] [--expect WxH]');
  process.exitCode = 2;
}
let bad = 0;
for (const f of files) {
  if (!existsSync(f)) {
    console.log(`${basename(f)}\tnot found`);
    bad++;
    continue;
  }
  const buf = readFileSync(f);
  const info = sniff(buf);
  const kb = Math.round(statSync(f).size / 1024);
  if (!info) {
    console.log(`${basename(f)}\tunknown format\t${kb} KB`);
    bad++;
    continue;
  }
  let verdict = '';
  if (expect) {
    const [w, h] = expect.toLowerCase().split('x').map(Number);
    const sameRatio = Math.abs(info.w / info.h - w / h) < 0.01;
    if (info.w === w && info.h === h) verdict = '\tmatches';
    else if (sameRatio && info.w > w) verdict = `\tlarger, same shape (ok if the platform scales it down)`;
    else {
      verdict = `\texpected ${w}×${h}${sameRatio ? ' (same shape, too small)' : ` (shape ${ratio(info.w, info.h)} vs ${ratio(w, h)})`}`;
      bad++;
    }
  }
  console.log(`${basename(f)}\t${info.type}\t${info.w}×${info.h}\t${ratio(info.w, info.h)}\t${kb} KB${verdict}`);
}
process.exitCode = bad ? 1 : 0;

function sniff(b) {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { type: 'png', w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.length > 10 && b.toString('ascii', 0, 3) === 'GIF') return { type: 'gif', w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { type: 'webp', w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { type: 'webp', w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ') return { type: 'webp', w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { type: 'jpeg', h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  return null;
}

function ratio(w, h) {
  const r = w / h;
  const known = [[16 / 9, '16:9'], [9 / 16, '9:16'], [1.91, '1.91:1'], [2, '2:1'], [1, '1:1'], [4 / 3, '4:3'], [1232 / 706, 'main capsule'], [920 / 430, 'header capsule'], [630 / 500, 'itch cover']];
  for (const [v, name] of known) if (Math.abs(r - v) < 0.02) return name;
  return `${r.toFixed(2)}:1`;
}
