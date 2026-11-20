/* Trophy Atlas — the trophy cards.
   One card per trophy: a tick box, the official name, description and
   grade, kind tags, a counter for trophies that track a total, and a
   guide that opens in place with its sources. Everything is built
   with textContent and createElement, never innerHTML, so a trophy
   name can never break the page. */

import { isSpoiled, kindOf, KIND_LABELS } from "./filters.js";
import { setCount, toggleEarned } from "./state.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(grade) {
  return el("span", "badge " + grade, grade);
}

function formatCount(n) {
  return n.toLocaleString("en-US");
}

/* Build the guide panel for one trophy: the guide text in our own
   words, then the sources it cites, each as a link the reader may
   choose to follow (the app itself fetches nothing). */
function buildGuide(trophy) {
  const box = el("div", "guide");
  box.appendChild(el("p", null, trophy.guide));
  if (Array.isArray(trophy.sources) && trophy.sources.length) {
    box.appendChild(el("h4", null, "Sources"));
    const list = el("ul");
    for (const source of trophy.sources) {
      const item = el("li");
      const link = el("a", null, source.name);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener";
      item.appendChild(link);
      list.appendChild(item);
    }
    box.appendChild(list);
  }
  return box;
}

function buildCounter(trophy, state, onChange) {
  const total = trophy.count;
  const current = state.counts[trophy.id] || 0;
  const row = el("div", "counter");
  const minus = el("button", null, "−");
  minus.type = "button";
  minus.setAttribute("aria-label", "Decrease count for " + trophy.name);
  const label = el("span");
  const value = el("b", null, formatCount(current) + " / " + formatCount(total));
  label.append("Progress: ", value);
  const plus = el("button", null, "+");
  plus.type = "button";
  plus.setAttribute("aria-label", "Increase count for " + trophy.name);
  minus.addEventListener("click", () => {
    setCount(state, trophy, current - 1);
    onChange();
  });
  plus.addEventListener("click", () => {
    setCount(state, trophy, current + 1);
    onChange();
  });
  row.append(minus, label, plus);
  return row;
}

export function buildCard(trophy, state, onChange) {
  const card = el("article", "card");
  card.id = "trophy-" + trophy.id;
  const earned = Boolean(state.earned[trophy.id]);
  if (earned) card.classList.add("earned");
  const spoiled = isSpoiled(trophy, state);

  const head = el("div", "card-head");
  const tick = el("input", "tick");
  tick.type = "checkbox";
  tick.checked = earned;
  tick.setAttribute("aria-label", "Mark " + (spoiled ? "this story trophy" : trophy.name) + " earned");
  tick.addEventListener("change", () => {
    toggleEarned(state, trophy);
    onChange();
  });
  head.appendChild(tick);

  const name = el("h3", "card-name");
  const nameButton = el("button", null, spoiled ? "Hidden story trophy" : trophy.name);
  nameButton.type = "button";
  nameButton.setAttribute("aria-expanded", "false");
  name.appendChild(nameButton);
  head.appendChild(name);
  head.appendChild(gradeBadge(trophy.grade));
  card.appendChild(head);

  if (spoiled) {
    card.appendChild(el("p", "spoiler-mask", "Story trophy — its name and description stay hidden until you earn it. Tick the box when you have it, or turn the spoiler setting off."));
  } else {
    card.appendChild(el("p", "card-desc", trophy.description || ""));
  }

  const tags = el("div", "card-tags");
  tags.appendChild(el("span", "tag", KIND_LABELS[kindOf(trophy)] || kindOf(trophy)));
  if (trophy.hidden) tags.appendChild(el("span", "tag hidden-t", "Hidden on PSN"));
  if (trophy.missable) tags.appendChild(el("span", "tag missable", "Missable"));
  if (earned) tags.appendChild(el("span", "tag earned-t", "Earned"));
  card.appendChild(tags);

  if (typeof trophy.count === "number" && !spoiled) {
    card.appendChild(buildCounter(trophy, state, onChange));
  }

  /* The guide opens in place. It is built once, hidden until asked
     for, and its text comes from the data file, not from this code. */
  let guideBox = null;
  nameButton.addEventListener("click", () => {
    if (!guideBox) {
      guideBox = spoiled
        ? el("div", "guide", null)
        : buildGuide(trophy);
      if (spoiled) guideBox.appendChild(el("p", "spoiler-mask", "Earn this trophy to reveal its guide."));
      guideBox.hidden = true;
      card.appendChild(guideBox);
    }
    guideBox.hidden = !guideBox.hidden;
    nameButton.setAttribute("aria-expanded", String(!guideBox.hidden));
  });

  return card;
}

/* Render the whole list into the grid. Returns the number shown. */
export function renderGrid(grid, trophies, state, onChange) {
  grid.replaceChildren();
  for (const trophy of trophies) {
    grid.appendChild(buildCard(trophy, state, onChange));
  }
  return trophies.length;
}

/* Open one trophy's guide from outside the grid — used by the roadmap
   chips and the missable warning. */
export function openTrophy(id) {
  const card = document.getElementById("trophy-" + id);
  if (!card) return false;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  const button = card.querySelector(".card-name button");
  if (button && button.getAttribute("aria-expanded") !== "true") button.click();
  return true;
}
