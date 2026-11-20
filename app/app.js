/* Leonida Trophy Guide — tracker logic.
   Loads app/data/trophies.json (a file of this app, so it works offline),
   keeps earned trophies and per-trophy counts in localStorage, and renders
   the checklist, the filters, the spoiler setting and the roadmap.
   No network request is ever made: every URL in this file is either a
   same-app data file or a citation link the reader chooses to follow. */

const DATA_URL = "data/trophies.json";
const STORAGE_KEY = "leonida-trophy-guide-v1";

const KIND_LABELS = {
  all: "All",
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  completion: "Completion",
  online: "Online",
};
const KIND_ORDER = ["all", "story", "missable", "collectibles", "activities", "completion", "online"];
const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

/* Roadmap to the Platinum, built from the official descriptions: which
   story chapters and missions, which collectibles and counts, in what
   order. Trophy ids refer to app/data/trophies.json. */
const ROADMAP_STAGES = [
  {
    title: "Before you play — the one save that matters",
    text: "Turn the spoiler setting off only when you are ready for mission names. Make a manual save at the start of Chapter 1, and meditate at Lucia's balcony spot before Chapter 1 ends — it is the only missable step in the whole list.",
    trophies: [28],
  },
  {
    title: "Play the story — Chapters 1 to 4 and the finale",
    text: "Finish every mission in order. The chapter trophies and the six named story missions pop on their own, and the final mission is the gold. Keep a manual save at the start of each chapter; there is no mission replay.",
    trophies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: "Side characters and strangers",
    text: "Between missions, work the stranger strands: Andy, Kenton, Billy, Randy and Tyrone each end in a final mission, Bret's hunt needs one unique animal, and 8 stranger strands in total earn the silver. All of them stay open after the story.",
    trophies: [22, 23, 24, 26, 27, 29, 25],
  },
  {
    title: "Activities — ranges, races and games",
    text: "Gold all 42 Shooting Range challenges, win a drone race at all 14 Top Fun locations, win 20 different driving races, beat Cal at fishing, finish one arcade game and bowl at Kolt & Associates. Try one of each of the 9 activity types for Master of None.",
    trophies: [17, 18, 19, 20, 21, 46, 16],
  },
  {
    title: "Collectibles and exploration",
    text: "Sweep Leonida area by area: all 52 areas, 100 WAiNK scans, 100 vehicles discovered, 3 card sets, 8 garages bought, 10 vehicles registered to Scooter Bros, and all 18 meditation spots. One sweep covers several trophies at once.",
    trophies: [42, 31, 35, 30, 54, 55, 28],
  },
  {
    title: "Robberies, combat and money",
    text: "Rob 5 bank vaults, one armored truck, one illegal operation per gang (9), 3 shops back-to-back with your partner while keeping your wanted level, and a jewelry store without being seen. Drop 5 enemies in one Combat Focus, launder $250,000 of Marked Bills and spend $100,000 in shops.",
    trophies: [40, 41, 43, 34, 39, 36, 52, 53],
  },
  {
    title: "The long tail — challenges, choices and 100%",
    text: "Finish 50 challenges (70 count toward 100%), land 250 stunts, log 500 Criminal Profile actions, escape a 4-star wanted level with your partner, and chase the odd one-offs — the airport departure, the Rhino, the Ocean Beach cocktail, the showroom smash and the melee drive-by. When the post-credits checklist hits 100%, A Long Road pops, and the Platinum follows.",
    trophies: [32, 15, 48, 33, 37, 38, 44, 45, 51, 14, 1],
  },
];

const state = {
  earned: {}, // trophy id -> true
  counts: {}, // trophy id -> number logged toward its count
  spoilersHidden: true,
  kind: "all",
  grade: "all",
  query: "",
  hideEarned: false,
  open: {}, // trophy id -> guide panel open
};

let TROPHIES = [];
let LIST_META = "";

/* ---------- persistence ---------- */
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && typeof saved === "object") {
      if (saved.earned && typeof saved.earned === "object") state.earned = saved.earned;
      if (saved.counts && typeof saved.counts === "object") state.counts = saved.counts;
      if (typeof saved.spoilersHidden === "boolean") state.spoilersHidden = saved.spoilersHidden;
    }
  } catch (err) {
    // A corrupt save must never break the guide: start fresh.
    console.warn("Saved progress could not be read; starting fresh.", err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: state.earned,
      counts: state.counts,
      spoilersHidden: state.spoilersHidden,
      savedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("Progress could not be saved.", err);
  }
}

