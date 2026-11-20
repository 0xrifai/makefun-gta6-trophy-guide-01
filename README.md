[![GTA 6 Trophy Guide — make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/0xrifai/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/0xrifai/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

An offline web guide and tracker for all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them
hidden on PlayStation until earned.

Open `app/index.html` in desktop Chrome (or run `node serve.ts` and visit
http://localhost:8080). No network needed: every file it loads lives under
`app/`, and your progress never leaves your browser.

## What it does

- **Every trophy, with its guide.** Each of the 55 trophies shows its official
  PlayStation name, description and grade, plus a guide written for this
  entry in our own words, with its sources named beside it. No guide text is
  copied from another guide; the official names and descriptions are shown
  exactly as PlayStation publishes them.
- **A checklist that remembers.** Tick trophies off as you earn them; progress
  is saved in `localStorage`. Counted trophies (250 stunts, 100 vehicles, 42
  gold Shooting Range medals, …) have steppers so you can track the running
  total. Export your progress to a JSON file and import it back any time.
- **Filters by kind and grade.** Story, missable, collectibles, activities —
  plus a grade picker, a text search and a hide-earned switch.
- **Spoiler setting.** With spoilers hidden, story trophies stay masked
  (name and description replaced) until you mark them earned, so a first
  playthrough is not spoiled by the list itself.
- **Platinum roadmap.** Five stages in order, from the story run to the final
  cleanup sweep, with the counts PlayStation tracks and the order to earn
  them in.
- **One trophy can be missed.** *Positive Mental Attitude* needs all 18
  meditation spots, and the first — Lucia meditating on her balcony — is only
  offered in Chapter 1. The guide flags it at the top of the page and again
  on the trophy itself. There is no mission replay, so meditate there before
  Chapter 1 ends.

## Layout

- `app/index.html` — the page.
- `app/style.css` — all styling, no external fonts or images.
- `app/app.js` — boots the page: loads the trophy data, wires the controls.
- `app/state.js` — progress in `localStorage`, plus export / import.
- `app/cards.js` — renders each trophy card, its guide panel and counters.
- `app/filters.js` — search, kind and grade filters, spoiler masking.
- `app/roadmap.js` — the five Platinum roadmap stages.
- `app/data/trophies.json` — the 55 trophies: official name, description,
  grade, kind, missable flag, count where PlayStation tracks one, and a
  cited guide for each.
- `main.ts` — the make.fun hand-in program: copies `app/` and `screenshots/`
  to `/output` and writes `/output/dossier.json`.
- `serve.ts` — a small static server for local testing (`node serve.ts`).
- `screenshots/` — renders of this guide, taken in desktop Chrome.
- `shots.json` — which view each screenshot shows.

## Run it

```sh
node serve.ts            # http://localhost:8080
```

Or open `app/index.html` directly from disk. To build the hand-in output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

The trophy names, descriptions and grades are the official PlayStation list,
as listed by Exophase and PSNProfiles. The guides cite their sources beside
each trophy: KeenGamer, How To Video Game, GTA Scoop, GTA Zone, Output Lag,
EGamers, All.gg and Leonida Unlocked. Where a trigger is still being
confirmed by players, the guide says so instead of guessing.

Unofficial fan guide. Not affiliated with, endorsed by or connected to
Rockstar Games, Take-Two Interactive, Sony or PlayStation. Grand Theft Auto
and GTA are trademarks of Take-Two Interactive. No Rockstar logo, official
artwork, box art or game screenshot is used anywhere in this guide.

## License

MIT — see [LICENSE](LICENSE).
