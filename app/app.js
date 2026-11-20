/* Trophy Atlas — bootstrap.
   Loads the trophy data, wires the controls, and re-renders the list,
   the roadmap and the progress dial whenever the saved state changes.
   All state flows through state.js; all rendering through cards.js,
   filters.js and roadmap.js. Nothing here touches the network except
   the one local fetch of data/trophies.json. */

import {
  loadState,
  saveState,
  loadTrophies,
  earnedCount,
  gradeCounts,
  exportProgress,
  importProgress,
} from "./state.js";
import {
  KIND_LABELS,
  KIND_ORDER,
  GRADE_ORDER,
  visibleTrophies,
  kindCounts,
} from "./filters.js";
import { renderGrid, openTrophy } from "./cards.js";
import { renderRoadmap } from "./roadmap.js";

const state = loadState();
let trophies = [];
const byId = new Map();

const grid = document.getElementById("trophyGrid");
const emptyNote = document.getElementById("emptyNote");
const countLine = document.getElementById("countLine");
const dialFill = document.getElementById("dialFill");
const dialCount = document.getElementById("dialCount");
const gradeLine = document.getElementById("gradeLine");
const searchBox = document.getElementById("searchBox");
const gradePick = document.getElementById("gradePick");
const hideEarnedBox = document.getElementById("hideEarnedBox");
const spoilerBox = document.getElementById("spoilerBox");
const kindChips = document.getElementById("kindChips");
const stageList = document.getElementById("stageList");

const DIAL_CIRCUMFERENCE = 326.7;

function renderProgress() {
  const earned = earnedCount(state, trophies);
  const total = trophies.length || 1;
  dialCount.textContent = earned + " / " + trophies.length;
  dialFill.style.strokeDashoffset = String(DIAL_CIRCUMFERENCE * (1 - earned / total));
  const grades = gradeCounts(state, trophies);
  gradeLine.innerHTML = "";
  const parts = GRADE_ORDER.map(
    (g) => "<b>" + grades[g][0] + " / " + grades[g][1] + "</b> " + g,
  );
  gradeLine.insertAdjacentHTML("beforeend", "Earned " + parts.join(" · ") + ".");
}

function renderChips() {
  const counts = kindCounts(trophies);
  kindChips.replaceChildren();
  for (const kind of KIND_ORDER) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.setAttribute("aria-pressed", String(state.kind === kind));
    chip.textContent = KIND_LABELS[kind] + " ";
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = "(" + (counts[kind] || 0) + ")";
    chip.appendChild(n);
    chip.addEventListener("click", () => {
      state.kind = kind;
      saveState(state);
      renderAll();
    });
    kindChips.appendChild(chip);
  }
}

function renderAll() {
  const shown = visibleTrophies(trophies, state);
  const count = renderGrid(grid, shown, state, renderAll);
  emptyNote.hidden = count > 0;
  countLine.textContent =
    "Showing " + count + " of " + trophies.length + " trophies" +
    (state.kind !== "all" ? " · " + KIND_LABELS[state.kind] : "") +
    (state.query ? " · matching “" + state.query + "”" : "") +
    (state.kind === "online" ? " — this list holds no online trophies." : "");
  renderChips();
  renderRoadmap(stageList, byId, state, (id) => {
    /* Roadmap chips jump to the trophy even when a filter hides it:
       clear the kind filter first so the card is on the page. */
    if (state.kind !== "all") {
      state.kind = "all";
      saveState(state);
      renderAll();
    }
    openTrophy(id);
  });
  renderProgress();
}

function wireControls() {
  searchBox.value = state.query;
  searchBox.addEventListener("input", () => {
    state.query = searchBox.value;
    renderAll();
  });
  gradePick.value = state.grade;
  gradePick.addEventListener("change", () => {
    state.grade = gradePick.value;
    saveState(state);
    renderAll();
  });
  hideEarnedBox.checked = state.hideEarned;
  hideEarnedBox.addEventListener("change", () => {
    state.hideEarned = hideEarnedBox.checked;
    saveState(state);
    renderAll();
  });
  spoilerBox.checked = state.spoiler;
  spoilerBox.addEventListener("change", () => {
    state.spoiler = spoilerBox.checked;
    saveState(state);
    renderAll();
  });

  document.getElementById("exportBtn").addEventListener("click", () => exportProgress(state));
  const importFile = document.getElementById("importFile");
  document.getElementById("importBtn").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    const result = await importProgress(state, file, trophies);
    importFile.value = "";
    renderAll();
    /* renderAll rewrites the count line, so say what happened after it. */
    countLine.textContent = result.ok
      ? "Imported progress for " + result.imported + " trophies."
      : "Import failed: " + result.error;
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!window.confirm("Clear all earned trophies and counters?")) return;
    state.earned = {};
    state.counts = {};
    saveState(state);
    renderAll();
  });

  document.querySelectorAll("[data-open-trophy]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.kind !== "all") {
        state.kind = "all";
        saveState(state);
        renderAll();
      }
      openTrophy(button.getAttribute("data-open-trophy"));
    });
  });
}

loadTrophies()
  .then((list) => {
    trophies = list;
    for (const t of trophies) byId.set(t.id, t);
    wireControls();
    renderAll();
  })
  .catch((error) => {
    grid.replaceChildren();
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent = "The trophy list could not be loaded: " + error.message;
    grid.appendChild(note);
  });
