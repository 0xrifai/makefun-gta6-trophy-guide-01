/* Trophy Atlas — filters, search and the spoiler setting.
   A trophy passes when it matches the chosen kind, the chosen grade,
   the search words, and the hide-earned switch. The spoiler setting
   does not filter anything out: it only masks what a story trophy
   shows until it is earned (that masking lives in cards.js). */

export const KIND_LABELS = {
  all: "All kinds",
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  completion: "Completion",
  online: "Online",
};

export const KIND_ORDER = ["all", "story", "missable", "collectibles", "activities", "completion", "online"];
export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

export function kindOf(trophy) {
  return trophy.kind || "activities";
}

/* The "missable" chip is a virtual kind: it matches any trophy whose
   missable flag is set, whatever its real kind is. */
export function matchesKind(trophy, kind) {
  if (kind === "all") return true;
  if (kind === "missable") return trophy.missable === true;
  if (kind === "online") return false; /* The list holds no online trophies. */
  return kindOf(trophy) === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === "all" || trophy.grade === grade;
}

export function matchesQuery(trophy, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, kindOf(trophy), trophy.grade]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function visibleTrophies(trophies, state) {
  return trophies.filter(
    (t) =>
      matchesKind(t, state.kind) &&
      matchesGrade(t, state.grade) &&
      matchesQuery(t, state.query) &&
      !(state.hideEarned && state.earned[t.id]),
  );
}

export function kindCounts(trophies) {
  const out = { all: trophies.length, online: 0 };
  for (const t of trophies) {
    const k = kindOf(t);
    out[k] = (out[k] || 0) + 1;
    if (t.missable) out.missable = (out.missable || 0) + 1;
  }
  return out;
}

/* A story trophy is spoiled when the spoiler setting is on and the
   player has not earned it yet: hide its name, description and guide. */
export function isSpoiled(trophy, state) {
  return state.spoiler && kindOf(trophy) === "story" && !state.earned[trophy.id];
}
