import { HAMMARTH_PQ } from "./hammarth";
import type { PqData } from "./types";

const KEY = "falcon-demo-pq";

export function loadDemoPq(): PqData {
  if (typeof window === "undefined") return structuredClone(HAMMARTH_PQ);
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PqData;
  } catch {
    /* ignore */
  }
  return structuredClone(HAMMARTH_PQ);
}

export function saveDemoPq(pq: PqData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(pq));
  } catch {
    /* ignore */
  }
}
