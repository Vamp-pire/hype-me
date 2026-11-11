// hype-me SessionStart hook: one status line with the game name, only in projects
// that have a hype-me game profile. Silent everywhere else; never fails the session.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function main() {
  const input = readStdin();
  const cwd = input.cwd || process.cwd();
  const profilePath = join(cwd, '.hype-me', 'profile.json');

  // No profile: this is not a project the user set up for hype-me. Say nothing.
  if (!existsSync(profilePath)) return;

  let profile;
  try {
    profile = JSON.parse(readFileSync(profilePath, 'utf8'));
  } catch (err) {
    out({ systemMessage: `hype-me: could not read .hype-me/profile.json (${err.message})` });
    return;
  }

  const name = profile?.game?.name || 'this project';
  const markets = (profile?.game?.markets || []).join(', ');
  // First two weeks with hype-me: invite feedback often.
  const created = Date.parse(profile?.created || '');
  const early = Number.isFinite(created) ? Date.now() - created < 14 * 864e5 : false;
  out({
    systemMessage: `hype-me · ${name} · /hype-me:help${early ? ' · feedback: /hype-me:feedback' : ''}`,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `hype-me has a game profile for ${name} in .hype-me/profile.json` +
        (markets ? ` (markets: ${markets})` : '') +
        '. Use it for promotion, player-acquisition research, mentions and design feedback. ' +
        "Never post, DM, install or spend money without the user's yes." +
        (early
          ? ' This user is in their first two weeks with hype-me: after each hype-me task, end with one friendly line inviting feedback via /hype-me:feedback (what was confusing, what helped).'
          : ''),
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
