# Trophy Atlas — GTA VI

An offline guide and tracker for all 55 PlayStation 5 trophies of
Grand Theft Auto VI. Unofficial fan guide, built for the make.fun
bounty `gta6-trophy-guide-01`.

## What it is

- **All 55 trophies** with their official PlayStation names,
  descriptions and grades, in `app/data/trophies.json`, each with a
  guide written for this entry in our own words and the sources it
  cites beside it.
- **A checklist** that saves in the browser (localStorage), with
  export to a file and import back.
- **Filters** by kind (story, missable, collectibles, activities,
  completion, online), by grade, and by search — plus a hide-earned
  switch.
- **A spoiler setting** that hides the names and descriptions of
  story trophies until they are earned.
- **A roadmap to the Platinum** in six stages, built from the official
  descriptions: story chapters and missions, stranger strands,
  collectibles and counts, in order.
- **One missable trophy**, flagged everywhere: Positive Mental
  Attitude (18 meditation spots; the first is only offered in
  Chapter 1).
- **Fully offline**: every file the app loads lives under `app/`.
  The only thing that ever leaves the page is a citation link the
  reader chooses to follow.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/dossier.json is the summary the judge reads
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json`
with the vendored `vendor/makefun-frontend.ts`.

## Layout

- `app/index.html` — the page shell
- `app/style.css` — the whole look (dark "Vice dusk", our own)
- `app/app.js` — bootstrap: loads the data, wires the controls
- `app/state.js` — saved progress, export/import, counters
- `app/filters.js` — kind/grade/search matching, spoiler rule
- `app/cards.js` — the trophy cards and their guides
- `app/roadmap.js` — the six Platinum stages
- `app/data/trophies.json` — the 55 trophies and their guides
- `screenshots/` — 3–4 renders of the app in a browser
- `main.ts` — the hand-in program
- `serve.ts` — a tiny local static server for trying it out

## License

MIT. No Rockstar Games artwork, logos or game images are used
anywhere in this guide.