/* ---------- helpers ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function trophyById(id) {
  return TROPHIES.find((t) => t.id === id);
}

function isEarned(trophy) {
  return Boolean(state.earned[trophy.id]);
}

function isSpoilerMasked(trophy) {
  return state.spoilersHidden && trophy.kind === "story" && !isEarned(trophy);
}

function countProgress(trophy) {
  if (!trophy.count) return null;
  const logged = Math.max(0, Math.min(trophy.count, Number(state.counts[trophy.id]) || 0));
  return { logged, total: trophy.count, label: trophy.countLabel || "progress" };
}

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindMatches(trophy) {
  if (state.kind === "all") return true;
  if (state.kind === "missable") return Boolean(trophy.missable);
  return trophy.kind === state.kind;
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return TROPHIES.filter((t) => {
    if (!kindMatches(t)) return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.hideEarned && isEarned(t)) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ---------- progress header ---------- */
function renderProgress() {
  const earned = TROPHIES.filter(isEarned).length;
  const total = TROPHIES.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById("earnedCount").textContent = earned + " / " + total;
  document.getElementById("progressLabel").textContent =
    pct === 100 ? "trophies earned — Platinum time!" : "trophies earned · " + pct + "%";
  document.getElementById("progressFill").style.width = pct + "%";
  const parts = GRADE_ORDER.map((g) => {
    const have = TROPHIES.filter((t) => t.grade === g && isEarned(t)).length;
    const all = TROPHIES.filter((t) => t.grade === g).length;
    return gradeWord(g) + " " + have + "/" + all;
  });
  document.getElementById("gradeCounts").textContent = parts.join(" · ");
}

/* ---------- kind filter buttons ---------- */
function renderKindFilters() {
  const wrap = document.getElementById("kindFilters");
  wrap.textContent = "";
  KIND_ORDER.forEach((kind) => {
    const btn = el("button", "kind-btn");
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(state.kind === kind));
    const count = kind === "all"
      ? TROPHIES.length
      : kind === "missable"
        ? TROPHIES.filter((t) => t.missable).length
        : TROPHIES.filter((t) => t.kind === kind).length;
    btn.textContent = KIND_LABELS[kind] + " ";
    const n = el("span", "n", "(" + count + ")");
    btn.appendChild(n);
    btn.addEventListener("click", () => {
      state.kind = kind;
      renderKindFilters();
      renderList();
    });
    wrap.appendChild(btn);
  });
}

/* ---------- roadmap ---------- */
function renderRoadmap() {
  const list = document.getElementById("roadmapStages");
  list.textContent = "";
  ROADMAP_STAGES.forEach((stage) => {
    const earnedHere = stage.trophies.filter((id) => {
      const t = trophyById(id);
      return t && isEarned(t);
    }).length;
    const item = el("li", "roadmap-stage" + (earnedHere === stage.trophies.length ? " done" : ""));
    item.appendChild(el("h3", null, stage.title));
    item.appendChild(el("p", null, stage.text));
    const names = stage.trophies.map((id) => {
      const t = trophyById(id);
      if (!t) return "";
      return isSpoilerMasked(t) ? "Story trophy (hidden)" : t.name;
    }).filter(Boolean);
    const meta = el("p", "stage-trophies");
    const count = el("span", "stage-count", earnedHere + "/" + stage.trophies.length + " earned · ");
    meta.appendChild(count);
    meta.appendChild(document.createTextNode(names.join(" · ")));
    item.appendChild(meta);
    list.appendChild(item);
  });
}

