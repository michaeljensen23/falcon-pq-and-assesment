import { MAX_EXTRACT_ROWS, MAX_NOTE_FIELD_CHARS } from "./limits";
import type {
  AccountRow,
  LiabilityRow,
  PqData,
  RealEstateRow,
} from "@/lib/pq/types";

export type ReconcileReport = {
  added: string[];
  updated: string[];
  removed: string[];
  summary: string;
};

const PARENT_NAME =
  /^(jp\s*morgan|jpmorgan|jpm|fidelity|schwab|vanguard|brokerage accounts|retirement accounts|deposit accounts)$/i;

export function normalizeLabel(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\*+$/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(inc|llc|lp|ltd|na|n a|bank|securities|investments?|strategy|self directed|rollover)\b/g, " ")
    .replace(/\bjp\s*morgan\b/g, "jpm")
    .replace(/\bgoldman\s*sachs\b/g, "gs")
    .replace(/\s+/g, " ")
    .trim();
}

export function accountNo(raw: string): string {
  const m = raw.match(/\bx\s?(\d{3,8})\b/i);
  return m?.[1] ?? "";
}

export function streetKey(raw: string): string {
  const m = raw.match(/(\d+)\s+([A-Za-z0-9]+)/);
  if (!m) return "";
  const street = m[2]!.toLowerCase().replace(/(st|nd|rd|th)$/, "");
  return `${m[1]}|${street}`;
}

export function labelsMatch(a: string, b: string): boolean {
  const aa = a.trim();
  const bb = b.trim();
  if (!aa || !bb) return false;
  if (aa.toLowerCase() === bb.toLowerCase()) return true;
  const aNo = accountNo(aa);
  const bNo = accountNo(bb);
  if (aNo && bNo && aNo === bNo) return true;
  const aStreet = streetKey(aa);
  const bStreet = streetKey(bb);
  if (aStreet && aStreet === bStreet) return true;
  const na = normalizeLabel(aa);
  const nb = normalizeLabel(bb);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 5 && nb.length >= 5 && (na.includes(nb) || nb.includes(na))) return true;
  return false;
}

export function pickLabel(existing: string, incoming: string): string {
  const next = incoming.trim();
  const cur = existing.trim();
  if (!next) return cur;
  if (!cur) return next;
  const curNo = accountNo(cur);
  const nextNo = accountNo(next);
  if (nextNo && !curNo) return next;
  if (curNo && !nextNo) return cur;
  if (next.length > cur.length + 6) return next;
  return cur;
}

export function pickText(existing: string, incoming: string): string {
  if (incoming.trim() && !existing.trim()) return incoming.trim();
  return existing;
}

export function pickMoney(existing: number, incoming: number): number {
  if (incoming) return incoming;
  return existing;
}

export function mergeNotes(existing: string, incoming: string, max = MAX_NOTE_FIELD_CHARS): string {
  const cur = existing.trim();
  const next = incoming.trim();
  if (!next) return cur;
  if (!cur) return next.slice(0, max);
  if (cur.includes(next)) return cur.slice(0, max);
  if (next.includes(cur) && next.length > cur.length) return next.slice(0, max);
  return `${cur}\n\n${next}`.slice(0, max);
}

function moneyOf(row: { marketValue?: number; amount?: number; deathBenefit?: number; currentAmount?: number }): number {
  return row.marketValue || row.amount || row.deathBenefit || row.currentAmount || 0;
}

export function dropParentTotals<T>(rows: T[], label: (row: T) => string, value: (row: T) => number): T[] {
  if (rows.length < 2) return rows;
  const keep = rows.map(() => true);
  for (let i = 0; i < rows.length; i++) {
    const parent = value(rows[i]!);
    if (parent <= 0) continue;
    const parentNo = accountNo(label(rows[i]!));
    const children: number[] = [];
    for (let j = 0; j < rows.length; j++) {
      if (i === j) continue;
      const v = value(rows[j]!);
      if (v <= 0 || v >= parent) continue;
      const childNo = accountNo(label(rows[j]!));
      if (!parentNo && childNo) {
        children.push(v);
        continue;
      }
      if (labelsMatch(label(rows[i]!), label(rows[j]!))) continue;
    }
    if (children.length >= 2) {
      const sum = children.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - parent) < 2) {
        keep[i] = false;
        continue;
      }
    }
    let seq = 0;
    let n = 0;
    for (let j = i + 1; j < rows.length; j++) {
      const v = value(rows[j]!);
      if (v <= 0) break;
      if (seq + v > parent + 1) break;
      seq += v;
      n += 1;
      if (Math.abs(seq - parent) < 1 && n >= 2) {
        keep[i] = false;
        break;
      }
    }
  }
  return rows.filter((row, i) => {
    if (!keep[i]) return false;
    const name = normalizeLabel(label(row));
    if (PARENT_NAME.test(name) && !accountNo(label(row))) {
      const hasSleeves = rows.some(
        (other, j) => j !== i && keep[j] && accountNo(label(other)) && value(other) > 0,
      );
      if (hasSleeves) return false;
    }
    return true;
  });
}

