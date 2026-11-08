// fullship SessionStart hook: shows one status line and tells Claude the current mode.
// Stays silent in folders that are not projects, and never fails the session.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MODES = new Set(['manual', 'auto', 'heavy-only']);

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

  const mode = MODES.has(config.mode) ? config.mode : 'manual';
  const modules = Array.isArray(config.modules) && config.modules.length ? config.modules : ['core'];

  out({
    systemMessage: `fullship · ${mode} · /fullship:help`,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `fullship is set up in this project (.fullship/config.json). Work mode: ${mode}. ` +
        `Enabled modules: ${modules.join(', ')}. ` +
        (mode === 'manual'
          ? 'Do not start fullship skills on your own; wait for /fullship:* commands or an explicit request.'
          : mode === 'heavy-only'
            ? 'Light fullship checks may run on their own; ask before heavy ones (checks with "heavy": true).'
            : 'fullship skills may step in on their own when they clearly apply.'),
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
