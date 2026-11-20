# Leonida Trophy Guide — GTA VI · All 55 PS5 Trophies

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/0xrifai/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/0xrifai/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI: every trophy with its official name, description and
grade, a guide in our own words that cites its sources, a checklist saved in
the browser, a roadmap to the Platinum, and the one missable trophy flagged.

## What it does

- **All 55 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden
  until earned; no online trophies) in `app/data/trophies.json`, each with
  its official name, description and grade, a guide, per-trophy counts
  where PlayStation tracks one, and named sources with links.
- **Tracker**: tick trophies off — progress saves in localStorage, survives
  reloads, and can be exported to a file, imported back, or shared as a
  link (`?earned=2,3,5`). Count trophies (250 stunts, 42 shooting-range
  golds, 18 meditation spots…) have their own progress boxes.
- **Filters** by kind (story, missable, collectibles, activities,
  completion, online), by grade, and by free-text search; hide-earned
  toggle.
- **Spoiler setting** (on by default): story trophies show as “hidden until
  earned” — name, description and guide all masked — until you earn them
  or turn the setting off.
- **Roadmap to the Platinum** in 7 stages, in order, with the trophies each
  stage covers and how many of them you have earned. About 200 hours.
- **The one missable trophy is flagged everywhere**: Positive Mental
  Attitude — the Chapter 1 balcony meditation disappears after Chapter 1,
  and there is no mission replay.

## Run it

Static files, no build step, no network:

```sh
# serve app/ and open it
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Where the facts come from

The trophy list is the official PlayStation list as carried by Exophase
and PSNProfiles, cross-checked against How To Video Game, KeenGamer, GTA
Scoop, GTA Zone and Output Lag — all agree on every name, description and
grade. Counts and methods come from those guides, and every trophy's guide
names its sources beside it. All guide text is written for this page in our
own words: sources are cited, never copied. A few late-launch trophies are
still being confirmed by players; where a trigger is unconfirmed, the guide
says so instead of guessing.

## Notes

- Unofficial fan guide. Not affiliated with, endorsed by or connected to
  Rockstar Games, Take-Two Interactive, Sony or PlayStation. No Rockstar
  logo, artwork, box art or game screenshots are used anywhere.
- Works fully offline: every file the page loads is under `app/`, and it
  makes no network request at run time. Source links open only when the
  reader follows them.
- License: MIT (see `LICENSE`).
