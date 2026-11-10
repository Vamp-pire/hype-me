# Effort levels — ranges, not fixed numbers

hype-me's research skills and agents work within a **range** for each level. They start at the low end, go toward the high end only while results keep being useful, and never pass the high end.

## Which level
1. The request: "빠르게", "간단히", "quick" → **light**; "자세히", "깊게", "--deep", "thorough" → **deep**.
2. Otherwise the profile: `.hype-me/profile.json` → `budget` (`light` | `normal` | `deep`), default **normal**.
3. Say the level in one line at the end of the answer (e.g. "normal · 11 lookups"), so the user can ask for more or less.

## Ranges
| what | light | normal | deep |
|---|---|---|---|
| case-researcher web lookups | 5–8 | 10–14 | 18–25 |
| channel-scout web lookups | 4–6 | 7–12 | 14–20 |
| mention-tracker web lookups | 4–6 | 7–10 | 12–16 |
| tool-scout web lookups | 3–4 | 5–8 | 9–12 |
| cases: subjects per run | 1 | 1–2 | 2–3 |
| channels: areas searched | 1–2 | 2 | 3–4 |
| rows in a channel-scout table | 3–5 | 5–10 | 8–15 |
| rows in the channels result | 5–6 | 6–12 | 10–20 |
| rows in /recommend | 3–4 | 4–6 | 6–10 |
| monkey test: browsers × actions each | 2 × 20–40 | 3–4 × 50–80 | 6–8 × 120–200 |
| code-hunter: files read per module | 5–10 | 10–25 | 25–60 |
| code-hunter: suspects reported | 3–5 | 5–10 | 8–15 |
| rule-checker: random cases | 100–300 | 1,000–3,000 | 10,000–30,000 |
| ux: personas · steps each | 1 · 6–10 | 2 · 10–20 | 3 · 20–35 |

## How to move inside a range
- **Start low.** Do the lookups that matter most first (official pages, the best list or rules page).
- **Keep going** only while the last 2–3 lookups added something new and useful (a new place, a dated event, a rule).
- **Stop early** when two lookups in a row add nothing, or the question is answered.
- **Rows:** show fewer when the extra rows would be weak; show more (up to the top of the range) only when they are as strong as the ones above.
- **Never exceed the top.** If more seems worth it, say so in one line and offer the next level.
