/* Leonida Trophy Atlas — the roadmap to the Platinum.
   Five stages in the order to play them, built from the official
   descriptions: which story chapters and missions, which stranger
   strands, which collectibles and counts. */

export const ROADMAP_STAGES = [
  {
    title: "Stage 1 — Play the story, and mind the one missable",
    text: "Chapters 1 to 4, then the final mission. Every chapter and mission trophy is unmissable, so just play — except for one thing.",
    points: [
      "Before Chapter 1 ends, meditate at Lucia's balcony spot (Positive Mental Attitude, 18 spots) — the only trophy that can be missed.",
      "Try each activity type once as it unlocks, for Master of None (9 types).",
      "Start the slow counters in passing: vehicles discovered (100), WAiNK It locations (100), meditation spots (18).",
      "Earns: the 13 story trophies, the final-mission gold, and the start of every counter.",
    ],
  },
  {
    title: "Stage 2 — Finish the stranger strands",
    text: "Eight mission strands given by strangers across Leonida, including Andy, Kenton, Billy, Randy and Tyrone. Clear each strand as soon as its next mission appears.",
    points: [
      "Complete the final mission for Andy, Kenton, Billy, Randy and Tyrone (5 bronzes).",
      "Complete the other three stranger strands the same way.",
      "Earns: Strangers & Freaks (silver, all 8 strands) and 5 stranger bronzes.",
    ],
  },
  {
    title: "Stage 3 — Partner, hunting and the odd jobs",
    text: "The co-op and one-off trophies: do them while the map is still fresh, before the long grinds.",
    points: [
      "With your partner: lose a 4-star wanted level (Hot Together), rob 3 shops back to back without losing the wanted level (Retail Therapy).",
      "Hunt Bret's unique animal (Fair Game), beat Cal at fishing (Baited My Tackle), finish an arcade game (Stick Fiddler).",
      "Bowl at Kolt & Associates (Let's Go Bowling), order a cocktail on Ocean Beach (In The Beginning…), take the unscheduled departure at VCIA (Catch Me If You Can).",
      "Earns: roughly a dozen bronzes, including the partner pair.",
    ],
  },
  {
    title: "Stage 4 — The collectible and counter sweep",
    text: "District by district, with the tracker open. Nothing here is missable — every spot and total is still available after the story.",
    points: [
      "Explore all 52 named areas of Leonida (The Goodtime State).",
      "Discover 100 vehicles (Whip It Good), tag 100 WAiNK It locations (You WAiNKer!), register 10 vehicles to the Scooter Bros app (On the Spot).",
      "Complete 3 collectible card sets (Don't Touch My Deck), buy all 8 garage properties (Little Boxes).",
      "Meditate at the remaining 17 spots, rob an illegal operation for each of the 9 gangs (Pest Control), rob 5 bank vaults and escape (Maximum Withdrawal, silver).",
      "Earns: the collectible set, both silvers, and most of the counters.",
    ],
  },
  {
    title: "Stage 5 — The grinds, then the Platinum",
    text: "The long totals, saved for last so they never block the story. Check the in-game stats page to see which category is still short.",
    points: [
      "Complete 250 stunts (Cunning Stunts, silver) and win 20 different races (Earn Cash, Not Kudos) plus 14 Top Fun drone races (Top Fun).",
      "Gold all 42 Shooting Range challenges (The Shootist, silver) — the hardest skill trophy; leave it for a focused session.",
      "Complete 50 challenges (One Last Thing), launder $250,000 of Marked Bills (Dime on the Dollar), spend $100,000 across all shops (Treat Yo Self).",
      "Finish at 100% completion (A Long Road, gold) — then the Platinum, Vice Got a Price!, pops on its own.",
    ],
  },
];

export function renderRoadmap(listEl) {
  listEl.innerHTML = "";
  for (const stage of ROADMAP_STAGES) {
    const item = document.createElement("li");
    item.className = "stage";

    const body = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = stage.title;
    const text = document.createElement("p");
    text.textContent = stage.text;
    const points = document.createElement("ul");
    for (const point of stage.points) {
      const li = document.createElement("li");
      li.textContent = point;
      points.append(li);
    }
    body.append(heading, text, points);
    item.append(body);
    listEl.append(item);
  }
}