/* ---------- trophy list ---------- */
function renderList() {
  const list = document.getElementById("trophyList");
  const empty = document.getElementById("emptyState");
  list.textContent = "";
  const shown = visibleTrophies();
  empty.hidden = shown.length !== 0;

  shown.forEach((trophy) => {
    const card = el("article", "trophy-card" + (isEarned(trophy) ? " earned" : ""));
    card.id = "trophy-" + trophy.id;

    const head = el("div", "trophy-head");
    const checkWrap = el("label", "trophy-check");
    checkWrap.title = isEarned(trophy) ? "Earned — click to unmark" : "Mark as earned";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = isEarned(trophy);
    check.setAttribute("aria-label", "Earned: " + trophy.name);
    check.addEventListener("change", () => {
      if (check.checked) state.earned[trophy.id] = true;
      else delete state.earned[trophy.id];
      saveState();
      renderProgress();
      renderRoadmap();
      renderList();
    });
    check.addEventListener("click", (event) => event.stopPropagation());
    checkWrap.appendChild(check);
    head.appendChild(checkWrap);

    const main = el("div", "trophy-main");
    const masked = isSpoilerMasked(trophy);
    const name = el("h3", "trophy-name", masked ? "Story trophy — hidden until earned" : trophy.name);
    if (trophy.hidden) {
      name.appendChild(document.createTextNode(" "));
      name.appendChild(el("span", "hidden-mark", "· hidden"));
    }
    main.appendChild(name);
    main.appendChild(el("p", "trophy-desc", masked ? "A story trophy. Earn it in the game (or turn the spoiler setting off) to see its name and description." : trophy.description));

    const tags = el("div", "trophy-tags");
    tags.appendChild(el("span", "tag grade-" + trophy.grade, gradeWord(trophy.grade)));
    tags.appendChild(el("span", "tag kind", KIND_LABELS[trophy.kind] || trophy.kind));
    if (trophy.hidden) tags.appendChild(el("span", "tag hidden-trophy", "Hidden on PS5"));
    if (trophy.missable) tags.appendChild(el("span", "tag missable", "Missable"));
    if (trophy.count) tags.appendChild(el("span", "tag", trophy.count + " " + (trophy.countLabel || "")));
    main.appendChild(tags);
    head.appendChild(main);

    const toggle = el("button", "guide-toggle", state.open[trophy.id] ? "Hide guide" : "Guide");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(Boolean(state.open[trophy.id])));
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      state.open[trophy.id] = !state.open[trophy.id];
      renderList();
      if (state.open[trophy.id]) {
        const fresh = document.getElementById("trophy-" + trophy.id);
        if (fresh) fresh.scrollIntoView({ block: "nearest" });
      }
    });
    head.appendChild(toggle);
    head.addEventListener("click", () => {
      state.open[trophy.id] = !state.open[trophy.id];
      renderList();
    });
    card.appendChild(head);

    if (state.open[trophy.id]) {
      if (masked) {
        card.appendChild(el("p", "spoiler-mask", "This is a story trophy, so its guide stays hidden while the spoiler setting is on. Earn it in the game, or turn the spoiler setting off, to read the guide."));
      } else {
        const detail = el("div", "trophy-detail");
        detail.appendChild(el("h4", null, "How to earn it"));
        detail.appendChild(el("p", null, trophy.guide));
        const prog = countProgress(trophy);
        if (prog) {
          const row = el("div", "count-row");
          row.appendChild(el("label", null, "Your progress: "));
          const input = document.createElement("input");
          input.type = "number";
          input.min = "0";
          input.max = String(prog.total);
          input.value = String(prog.logged);
          input.setAttribute("aria-label", "Progress toward " + trophy.name);
          input.addEventListener("change", () => {
            const value = Math.max(0, Math.min(prog.total, Number(input.value) || 0));
            if (value > 0) state.counts[trophy.id] = value;
            else delete state.counts[trophy.id];
            saveState();
            renderList();
          });
          row.appendChild(input);
          row.appendChild(document.createTextNode(" / " + prog.total + " " + prog.label));
          const meter = el("div", "count-meter");
          const fill = el("span");
          fill.style.width = Math.round((prog.logged / prog.total) * 100) + "%";
          meter.appendChild(fill);
          row.appendChild(meter);
          detail.appendChild(row);
        }
        detail.appendChild(el("h4", null, "Sources"));
        const srcList = el("ul", "source-list-inline");
        trophy.sources.forEach((src) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = src.url;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = src.name;
          li.appendChild(a);
          srcList.appendChild(li);
        });
        detail.appendChild(srcList);
        card.appendChild(detail);
      }
    }
    list.appendChild(card);
  });

  const shownCount = shown.length;
  const earnedShown = shown.filter(isEarned).length;
  document.getElementById("filterNote").textContent =
    "Showing " + shownCount + " of " + TROPHIES.length + " trophies" +
    (earnedShown ? " (" + earnedShown + " earned)" : "") +
    (state.kind !== "all" ? " · " + KIND_LABELS[state.kind] : "") +
    (state.grade !== "all" ? " · " + gradeWord(state.grade) : "") +
    (state.query.trim() ? " · matching “" + state.query.trim() + "”" : "") + ".";
}

/* ---------- export / import / share ---------- */
function downloadFile(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportProgress() {
  downloadFile("gta6-trophy-progress.json", JSON.stringify({
    app: "Leonida Trophy Guide",
    game: "Grand Theft Auto VI",
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b),
    counts: state.counts,
    spoilersHidden: state.spoilersHidden,
  }, null, 2));
}

function applyImported(data) {
  if (!data || typeof data !== "object") throw new Error("Not a progress file.");
  const earned = data.earned;
  const ids = Array.isArray(earned)
    ? earned
    : (earned && typeof earned === "object" ? Object.keys(earned).filter((k) => earned[k]).map(Number) : null);
  if (!ids) throw new Error("No earned list in this file.");
  const next = {};
  ids.forEach((id) => {
    if (trophyById(Number(id))) next[Number(id)] = true;
  });
  state.earned = next;
  if (data.counts && typeof data.counts === "object") {
    const counts = {};
    Object.keys(data.counts).forEach((id) => {
      const t = trophyById(Number(id));
      if (t && t.count) counts[Number(id)] = Math.max(0, Math.min(t.count, Number(data.counts[id]) || 0));
    });
    state.counts = counts;
  }
  if (typeof data.spoilersHidden === "boolean") {
    state.spoilersHidden = data.spoilersHidden;
    document.getElementById("spoilerToggle").checked = state.spoilersHidden;
  }
  saveState();
  renderProgress();
  renderRoadmap();
  renderList();
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      applyImported(JSON.parse(String(reader.result)));
    } catch (err) {
      alert("That file could not be imported as trophy progress: " + err.message);
    }
  };
  reader.onerror = () => alert("That file could not be read.");
  reader.readAsText(file);
}

