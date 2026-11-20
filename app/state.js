/* Leonida Trophy Atlas — saved progress.
   Everything the reader ticks lives in localStorage under one key, so the
   guide works offline and remembers them between visits. Export writes a
   JSON file the reader can keep as a backup; import reads that file back.
   Nothing here ever touches the network. */

export const SAVE_KEY = "leonida-atlas-gta6-v2";
export const DATA_PATH = "data/trophies.json";

/* The saved shape: { earned: {id: true}, counts: {id: number},
   spoiler: boolean, hideEarned: boolean, kind: string, grade: string } */
export function freshProgress() {
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

export function readProgress() {
  const progress = freshProgress();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return progress;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return progress;
    if (saved.earned && typeof saved.earned === "object") progress.earned = saved.earned;
    if (saved.counts && typeof saved.counts === "object") progress.counts = saved.counts;
    if (typeof saved.spoiler === "boolean") progress.spoiler = saved.spoiler;
    if (typeof saved.hideEarned === "boolean") progress.hideEarned = saved.hideEarned;
    if (typeof saved.kind === "string") progress.kind = saved.kind;
    if (typeof saved.grade === "string") progress.grade = saved.grade;
  } catch {
    /* A corrupt save is ignored: the guide still opens, empty. */
  }
  return progress;
}

export function writeProgress(progress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  } catch {
    /* Private mode or a full store: the page keeps working in memory. */
  }
}

export function countEarned(progress, trophies) {
  let n = 0;
  for (const trophy of trophies) if (progress.earned[trophy.id]) n += 1;
  return n;
}

export function countByGrade(progress, trophies) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    const slot = out[trophy.grade];
    if (!slot) continue;
    slot[1] += 1;
    if (progress.earned[trophy.id]) slot[0] += 1;
  }
  return out;
}

export function toggleEarned(progress, trophyId) {
  if (progress.earned[trophyId]) delete progress.earned[trophyId];
  else progress.earned[trophyId] = true;
}

export function counterValue(progress, trophy) {
  const n = Number(progress.counts[trophy.id] ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.min(n, trophy.count ?? n) : 0;
}

export function bumpCounter(progress, trophy, delta) {
  if (!trophy.count) return;
  const next = counterValue(progress, trophy) + delta;
  progress.counts[trophy.id] = Math.max(0, Math.min(trophy.count, next));
}

export function exportText(progress) {
  return JSON.stringify(
    { app: "leonida-trophy-atlas-gta6", version: 2, savedAt: new Date().toISOString(), progress },
    null,
    2,
  );
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  const progress = parsed && typeof parsed === "object" ? (parsed.progress ?? parsed) : null;
  if (!progress || typeof progress !== "object") throw new Error("not a progress file");
  const clean = freshProgress();
  if (progress.earned && typeof progress.earned === "object") clean.earned = progress.earned;
  if (progress.counts && typeof progress.counts === "object") clean.counts = progress.counts;
  if (typeof progress.spoiler === "boolean") clean.spoiler = progress.spoiler;
  if (typeof progress.hideEarned === "boolean") clean.hideEarned = progress.hideEarned;
  return clean;
}

export function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
