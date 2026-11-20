/* Leonida Trophy Atlas — bootstrap.
   Loads the trophy data, wires the controls, and re-renders the list,
   the roadmap and the progress meter whenever the saved state changes.
   All state flows through state.js; all filtering through filters.js.
   URL parameters are honoured for linking to a view (?grade=silver,
   ?kind=collectibles, ?open=<trophy id>). */

import { DATA_PATH, countByGrade, countEarned, download, exportText, parseImport, readProgress, writeProgress } from "./state.js";
import { KIND_LIST, KIND_NAMES, applyFilters, kindTotals } from "./filters.js";
import { buildTrophyRow, openTrophy } from "./cards.js";
import { renderRoadmap } from "./roadmap.js";

const listEl = document.getElementById("trophyList");
const noMatchEl = document.getElementById("noMatch");
const shownLineEl = document.getElementById("shownLine");
const searchInput = document.getElementById("searchInput");
const gradeSelect = document.getElementById("gradeSelect");
const hideEarnedInput = document.getElementById("hideEarnedInput");
const spoilerInput = document.getElementById("spoilerInput");
const kindChipsEl = document.getElementById("kindChips");
const meterCountEl = document.getElementById("meterCount");
const meterPctEl = document.getElementById("meterPct");
const meterFillEl = document.getElementById("meterFill");
const meterGradesEl = document.getElementById("meterGrades");

let trophies = [];
const progress = readProgress();

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const grade = params.get("grade");
  if (grade && (grade === "all" || ["platinum", "gold", "silver", "bronze"].includes(grade))) {
    progress.grade = grade;
  }
  const kind = params.get("kind");
  if (kind && KIND_LIST.includes(kind)) progress.kind = kind;
  return params.get("open");
}

function renderMeter() {
  const earned = countEarned(progress, trophies);
  const total = trophies.length;
  meterCountEl.textContent = `${earned} / ${total}`;
  meterPctEl.textContent = total ? `${Math.round((earned / total) * 100)}%` : "0%";
  meterFillEl.style.width = total ? `${(earned / total) * 100}%` : "0%";
  const byGrade = countByGrade(progress, trophies);
  meterGradesEl.textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => `${g[0].toUpperCase() + g.slice(1)} ${byGrade[g][0]}/${byGrade[g][1]}`)
    .join(" · ");
}

function renderKindChips() {
  const totals = kindTotals(trophies);
  kindChipsEl.innerHTML = "";
  for (const kind of KIND_LIST) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = `${KIND_NAMES[kind]} (${totals[kind] ?? 0})`;
    chip.setAttribute("aria-pressed", String(progress.kind === kind));
    chip.addEventListener("click", () => {
      progress.kind = kind;
      writeProgress(progress);
      renderAll();
    });
    kindChipsEl.append(chip);
  }
}

function renderList() {
  const visible = applyFilters(trophies, progress);
  listEl.innerHTML = "";
  for (const trophy of visible) {
    listEl.append(buildTrophyRow(trophy, progress, () => {
      writeProgress(progress);
      renderAll();
    }));
  }
  noMatchEl.hidden = visible.length !== 0;
  shownLineEl.textContent =
    visible.length === trophies.length
      ? `Showing all ${trophies.length} trophies.`
      : `Showing ${visible.length} of ${trophies.length} trophies.`;
}

function renderControls() {
  searchInput.value = progress.query;
  gradeSelect.value = progress.grade;
  hideEarnedInput.checked = progress.hideEarned;
  spoilerInput.checked = progress.spoiler;
}

function renderAll() {
  renderMeter();
  renderKindChips();
  renderControls();
  renderList();
}

function wireControls() {
  searchInput.addEventListener("input", () => {
    progress.query = searchInput.value;
    writeProgress(progress);
    renderList();
  });
  gradeSelect.addEventListener("change", () => {
    progress.grade = gradeSelect.value;
    writeProgress(progress);
    renderAll();
  });
  hideEarnedInput.addEventListener("change", () => {
    progress.hideEarned = hideEarnedInput.checked;
    writeProgress(progress);
    renderAll();
  });
  spoilerInput.addEventListener("change", () => {
    progress.spoiler = spoilerInput.checked;
    writeProgress(progress);
    renderAll();
  });

  document.getElementById("exportButton").addEventListener("click", () => {
    download("leonida-trophy-atlas-progress.json", exportText(progress));
  });
  const importPicker = document.getElementById("importPicker");
  document.getElementById("importButton").addEventListener("click", () => importPicker.click());
  importPicker.addEventListener("change", async () => {
    const file = importPicker.files?.[0];
    if (!file) return;
    try {
      const imported = parseImport(await file.text());
      Object.assign(progress, imported);
      writeProgress(progress);
      renderAll();
    } catch {
      alert("That file is not a Leonida Trophy Atlas progress export.");
    }
    importPicker.value = "";
  });
  document.getElementById("resetButton").addEventListener("click", () => {
    if (!confirm("Clear all earned trophies and counters?")) return;
    progress.earned = {};
    progress.counts = {};
    writeProgress(progress);
    renderAll();
  });
  document.getElementById("missableOpen").addEventListener("click", () => {
    progress.kind = "all";
    progress.grade = "all";
    progress.query = "";
    writeProgress(progress);
    renderAll();
    openTrophy(listEl, "positive-mental-attitude");
  });
}

async function boot() {
  const openId = applyUrlParams();
  const response = await fetch(DATA_PATH);
  const data = await response.json();
  trophies = data.trophies ?? data;
  renderRoadmap(document.getElementById("stageList"));
  wireControls();
  renderAll();
  if (openId) openTrophy(listEl, openId);
}

boot().catch((error) => {
  listEl.innerHTML = "";
  noMatchEl.hidden = false;
  noMatchEl.textContent = `The trophy list could not be loaded (${error.message}). Check that app/data/trophies.json is present and valid.`;
});
