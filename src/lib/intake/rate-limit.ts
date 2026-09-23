type Bucket = { last: number; hourStart: number; hourCount: number };

const store: Map<string, Bucket> =
  ((globalThis as { __falconRate?: Map<string, Bucket> }).__falconRate ??= new Map());

const TWO_HOURS = 2 * 60 * 60 * 1000;

function prune(now: number) {
  if (store.size < 400) return;
  for (const [key, bucket] of store) {
    if (now - bucket.last > TWO_HOURS) store.delete(key);
  }
}

/** Process-local cooldown + hourly cap. Fail closed with a public message. */
export function consumeRateLimit(
  key: string,
  cooldownMs: number,
  hourlyCap: number,
): { ok: true } | { ok: false; error: string } {
  const now = Date.now();
  prune(now);
  let bucket = store.get(key);
  if (!bucket) {
    bucket = { last: 0, hourStart: now, hourCount: 0 };
    store.set(key, bucket);
  }
  if (now - bucket.hourStart >= 60 * 60 * 1000) {
    bucket.hourStart = now;
    bucket.hourCount = 0;
  }
  if (now - bucket.last < cooldownMs) {
    return { ok: false, error: "Please wait a moment and try again." };
  }
  if (bucket.hourCount >= hourlyCap) {
    return { ok: false, error: "That action is limited for this hour. Try again later." };
  }
  bucket.last = now;
  bucket.hourCount += 1;
  return { ok: true };
}