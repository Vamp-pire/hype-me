#!/usr/bin/env node
// Runs the checks in .fullship/config.json, saves each log as evidence,
// and prints a short pass/fail table. Exit code 1 if any check failed.
//
// Usage: node run-checks.mjs [--cwd <dir>] [--all] [--only id,id] [--skip id,id]
//   --all   also run checks marked "heavy": true (skipped by default)
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const cwd = args.cwd || process.cwd();
const configPath = join(cwd, '.fullship', 'config.json');

if (!existsSync(configPath)) {
  console.log('No .fullship/config.json here. Run /fullship:setup first.');
  process.exit(2);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const checks = Array.isArray(config.checks) ? config.checks : [];
const only = list(args.only);
const skip = list(args.skip);

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const evidenceDir = join(cwd, '.fullship', 'evidence', stamp);
mkdirSync(evidenceDir, { recursive: true });

const results = [];
for (const check of checks) {
  const id = String(check.id || check.name || `check${results.length + 1}`);
  const base = { id, name: check.name || id, run: check.run || '' };

  if (only.length && !only.includes(id)) continue;
  if (skip.includes(id)) {
    results.push({ ...base, status: 'not run', reason: 'skipped on request' });
    continue;
  }
  if (check.heavy && !args.all && !only.includes(id)) {
    results.push({ ...base, status: 'not run', reason: 'heavy (use --all)' });
    continue;
  }
  if (!check.run || String(check.run).startsWith('skill:')) {
    results.push({ ...base, status: 'not run', reason: check.run ? `needs ${check.run}` : 'no command' });
    continue;
  }

  const started = Date.now();
  const { code, output, timedOut } = await runCommand(check.run, cwd, (check.timeoutSec || 900) * 1000);
  const seconds = Math.round((Date.now() - started) / 1000);
  const logFile = join(evidenceDir, `${safe(id)}.log`);
  writeFileSync(logFile, `$ ${check.run}\n(exit ${code}${timedOut ? ', timed out' : ''}, ${seconds}s)\n\n${output}`);

  const passed = !timedOut && passes(check.pass, code, output);
  results.push({
    ...base,
    status: passed ? 'passed' : 'failed',
    exitCode: code,
    seconds,
    timedOut,
    log: logFile,
    tail: passed ? undefined : tail(output, 30),
  });
}

const count = (s) => results.filter((r) => r.status === s).length;
const summary = {
  at: new Date().toISOString(),
  passed: count('passed'),
  failed: count('failed'),
  notRun: count('not run'),
  results,
};
writeFileSync(join(evidenceDir, 'summary.json'), JSON.stringify(summary, null, 2));

console.log(`passed ${summary.passed} · failed ${summary.failed} · not run ${summary.notRun}`);
console.log('');
console.log('| check | result | detail |');
console.log('|---|---|---|');
for (const r of results) {
  const detail =
    r.status === 'not run' ? r.reason : `exit ${r.exitCode}${r.timedOut ? ' (timed out)' : ''}, ${r.seconds}s`;
  console.log(`| ${r.name} | ${r.status} | ${detail} |`);
}
console.log('');
console.log(`evidence: ${evidenceDir}`);
for (const r of results.filter((x) => x.status === 'failed')) {
  console.log(`\n--- ${r.name}: last lines (${r.run}) ---\n${r.tail}`);
}
process.exitCode = summary.failed ? 1 : 0;

// ---------- helpers ----------
function runCommand(command, dir, timeoutMs) {
  return new Promise((resolve) => {
    let output = '';
    let timedOut = false;
    const child = spawn(command, { cwd: dir, shell: true, env: { ...process.env, CI: '1', FORCE_COLOR: '0' } });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', (err) => (output += `\n${err.message}`));
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? -1, output, timedOut });
    });
  });
}

// pass: "exit0" (default) | "contains:<text>" | "regex:<pattern>"
function passes(rule, code, output) {
  if (!rule || rule === 'exit0') return code === 0;
  if (rule.startsWith('contains:')) return code === 0 && output.includes(rule.slice(9));
  if (rule.startsWith('regex:')) return code === 0 && new RegExp(rule.slice(6), 'm').test(output);
  return code === 0;
}

function tail(text, n) {
  return text.trimEnd().split(/\r?\n/).slice(-n).join('\n');
}

function safe(s) {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function list(v) {
  return v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [];
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = next;
      i++;
    } else out[key] = true;
  }
  return out;
}