export function reconcileList<T>(
  existing: T[],
  incoming: T[],
  opts: {
    isFilled: (row: T) => boolean;
    label: (row: T) => string;
    overlay: (base: T, inc: T) => T;
    value?: (row: T) => number;
  },
): T[] {
  const out: T[] = existing.filter(opts.isFilled);
  for (const inc of incoming.filter(opts.isFilled)) {
    const idx = out.findIndex((row) => labelsMatch(opts.label(row), opts.label(inc)));
    if (idx >= 0) {
      out[idx] = opts.overlay(out[idx]!, inc);
    } else {
      out.push(inc);
    }
  }
  const valued = opts.value ?? ((row: T) => moneyOf(row as never));
  return dropParentTotals(out, opts.label, valued).slice(0, MAX_EXTRACT_ROWS);
}

function moneyLabel(n: number): string {
  if (!n) return "";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function rowLine(kind: string, label: string, value = 0): string {
  const m = moneyLabel(value);
  return m ? `${kind}: ${label} ${m}` : `${kind}: ${label}`;
}

function listDiff<T>(
  kind: string,
  before: T[],
  after: T[],
  label: (row: T) => string,
  value: (row: T) => number,
  filled: (row: T) => boolean,
): Pick<ReconcileReport, "added" | "updated" | "removed"> {
  const added: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];
  const used = new Set<number>();
  const a = after.filter(filled);
  const b = before.filter(filled);
  for (const row of a) {
    const idx = b.findIndex((prev, i) => !used.has(i) && labelsMatch(label(prev), label(row)));
    if (idx < 0) {
      added.push(rowLine(kind, label(row), value(row)));
      continue;
    }
    used.add(idx);
    if (Math.abs(value(b[idx]!) - value(row)) > 0.5) {
      updated.push(
        `${kind}: ${label(row)} ${moneyLabel(value(b[idx]!))} → ${moneyLabel(value(row))}`,
      );
    }
  }
  b.forEach((prev, i) => {
    if (!used.has(i)) removed.push(rowLine(kind, label(prev), value(prev)));
  });
  return { added, updated, removed };
}

export function diffPq(before: PqData, after: PqData): ReconcileReport {
  const chunks = [
    listDiff("Cash", before.cash, after.cash, (r) => r.description, (r) => r.marketValue, (r) => Boolean(r.description || r.marketValue)),
    listDiff("IRA/401k", before.deferred, after.deferred, (r) => r.custodian, (r) => r.marketValue, (r) => Boolean(r.custodian || r.marketValue)),
    listDiff("Roth", before.roth, after.roth, (r) => r.custodian, (r) => r.marketValue, (r) => Boolean(r.custodian || r.marketValue)),
    listDiff("Brokerage", before.investments, after.investments, (r) => r.custodian, (r) => r.marketValue, (r) => Boolean(r.custodian || r.marketValue)),
    listDiff("Property", before.realEstate, after.realEstate, (r) => r.description, (r) => r.marketValue, (r) => Boolean(r.description || r.marketValue)),
    listDiff("Business", before.business, after.business, (r) => r.description, (r) => r.marketValue, (r) => Boolean(r.description || r.marketValue)),
    listDiff("Debt", before.otherLiabilities, after.otherLiabilities, (r) => r.description, (r) => r.amount, (r) => Boolean(r.description || r.amount)),
    listDiff("Insurance", before.insurance, after.insurance, (r) => r.company || r.type, (r) => r.deathBenefit, (r) => Boolean(r.company || r.type || r.deathBenefit)),
    listDiff("Income", before.income, after.income, (r) => r.description, (r) => r.currentAmount, (r) => Boolean(r.description || r.currentAmount)),
  ];
  const added = chunks.flatMap((c) => c.added);
  const updated = chunks.flatMap((c) => c.updated);
  const removed = chunks.flatMap((c) => c.removed);
  const nameBefore = [before.client.firstName, before.client.lastName].filter(Boolean).join(" ");
  const nameAfter = [after.client.firstName, after.client.lastName].filter(Boolean).join(" ");
  if (nameAfter && nameAfter !== nameBefore) {
    updated.push(nameBefore ? `Client: ${nameBefore} → ${nameAfter}` : `Client: ${nameAfter}`);
  }
  const parts: string[] = [];
  if (added.length) parts.push(`Added ${added.length}`);
  if (updated.length) parts.push(`updated ${updated.length}`);
  if (removed.length) parts.push(`removed ${removed.length} duplicate${removed.length === 1 ? "" : "s"}`);
  const summary = parts.length
    ? `${parts.join(", ")}. Existing rows were matched by account number, address, or name — balances replaced, extra fields kept.`
    : "Already consistent. Matching accounts were updated in place; nothing new to add.";
  return { added, updated, removed, summary };
}

