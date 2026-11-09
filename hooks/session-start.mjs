// hype-me SessionStart hook: one status line with the game name.
// Stays silent in folders that are not projects, and never fails the session.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function looksLikeProject(dir) {
  return ['package.json', 'pyproject.toml', 'go.mod', 'Cargo.toml', 'project.godot', 'ProjectSettings', '.git'].some(
    (f) => existsSync(join(dir, f)),
  );
}

function main() {
  const input = readStdin();
  const cwd = input.cwd || process.cwd();
  const profilePath = join(cwd, '.hype-me', 'profile.json');

  if (!existsSync(profilePath)) {
    if (!looksLikeProject(cwd)) return;
    out({ systemMessage: 'hype-me: run /hype-me:setup to make a game profile (about a minute)' });
    return;
  }

  let profile;
  try {
    profile = JSON.parse(readFileSync(profilePath, 'utf8'));
  } catch (err) {
    out({ systemMessage: `hype-me: could not read .hype-me/profile.json (${err.message})` });
    return;
  }

  const name = profile?.game?.name || 'this project';
  const markets = (profile?.game?.markets || []).join(', ');
  out({
    systemMessage: `hype-me · ${name} · /hype-me:help`,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `hype-me has a game profile for ${name} in .hype-me/profile.json` +
        (markets ? ` (markets: ${markets})` : '') +
        '. Use it for promotion, player-acquisition research, mentions and design feedback. ' +
        "Never post, DM, install or spend money without the user's yes.",
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
