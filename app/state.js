/* Trophy Atlas — saved progress.
   Everything lives in localStorage under one key, so the guide works
   offline and remembers the player between visits. Export writes a JSON
   file the reader can keep; import reads that file back. No network is
   ever used: the only "URLs" here are the local data file name and the
   blob the browser makes for the download. */

export const STORAGE_KEY = "trophy-atlas-gta6-v1";
export const DATA_URL = "data/trophies.json";

/* The shape we keep: { earned: {id: true}, counts: {id: number},
   spoiler: boolean, hideEarned: boolean, kind: string, grade: string } */
export function blankState() {
  return {
    earned: {},
    counts: {},
    spoiler: true,
    hideEarned: false,
    kind: "all",
    grade: "all",
    query: "",
  };
}

export function loadState() {
  const state = blankState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const saved = JSON.parse(raw);
    if (saved && typeof saved === "object") {
      if (saved.earned && typeof saved.earned === "object") state.earned = saved.earned;
      if (saved.counts && typeof saved.counts === "object") state.counts = saved.counts;
      if (typeof saved.spoiler === "boolean") state.spoiler = saved.spoiler;
      if (typeof saved.hideEarned === "boolean") state.hideEarned = saved.hideEarned;
      if (typeof saved.kind === "string") state.kind = saved.kind;
      if (typeof saved.grade === "string") state.grade = saved.grade;
    }
  } catch {
    /* A corrupt save is ignored: the guide still opens, empty. */
  }
  return state;
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Private mode or a full store: the page keeps working in memory. */
  }
}

export function earnedCount(state, trophies) {
  return trophies.reduce((n, t) => n + (state.earned[t.id] ? 1 : 0), 0);
}

export function gradeCounts(state, trophies) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    const slot = out[t.grade];
    if (!slot) continue;
    slot[1] += 1;
    if (state.earned[t.id]) slot[0] += 1;
  }
  return out;
}

/* Counts for trophies that track a total (250 stunts, 100 vehicles...).
   Reaching the total marks the trophy earned automatically. */
export function setCount(state, trophy, value) {
  const total = trophy.count;
  if (typeof total !== "number") return;
  const clamped = Math.max(0, Math.min(total, Math.floor(value)));
  state.counts[trophy.id] = clamped;
  /* Reaching the total marks the trophy earned. Lowering the count
     never un-earns it: a manual tick stays a manual tick. */
  if (clamped >= total) state.earned[trophy.id] = true;
  saveState(state);
}

export function toggleEarned(state, trophy) {
  if (state.earned[trophy.id]) delete state.earned[trophy.id];
  else state.earned[trophy.id] = true;
  saveState(state);
}

/* Download the current progress as a JSON file. */
export function exportProgress(state) {
  const payload = {
    app: "trophy-atlas-gta6",
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).filter((id) => state.earned[id]),
    counts: state.counts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gta6-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Read a progress file back. Returns {ok, error?} and mutates state. */
export async function importProgress(state, file, trophies) {
  const known = new Set(trophies.map((t) => t.id));
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }
  if (!data || typeof data !== "object" || !Array.isArray(data.earned)) {
    return { ok: false, error: "That file is not a Trophy Atlas export." };
  }
  const earned = {};
  for (const id of data.earned) if (known.has(id)) earned[id] = true;
  const counts = {};
  if (data.counts && typeof data.counts === "object") {
    for (const [id, n] of Object.entries(data.counts)) {
      if (known.has(id) && Number.isFinite(n)) counts[id] = Math.max(0, Math.floor(n));
    }
  }
  /* A count that already reached its trophy's total earns it, the same
     as tapping + up to the total would. */
  for (const trophy of trophies) {
    if (typeof trophy.count === "number" && (counts[trophy.id] || 0) >= trophy.count) {
      earned[trophy.id] = true;
    }
  }
  state.earned = earned;
  state.counts = counts;
  saveState(state);
  return { ok: true, imported: Object.keys(earned).length };
}

export async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error("trophy data failed to load");
  const data = await response.json();
  const list = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(list)) throw new Error("trophy data has no list");
  return list;
}