function foldRows<T>(
  rows: T[],
  label: (row: T) => string,
  overlay: (base: T, inc: T) => T,
  isFilled: (row: T) => boolean,
  value: (row: T) => number,
): T[] {
  return reconcileList([], rows, { isFilled, label, overlay, value });
}

function overlayAccount(base: AccountRow, inc: Partial<AccountRow>): AccountRow {
  return {
    ...base,
    custodian: pickLabel(base.custodian, inc.custodian ?? ""),
    marketValue: pickMoney(base.marketValue, inc.marketValue ?? 0),
    additions: pickMoney(base.additions, inc.additions ?? 0),
    extra: pickMoney(base.extra, inc.extra ?? 0),
    type: pickText(base.type, inc.type ?? ""),
    ownership: pickText(base.ownership, inc.ownership ?? ""),
    beneficiary: pickText(base.beneficiary, inc.beneficiary ?? ""),
    feePct: pickMoney(base.feePct, inc.feePct ?? 0),
  };
}

function overlayProperty(base: RealEstateRow, inc: Partial<RealEstateRow>): RealEstateRow {
  return {
    ...base,
    description: pickLabel(base.description, inc.description ?? ""),
    marketValue: pickMoney(base.marketValue, inc.marketValue ?? 0),
    liabilityAmount: pickMoney(base.liabilityAmount, inc.liabilityAmount ?? 0),
    rateTerm: pickText(base.rateTerm, inc.rateTerm ?? ""),
    payment: pickMoney(base.payment, inc.payment ?? 0),
    incomeEbt: pickMoney(base.incomeEbt, inc.incomeEbt ?? 0),
    acquisitionYear: pickText(base.acquisitionYear, inc.acquisitionYear ?? ""),
    purchasePrice: pickMoney(base.purchasePrice, inc.purchasePrice ?? 0),
    additions: pickMoney(base.additions, inc.additions ?? 0),
    ownership: pickText(base.ownership, inc.ownership ?? ""),
  };
}

