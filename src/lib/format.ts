export function formatMoney(value: number, opts?: { compact?: boolean; cents?: boolean }) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (opts?.compact && abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return `${sign}$${n.toFixed(n >= 10 ? 1 : 2)}M`;
  }
  if (opts?.compact && abs >= 1_000) {
    const n = abs / 1_000;
    return `${sign}$${n.toFixed(n >= 100 ? 0 : 1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts?.cents ? 2 : 0,
    minimumFractionDigits: opts?.cents ? 2 : 0,
  }).format(value);
}

export function formatPct(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function parseMoney(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function ageFromDob(dob: string, asOf = new Date()): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  let age = asOf.getFullYear() - d.getFullYear();
  const m = asOf.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

export function displayName(first: string, last: string, nickname?: string) {
  const f = first.trim();
  const l = last.trim();
  const n = nickname?.trim();
  if (!f && !l) return "Unnamed household";
  if (n) return `${f} “${n}” ${l}`.trim();
  return `${f} ${l}`.trim();
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeSaved(iso?: string | null) {
  if (!iso) return "Not saved";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "Saved";
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 8) return "Saved";
  if (s < 60) return "Saved just now";
  if (s < 3600) return `Saved ${Math.floor(s / 60)}m ago`;
  return `Saved ${formatDate(iso)}`;
}
