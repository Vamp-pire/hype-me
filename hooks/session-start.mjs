// fullship SessionStart hook: shows one status line and tells Claude the current mode.
// Stays silent in folders that are not projects, and never fails the session.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// The mode only decides when to plan before building.
const MODES = {
  'big-only': {
    label: 'planning: big changes only',
    rule:
      'Before building a big change (new screen or feature, several files, server/database or stored-data changes, anything hard to undo), show a short plan (goal, options with a recommendation, files to change, how done is checked) and wait for approval. Small fixes and clear instructions: go ahead.',
  },
  always: {
    label: 'planning: always',
    rule: 'Before any change to code, show a short plan and wait for approval.',
  },
  manual: {
    label: 'planning: when asked',
    rule: 'Do not plan on your own; plan first only when the user asks or runs /fullship:spec.',
  },
};

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function looksLikeProject(dir) {
  return ['package.json', 'pyproject.toml', 'go.mod', 'Cargo.toml', '.git'].some((f) =>
    existsSync(join(dir, f)),
  );
}

function main() {
  const input = readStdin();
  const cwd = input.cwd || process.cwd();
  const configPath = join(cwd, '.fullship', 'config.json');

  if (!existsSync(configPath)) {
    if (!looksLikeProject(cwd)) return;
    out({
      systemMessage: 'fullship: run /fullship:setup to start (about a minute)',
    });
    return;
  }

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (err) {
    out({ systemMessage: `fullship: could not read .fullship/config.json (${err.message})` });
    return;
  }

  const mode = MODES[config.mode] ? config.mode : 'big-only';
  const modules = Array.isArray(config.modules) && config.modules.length ? config.modules : ['core'];

  out({
    systemMessage: `fullship · ${MODES[mode].label} · /fullship:help`,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `fullship is set up in this project (.fullship/config.json). Planning mode: ${mode}. ${MODES[mode].rule} ` +
        `Enabled modules: ${modules.join(', ')}. ` +
        'Run checks, deploy verification and installs only when asked; when a feature is finished you may offer a check in one line.',
    },
  });
}

function out(obj) {
  process.stdout.write(JSON.stringify(obj));
}

try {
  main();
} catch {
  // Never block a session because of this hook.
}
