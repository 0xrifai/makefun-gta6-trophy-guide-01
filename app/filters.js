/* Leonida Trophy Atlas — filters, search and the spoiler setting.
   A trophy shows when it matches the chosen kind, the chosen grade, the
   search words, and the hide-earned switch. The spoiler setting filters
   nothing out: it only masks what a story trophy shows until it is
   earned (that masking lives in cards.js). */

export const KIND_NAMES = {
  all: "All kinds",
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  completion: "Completion",
  online: "Online",
};

export const KIND_LIST = ["all", "story", "missable", "collectibles", "activities", "completion", "online"];
export const GRADE_LIST = ["platinum", "gold", "silver", "bronze"];

export function kindOf(trophy) {
  return trophy.kind || "activities";
}

/* The "missable" chip is a virtual kind: it matches any trophy whose
   missable flag is set, whatever its real kind is. */
export function kindMatches(trophy, kind) {
  if (kind === "all") return true;
  if (kind === "missable") return trophy.missable === true;
  if (kind === "online") return false; /* The list holds no online trophies. */
  return kindOf(trophy) === kind;
}

export function gradeMatches(trophy, grade) {
  return grade === "all" || trophy.grade === grade;
}

export function queryMatches(trophy, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, kindOf(trophy), trophy.grade]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function applyFilters(trophies, progress) {
  return trophies.filter(
    (trophy) =>
      kindMatches(trophy, progress.kind) &&
      gradeMatches(trophy, progress.grade) &&
      queryMatches(trophy, progress.query) &&
      !(progress.hideEarned && progress.earned[trophy.id]),
  );
}

export function kindTotals(trophies) {
  const out = { all: trophies.length, online: 0 };
  for (const trophy of trophies) {
    const kind = kindOf(trophy);
    out[kind] = (out[kind] || 0) + 1;
    if (trophy.missable) out.missable = (out.missable || 0) + 1;
  }
  return out;
}

/* A story trophy is masked when the spoiler setting is on and the player
   has not earned it yet: hide its name, description and guide. */
export function isMasked(trophy, progress) {
  return progress.spoiler && kindOf(trophy) === "story" && !progress.earned[trophy.id];
}
