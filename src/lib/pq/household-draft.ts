import { emptyPq } from "./empty";
import type { PqData } from "./types";
import { MAX_PQ_JSON_CHARS } from "@/lib/intake/limits";

const PREFIX = "falcon-household-draft:";

type Draft = { pq: PqData; savedAt: string };

function key(id: string) {
  return `${PREFIX}${id}`;
}

function parseDraft(raw: string): Draft | null {
  if (raw.length > MAX_PQ_JSON_CHARS + 200) return null;
  const parsed = JSON.parse(raw, (k, value) => {
    if (k === "__proto__" || k === "constructor" || k === "prototype") return undefined;
    return value;
  }) as Draft;
  if (!parsed?.pq || typeof parsed.pq !== "object" || Array.isArray(parsed.pq)) return null;
  return { pq: { ...emptyPq(), ...parsed.pq }, savedAt: parsed.savedAt || new Date().toISOString() };
}

export function loadHouseholdDraft(id: string): Draft | null {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = window.localStorage.getItem(key(id));
    if (!raw) return null;
    return parseDraft(raw);
  } catch {
    return null;
  }
}

export function saveHouseholdDraft(id: string, pq: PqData) {
  if (typeof window === "undefined" || !id) return;
  try {
    const draft: Draft = { pq, savedAt: new Date().toISOString() };
    window.localStorage.setItem(key(id), JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

export function clearHouseholdDraft(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    window.localStorage.removeItem(key(id));
  } catch {
    /* private mode */
  }
}