/** Fold duplicates and parent totals already on the questionnaire. */
export function consolidatePq(pq: PqData): PqData {
  const next: PqData = {
    ...pq,
    cash: foldRows(
      pq.cash,
      (r) => r.description,
      (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        marketValue: pickMoney(a.marketValue, b.marketValue),
        intRate: pickText(a.intRate, b.intRate),
        owner: pickText(a.owner, b.owner),
      }),
      (r) => Boolean(r.description || r.marketValue),
      (r) => r.marketValue,
    ),
    deferred: foldRows(pq.deferred, (r) => r.custodian, overlayAccount, (r) => Boolean(r.custodian || r.marketValue), (r) => r.marketValue),
    roth: foldRows(pq.roth, (r) => r.custodian, overlayAccount, (r) => Boolean(r.custodian || r.marketValue), (r) => r.marketValue),
    investments: foldRows(
      pq.investments,
      (r) => r.custodian,
      overlayAccount,
      (r) => Boolean(r.custodian || r.marketValue),
      (r) => r.marketValue,
    ),
    realEstate: foldRows(
      pq.realEstate,
      (r) => r.description,
      overlayProperty,
      (r) => Boolean(r.description || r.marketValue),
      (r) => r.marketValue,
    ),
    business: foldRows(
      pq.business,
      (r) => r.description,
      (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        marketValue: pickMoney(a.marketValue, b.marketValue),
        costBasis: pickMoney(a.costBasis, b.costBasis),
        owner: pickText(a.owner, b.owner),
      }),
      (r) => Boolean(r.description || r.marketValue),
      (r) => r.marketValue,
    ),
    otherLiabilities: foldRows(
      pq.otherLiabilities,
      (r) => r.description,
      (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        amount: pickMoney(a.amount, b.amount),
        intRate: pickText(a.intRate, b.intRate),
        termPmt: pickText(a.termPmt, b.termPmt),
      }),
      (r) => Boolean(r.description || r.amount),
      (r) => r.amount,
    ),
    insurance: foldRows(
      pq.insurance,
      (r) => `${r.company} ${r.type}`,
      (a, b) => ({
        ...a,
        company: pickLabel(a.company, b.company),
        type: pickText(a.type, b.type),
        deathBenefit: pickMoney(a.deathBenefit, b.deathBenefit),
        insured: pickText(a.insured, b.insured),
        owner: pickText(a.owner, b.owner),
        policyDate: pickText(a.policyDate, b.policyDate),
        annualPremium: pickMoney(a.annualPremium, b.annualPremium),
        cashValue: pickMoney(a.cashValue, b.cashValue),
        beneficiary: pickText(a.beneficiary, b.beneficiary),
      }),
      (r) => Boolean(r.company || r.type || r.deathBenefit),
      (r) => r.deathBenefit,
    ),
    income: foldRows(
      pq.income,
      (r) => r.description,
      (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        currentAmount: pickMoney(a.currentAmount, b.currentAmount),
        futureRetirementAmount: pickMoney(a.futureRetirementAmount, b.futureRetirementAmount),
        type: pickText(a.type, b.type),
        startDate: pickText(a.startDate, b.startDate),
        owner: pickText(a.owner, b.owner),
        survivorCola: pickText(a.survivorCola, b.survivorCola),
      }),
      (r) => Boolean(r.description || r.currentAmount),
      (r) => r.currentAmount,
    ),
    children: foldRows(
      pq.children,
      (r) => r.name,
      (a, b) => ({ ...a, name: pickLabel(a.name, b.name), age: pickText(a.age, b.age) }),
      (r) => Boolean(r.name),
      () => 0,
    ),
  };

  // Mortgages that landed in other debts belong on the matching property.
  const keptDebts: LiabilityRow[] = [];
  for (const debt of next.otherLiabilities) {
    if (!/mortgage|heloc|provident funding/i.test(debt.description)) {
      keptDebts.push(debt);
      continue;
    }
    const home = next.realEstate.find((p) => p.liabilityAmount === 0 || p.liabilityAmount === debt.amount);
    if (home && debt.amount) {
      home.liabilityAmount = pickMoney(home.liabilityAmount, debt.amount);
    } else {
      keptDebts.push(debt);
    }
  }
  next.otherLiabilities = keptDebts;
  return next;
}

export function compactSnapshot(pq: PqData): string {
  const lines: string[] = [];
  const name = [pq.client.firstName, pq.client.lastName].filter(Boolean).join(" ");
  if (name) lines.push(`Client: ${name}`);
  if (pq.address.city) lines.push(`Address: ${pq.address.city} ${pq.address.state}`.trim());
  const push = (kind: string, label: string, value: number) => {
    if (label.trim() || value) lines.push(rowLine(kind, label || "(unnamed)", value));
  };
  for (const r of pq.cash) push("Cash", r.description, r.marketValue);
  for (const r of pq.deferred) push("IRA/401k", r.custodian, r.marketValue);
  for (const r of pq.roth) push("Roth", r.custodian, r.marketValue);
  for (const r of pq.investments) push("Brokerage", r.custodian, r.marketValue);
  for (const r of pq.realEstate) {
    if (r.description || r.marketValue) {
      lines.push(
        `Property: ${r.description} ${moneyLabel(r.marketValue)}${r.liabilityAmount ? ` mtg ${moneyLabel(r.liabilityAmount)}` : ""}`,
      );
    }
  }
  for (const r of pq.business) push("Business", r.description, r.marketValue);
  for (const r of pq.otherLiabilities) push("Debt", r.description, r.amount);
  return lines.join("\n").slice(0, 6_000);
}

export function formatReport(report: ReconcileReport): string {
  const blocks = [report.summary];
  if (report.updated.length) blocks.push(`Updated\n${report.updated.map((l) => `• ${l}`).join("\n")}`);
  if (report.added.length) blocks.push(`Added\n${report.added.map((l) => `• ${l}`).join("\n")}`);
  if (report.removed.length) blocks.push(`Removed duplicates\n${report.removed.map((l) => `• ${l}`).join("\n")}`);
  return blocks.join("\n\n").slice(0, 4_000);
}
