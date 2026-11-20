/* Leonida Trophy Atlas — the trophy rows.
   One row per trophy: a tick box, the official name, description and
   grade, kind tags, a stepper for trophies that track a total, and a
   guide that opens below the row with its sources named beside it. */

import { bumpCounter, counterValue, toggleEarned } from "./state.js";
import { isMasked, kindOf } from "./filters.js";

const GRADE_WORD = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
const KIND_WORD = {
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  completion: "Completion",
  online: "Online",
};

function tag(text, className) {
  const el = document.createElement("span");
  el.className = `tag${className ? ` ${className}` : ""}`;
  el.textContent = text;
  return el;
}

function buildCounter(trophy, progress, onChange) {
  const row = document.createElement("div");
  row.className = "counter-row";
  const value = counterValue(progress, trophy);

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "−";
  minus.setAttribute("aria-label", "Count one fewer");
  minus.addEventListener("click", () => {
    bumpCounter(progress, trophy, -1);
    onChange();
  });

  const shown = document.createElement("span");
  shown.className = "counter-value";
  shown.textContent = `${value} / ${trophy.count}`;

  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+";
  plus.setAttribute("aria-label", "Count one more");
  plus.addEventListener("click", () => {
    bumpCounter(progress, trophy, 1);
    onChange();
  });

  const hint = document.createElement("span");
  hint.textContent = "toward the total PlayStation tracks";

  row.append(minus, shown, plus, hint);
  return row;
}

function buildSources(trophy) {
  const note = document.createElement("p");
  note.className = "source-note";
  note.textContent = "Sources: ";
  (trophy.sources || []).forEach((source, i) => {
    if (i > 0) note.append(document.createTextNode(" · "));
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.name;
    note.append(link);
  });
  if (!(trophy.sources || []).length) note.textContent = "Sources: official PlayStation trophy list.";
  return note;
}

export function buildTrophyRow(trophy, progress, onChange) {
  const masked = isMasked(trophy, progress);
  const earned = Boolean(progress.earned[trophy.id]);

  const article = document.createElement("article");
  article.className = `trophy${earned ? " earned" : ""}`;
  article.dataset.trophyId = trophy.id;

  const head = document.createElement("button");
  head.type = "button";
  head.className = "trophy-head";
  head.setAttribute("aria-expanded", "false");

  const tick = document.createElement("span");
  tick.className = "tick";
  tick.setAttribute("aria-hidden", "true");
  tick.textContent = "✓";

  const middle = document.createElement("span");

  const name = document.createElement("span");
  name.className = "trophy-name";
  name.textContent = masked ? "Hidden story trophy" : trophy.name;

  const desc = document.createElement("span");
  desc.className = "trophy-desc";
  desc.textContent = masked
    ? "A story trophy — its name and description stay hidden until you earn it."
    : trophy.description;

  const tags = document.createElement("span");
  tags.className = "tags";
  tags.append(tag(KIND_WORD[kindOf(trophy)] || kindOf(trophy)));
  if (trophy.missable) tags.append(tag("Missable — read before Chapter 1 ends", "missable-tag"));
  if (trophy.hidden) tags.append(tag("Hidden on PlayStation", "hidden-tag"));
  if (trophy.count) tags.append(tag(`Counts to ${trophy.count.toLocaleString("en-US")}`));

  middle.append(name, desc, tags);

  const chip = document.createElement("span");
  chip.className = `grade-chip grade-${trophy.grade}`;
  chip.textContent = GRADE_WORD[trophy.grade] || trophy.grade;

  head.append(tick, middle, chip);

  const body = document.createElement("div");
  body.className = "trophy-body";
  body.hidden = true;

  const guideHeading = document.createElement("h3");
  guideHeading.textContent = "Guide";
  const guide = document.createElement("p");
  guide.className = "guide-text";
  guide.textContent = masked ? "Earn this trophy to reveal its guide." : trophy.guide;

  body.append(guideHeading, guide);
  if (trophy.count) body.append(buildCounter(trophy, progress, onChange));
  body.append(buildSources(trophy));

  head.addEventListener("click", (event) => {
    /* A click on the tick toggles earned; a click anywhere else opens
       or closes the guide. */
    if (event.target === tick) return;
    const open = body.hidden;
    body.hidden = !open;
    head.setAttribute("aria-expanded", String(open));
  });

  tick.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEarned(progress, trophy.id);
    onChange();
  });

  article.append(head, body);
  return article;
}

/* Opens one trophy's guide by id (used by the missable banner and by
   ?open=<id> links). Returns true when the trophy is on the page. */
export function openTrophy(listEl, trophyId) {
  const row = listEl.querySelector(`[data-trophy-id="${trophyId}"]`);
  if (!row) return false;
  const body = row.querySelector(".trophy-body");
  const head = row.querySelector(".trophy-head");
  if (body && body.hidden) {
    body.hidden = false;
    head.setAttribute("aria-expanded", "true");
  }
  row.scrollIntoView({ block: "center" });
  return true;
}
