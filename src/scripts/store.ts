// ---------------------------------------------------------------------------
// Client-side persistence for the no-account tracking features.
// Everything lives in localStorage: chosen subjects, papers marked done,
// bookmarked papers. Storage keys are namespaced, harmless to clear, and
// degrade gracefully (empty set) if storage is unavailable.
// ---------------------------------------------------------------------------
const NAMESPACE = "paperline";

export const KEYS = {
  chosen: `${NAMESPACE}.subjects`,
  done: `${NAMESPACE}.done`,
  starred: `${NAMESPACE}.starred`,
} as const;

/** Falls back to a throwaway set when localStorage is unavailable (private mode). */
function safeRead(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

function safeWrite(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent("paperline:changed", { detail: key }));
  } catch {
    /* storage disabled — keep the session state in memory only */
  }
}

export function loadSet(key: string): Set<string> {
  return safeRead(key);
}

export function saveSet(key: string, set: Set<string>) {
  safeWrite(key, set);
}

/** Toggle a value in a persisted set; returns the new state. */
export function toggleInSet(key: string, value: string): boolean {
  const set = safeRead(key);
  const added = !set.has(value);
  if (added) set.add(value);
  else set.delete(value);
  safeWrite(key, set);
  return added;
}

/** True if the persisted set contains the value (read-only check). */
export function hasInSet(key: string, value: string): boolean {
  return safeRead(key).has(value);
}

/** Stable identifier for one paper variant row: 9702_s25_32 */
export function paperId(code: string, year: number, session: string, p: number, v: number): string {
  return `${code}_${session}${String(year).slice(2)}_${p}${v}`;
}
