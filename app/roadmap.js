/* Trophy Atlas — the roadmap to the Platinum.
   Six stages in the order to play them, built from the official
   descriptions: which story chapters and missions, which collectibles
   and counts. Each stage names the trophies it finishes, as chips
   that jump to that trophy's card and open its guide. */

export const ROADMAP_STAGES = [
  {
    title: "Before you play — the one save that matters",
    text: "Keep the spoiler setting on. Make a manual save at the start of Chapter 1, then meditate at Lucia's balcony spot before Chapter 1 ends — it is the only missable step in the whole list, and there is no mission replay to save you if you skip it.",
    trophies: ["positive-mental-attitude"],
  },
  {
    title: "Play the story — Chapters 1 to 4 and the finale",
    text: "Finish every story mission in order. The chapter trophies and the mission trophies all pop on their own, and the finale pays the gold. While you play, sample each activity type once and let the slow counters (stunts, vehicles, choices) climb in the background.",
    trophies: [
      "just-like-paradise",
      "paradise-lost",
      "t-ass-drug-money",
      "vice-city-baby",
      "top-of-the-world-ma",
      "you-gotta-know-when-to-get-off",
      "trust",
      "break-the-bank",
      "family-matters",
      "dwnfall",
      "hi-jacked",
      "snow-storm",
      "master-of-none",
    ],
  },
  {
    title: "Strangers across Leonida — all 8 strands",
    text: "Clear every stranger strand to its final mission: Andy, Kenton, Billy, Randy and Tyrone, plus the other three. Strands unlock as the story advances, so check the map after each chapter. Finishing all 8 pays the silver and feeds 100% completion.",
    trophies: [
      "road-to-rehabilitation",
      "this-was-no-boat-accident",
      "the-lone-rider",
      "supply-and-demand",
      "spin-on-this",
      "strangers-and-freaks",
      "fair-game",
    ],
  },
  {
    title: "Robberies, races and the open-world set",
    text: "Now the free-roam trophies: bank vaults and armored trucks, shops with your partner, the 4-star escape, the airport departure, the showroom smash, the Ocean Beach cocktail, and the 20 race wins and 14 drone-race wins. Do the partner trophies together so neither has to be repeated.",
    trophies: [
      "maximum-withdrawal",
      "a-classic-blitz-play",
      "retail-therapy",
      "hot-together",
      "catch-me-if-you-can",
      "capital-offense",
      "in-the-beginning",
      "earn-cash-not-kudos",
      "top-fun",
      "baited-my-tackle",
      "stick-fiddler",
      "lets-go-bowling",
    ],
  },
  {
    title: "The collectible sweep — maps, cards, spots and garages",
    text: "Work district by district: all 52 areas of Leonida, all 18 meditation spots, 100 WAiNK It locations, 100 vehicles discovered, 3 card sets, 10 Scooter Bros registrations and all 8 garage properties. Tick each find off in the tracker as you go so no district gets swept twice.",
    trophies: [
      "the-goodtime-state",
      "you-wainker",
      "whip-it-good",
      "dont-touch-my-deck",
      "on-the-spot",
      "little-boxes",
      "pest-control",
    ],
  },
  {
    title: "The long grind — stunts, ranges, money and 100%",
    text: "Last: 250 stunts, gold in all 42 Shooting Range challenges, 50 challenges, 500 choices, $250,000 of laundered Marked Bills and $100,000 spent. The range golds are the hardest skill check in the list — leave them for a focused session. When everything else is done, 100% completion and the Platinum pop together.",
    trophies: [
      "cunning-stunts",
      "the-shootist",
      "one-last-thing",
      "actions-speak-louder",
      "dime-on-the-dollar",
      "treat-yo-self",
      "gunslinger",
      "sneakthief",
      "challenging-tank",
      "bad-luck-i-guess",
      "the-truth-is-out-there",
      "personal-best",
      "ten-pin",
      "a-long-road",
      "vice-got-a-price",
    ],
  },
];

export function renderRoadmap(list, trophiesById, state, onOpenTrophy) {
  list.replaceChildren();
  ROADMAP_STAGES.forEach((stage, index) => {
    const item = document.createElement("li");
    item.className = "stage";
    const num = document.createElement("div");
    num.className = "stage-num";
    num.textContent = String(index + 1);
    item.appendChild(num);
    const body = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = stage.title;
    const text = document.createElement("p");
    text.textContent = stage.text;
    const chips = document.createElement("div");
    chips.className = "stage-trophies";
    for (const id of stage.trophies) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = trophy.name;
      if (state.earned[id]) chip.classList.add("done");
      chip.addEventListener("click", () => onOpenTrophy(id));
      chips.appendChild(chip);
    }
    body.append(heading, text, chips);
    item.appendChild(body);
    list.appendChild(item);
  });
}