function shareLink() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  const earnedIds = Object.keys(state.earned).map(Number).sort((a, b) => a - b);
  if (earnedIds.length) url.searchParams.set("earned", earnedIds.join(","));
  if (!state.spoilersHidden) url.searchParams.set("spoilers", "off");
  const link = url.toString();
  const done = () => {
    const btn = document.getElementById("copyLinkBtn");
    btn.textContent = "Link copied";
    setTimeout(() => { btn.textContent = "Copy share link"; }, 2000);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(done, () => { prompt("Copy your progress link:", link); });
  } else {
    prompt("Copy your progress link:", link);
  }
}

/* Share links: ?earned=2,3,5 pre-ticks trophies, ?spoilers=off reveals
   story trophies, ?open=17 opens one trophy's guide on load, and
   ?scroll=roadmap jumps to the roadmap. Call only after the trophy
   data has loaded, because earned/open need trophyById. */
function applyShareParams() {
  const params = new URLSearchParams(window.location.search);
  const earned = params.get("earned");
  if (earned) {
    earned.split(",").forEach((raw) => {
      const id = Number(raw);
      if (trophyById(id)) state.earned[id] = true;
    });
  }
  if (params.get("spoilers") === "off") {
    state.spoilersHidden = false;
    document.getElementById("spoilerToggle").checked = false;
  }
  const open = Number(params.get("open"));
  if (trophyById(open)) state.open[open] = true;
  const kind = params.get("kind");
  if (kind && KIND_LABELS[kind]) {
    state.kind = kind;
    const listTitle = document.getElementById("listTitle");
    if (listTitle) listTitle.scrollIntoView({ block: "start", behavior: "instant" });
  }
  if (params.get("scroll") === "roadmap") {
    // Scrolled again after rendering in boot(): the roadmap list is
    // empty until renderRoadmap runs, so scrolling here lands short.
  }
}

/* ---------- wiring ---------- */
function wireControls() {
  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderList();
  });
  document.getElementById("gradeFilter").addEventListener("change", (event) => {
    state.grade = event.target.value;
    renderList();
  });
  document.getElementById("hideEarned").addEventListener("change", (event) => {
    state.hideEarned = event.target.checked;
    renderList();
  });
  document.getElementById("spoilerToggle").addEventListener("change", (event) => {
    state.spoilersHidden = event.target.checked;
    saveState();
    renderRoadmap();
    renderList();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = "";
  });
  document.getElementById("copyLinkBtn").addEventListener("click", shareLink);
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Clear all earned trophies and counts in this browser?")) return;
    state.earned = {};
    state.counts = {};
    saveState();
    renderProgress();
    renderRoadmap();
    renderList();
  });
}

/* ---------- boot ---------- */
async function boot() {
  loadSavedState();
  wireControls();
  document.getElementById("spoilerToggle").checked = state.spoilersHidden;
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    TROPHIES = data.trophies || [];
    LIST_META = data.list || "";
    if (TROPHIES.length !== 55) {
      document.getElementById("trophyList").textContent =
        "The trophy list did not load correctly (" + TROPHIES.length + " of 55). Reload the page.";
      return;
    }
  } catch (err) {
    document.getElementById("trophyList").textContent =
      "The trophy list could not be loaded. This guide needs its data file (app/data/trophies.json) served beside it: " + err.message;
    return;
  }
  // Share-link parameters need the loaded trophy list (trophyById).
  applyShareParams();
  renderProgress();
  renderKindFilters();
  renderRoadmap();
  renderList();
  // A shared link that opens a trophy (?open=17) scrolls to it, so the
  // guide is in view on arrival. A link asking for the roadmap
  // (?scroll=roadmap) scrolls there after rendering, when the roadmap
  // stages exist and the page has its final height.
  const params = new URLSearchParams(window.location.search);
  if (params.get("scroll") === "roadmap") {
    const target = document.getElementById("roadmap");
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
  }
  const opened = Number(params.get("open"));
  if (trophyById(opened)) {
    const card = document.getElementById("trophy-" + opened);
    if (card) card.scrollIntoView({ block: "start", behavior: "instant" });
  }
}

boot();
