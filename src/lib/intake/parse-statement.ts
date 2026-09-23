import type { IntakeExtract } from "./merge";

export const LOCAL_STATEMENT_MIN_ROWS = 3;

const SKIP =
  /^(total|net assets|net worth|confidential|assets\*?|liabilities|liquid assets|deposit accounts|brokerage accounts|retirement accounts|income|cash flow|$)/i;

const MONTH =
  /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)\.?,?$/i;

const SCALE_RE =
  /\$\s*\(?\s*,?0{3}\)?|\(\s*,?000\s*\)|in thousands|amounts in 000|\$000s|\[SCALE:/i;

function parseMoney(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function splitName(label: string): { firstName: string; lastName: string } | null {
  const m = label.match(/^([A-Z][a-z]+)\s+([A-Z][a-zA-Z'-]+)\s*(?:-|–|—)/);
  if (!m) return null;
  return { firstName: m[1]!, lastName: m[2]! };
}

type Bucket = "cash" | "deferred" | "roth" | "investments" | "realEstate" | "business" | "liability" | "mortgage" | "skip";

function bucket(label: string): Bucket {
  const t = label.toLowerCase().replace(/\*+$/, "").trim();
  if (SKIP.test(t) || MONTH.test(t) || /total [a-z]|grand total/.test(t)) return "skip";
  if (/credit cards?|mercedes benz financial|auto loan|student loan|margin/.test(t)) return "liability";
  if (/provident funding|mortgage|heloc\b/.test(t)) return "mortgage";
  if (/\b(llc|l\.?p\.?|partnership|k-?1)\b/.test(t) || /properties$/.test(t)) return "business";
  if (/\d+\s+\S+.*(st|street|ave|avenue|blvd|rd|road|dr|drive|ln|lane|way|ct|court)\b/i.test(t)) {
    return "realEstate";
  }
  if (/\broth\b|\bhsa\b/.test(t)) return "roth";
  if (/\b(ira|401\s*\(?k\)?|403\s*\(?b\)?|457|rollover|roll'?r ira|sep|simple|pension)\b/.test(t)) {
    return "deferred";
  }
  if (
    /citibank|\bciti\b|chase|goldman|\bgs bank\b|wells fargo|schwab investor|money market|\b(bank|checking|savings|\bcd\b|deposit)\b/.test(
      t,
    )
  ) {
    return "cash";
  }
  if (/\b(brokerage|securities|fidelity|jp ?morgan|jpm|schwab|vanguard|coinbase|strategy|self-directed|etf|index)\b/.test(t)) {
    return "investments";
  }
  return "investments";
}

function dropParentTotals<T extends { marketValue?: number; amount?: number }>(rows: T[]): T[] {
  if (rows.length < 2) return rows;
  const val = (r: T) => r.marketValue ?? r.amount ?? 0;
  const keep = rows.map(() => true);
  for (let i = 0; i < rows.length; i++) {
    const parent = val(rows[i]!);
    if (parent <= 0) continue;
    let sum = 0;
    let n = 0;
    for (let j = i + 1; j < rows.length; j++) {
      const v = val(rows[j]!);
      if (v <= 0) break;
      if (sum + v > parent + 1) break;
      sum += v;
      n += 1;
      if (Math.abs(sum - parent) < 1 && n >= 2) {
        keep[i] = false;
        break;
      }
    }
  }
  return rows.filter((_, i) => keep[i]);
}

function pairsFrom(text: string): { label: string; value: number }[] {
  const lines = text
    .split(/\r?\n/)
    .slice(0, 4_000)
    .map((l) => l.replace(/\s+/g, " ").trim().slice(0, 400))
    .filter(Boolean);
  const out: { label: string; value: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trailing = line.match(/^(.*?)[\s:]+(-?\$?\d[\d,]*\.?\d*)\s*$/);
    if (trailing && trailing[1] && parseMoney(trailing[2] ?? "") != null && /[A-Za-z]{2,}/.test(trailing[1])) {
      out.push({ label: trailing[1].trim(), value: parseMoney(trailing[2]!)! });
      continue;
    }
    const onlyNum = parseMoney(line);
    if (onlyNum != null && i > 0 && /[A-Za-z]{2,}/.test(lines[i - 1]!) && parseMoney(lines[i - 1]!) == null) {
      out.push({ label: lines[i - 1]!, value: onlyNum });
    }
  }
  return out;
}

export function statementRowCount(extract: IntakeExtract): number {
  return (
    (extract.cash?.length ?? 0) +
    (extract.deferred?.length ?? 0) +
    (extract.roth?.length ?? 0) +
    (extract.investments?.length ?? 0) +
    (extract.realEstate?.length ?? 0) +
    (extract.business?.length ?? 0) +
    (extract.otherLiabilities?.length ?? 0)
  );
}

export function isRichStatement(extract: IntakeExtract): boolean {
  return statementRowCount(extract) >= LOCAL_STATEMENT_MIN_ROWS;
}

/** Map labeled statement text (balances, $000s, sleeves) into a PQ extract without calling Grok. */
export function parseStatementText(text: string): IntakeExtract {
  const scale = SCALE_RE.test(text) ? 1000 : 1;
  const extract: IntakeExtract = {
    cash: [],
    deferred: [],
    roth: [],
    investments: [],
    realEstate: [],
    business: [],
    otherLiabilities: [],
    sectionNotes: {},
  };

  const nameLine = text.split(/\n/).find((l) => /balance sheet/i.test(l));
  if (nameLine) {
    const named = splitName(nameLine.trim());
    if (named) extract.client = named;
  }

  let lastProperty: NonNullable<IntakeExtract["realEstate"]>[number] | null = null;
  const owner = extract.client ? [extract.client.firstName, extract.client.lastName].filter(Boolean).join(" ") : "";

  for (const { label, value } of pairsFrom(text)) {
    const kind = bucket(label);
    if (kind === "skip") continue;
    const money = value * scale;
    if (kind === "mortgage") {
      if (lastProperty) lastProperty.liabilityAmount = (lastProperty.liabilityAmount ?? 0) + money;
      else {
        extract.otherLiabilities!.push({ description: label.replace(/\*+$/, "").trim(), amount: money });
      }
      continue;
    }
    if (kind === "liability") {
      extract.otherLiabilities!.push({ description: label.replace(/\*+$/, "").trim(), amount: money });
      continue;
    }
    if (kind === "cash") {
      extract.cash!.push({ description: label.replace(/\*+$/, "").trim(), marketValue: money, owner });
      continue;
    }
    if (kind === "deferred") {
      extract.deferred!.push({
        custodian: label.replace(/\*+$/, "").trim(),
        marketValue: money,
        type: /401/.test(label) ? "401(k)" : /roth/i.test(label) ? "Roth IRA" : "Rollover IRA",
        ownership: owner,
      });
      continue;
    }
    if (kind === "roth") {
      extract.roth!.push({
        custodian: label.replace(/\*+$/, "").trim(),
        marketValue: money,
        type: /hsa/i.test(label) ? "HSA" : "Roth IRA",
        ownership: owner,
      });
      continue;
    }
    if (kind === "realEstate") {
      const city = label.match(/,\s*([^,]+)$/)?.[1]?.trim() ?? "";
      lastProperty = {
        description: label.replace(/\*+$/, "").trim(),
        marketValue: money,
        liabilityAmount: 0,
        ownership: owner || "Client",
      };
      extract.realEstate!.push(lastProperty);
      if (city && !extract.address?.city) {
        const state = /manhattan beach/i.test(city) ? "CA" : "";
        extract.address = { city: city.replace(/\s+/g, " "), state, country: "USA" };
      }
      continue;
    }
    if (kind === "business") {
      extract.business!.push({
        description: label.replace(/\*+$/, "").trim(),
        marketValue: money,
        owner,
      });
      lastProperty = null;
      continue;
    }
    extract.investments!.push({
      custodian: label.replace(/\*+$/, "").trim(),
      marketValue: money,
      type: /crypto|coinbase/i.test(label) ? "Crypto" : "Brokerage",
      ownership: owner,
    });
    lastProperty = null;
  }

  extract.cash = dropParentTotals(extract.cash!);
  extract.investments = dropParentTotals(extract.investments!);
  extract.deferred = dropParentTotals(extract.deferred!);
  extract.business = dropParentTotals(extract.business!);

  const notes: string[] = [];
  if (/held in my name/i.test(text)) notes.push("All assets titled in the client's name.");
  const custody =
    text.match(/The property at[\s\S]{0,320}?not been reduced to reflect those right\.?/i) ??
    text.match(/custody agreement[\s\S]{0,180}/i);
  if (custody) {
    extract.sectionNotes!["real-estate"] = custody[0].replace(/\s+/g, " ").trim();
  }
  const dloc = text.match(/\*\*\*[\s\S]{0,700}/i) ?? text.match(/dloc[\s\S]{0,400}/i);
  if (dloc) {
    extract.sectionNotes!["business"] = `Valuation notes: ${dloc[0].replace(/\s+/g, " ").trim()}`;
  }
  if (notes.length) extract.sectionNotes!["opening"] = notes.join(" ");

  if (statementRowCount(extract) > 0) {
    extract.summary = `Filled from the uploaded statement${scale === 1000 ? " (figures in thousands, stored as dollars)" : ""}. Review sleeves, mortgages, and entity discounts before the assessment.`;
  }

  return extract;
}

export function parseSourcesToExtract(texts: string[]): IntakeExtract {
  const merged: IntakeExtract = {};
  for (const text of texts) {
    if (!text.trim()) continue;
    const next = parseStatementText(text);
    merged.client = merged.client ?? next.client;
    merged.address = merged.address ?? next.address;
    merged.cash = [...(merged.cash ?? []), ...(next.cash ?? [])];
    merged.deferred = [...(merged.deferred ?? []), ...(next.deferred ?? [])];
    merged.roth = [...(merged.roth ?? []), ...(next.roth ?? [])];
    merged.investments = [...(merged.investments ?? []), ...(next.investments ?? [])];
    merged.realEstate = [...(merged.realEstate ?? []), ...(next.realEstate ?? [])];
    merged.business = [...(merged.business ?? []), ...(next.business ?? [])];
    merged.otherLiabilities = [...(merged.otherLiabilities ?? []), ...(next.otherLiabilities ?? [])];
    merged.sectionNotes = { ...(merged.sectionNotes ?? {}), ...(next.sectionNotes ?? {}) };
    if (!merged.summary) merged.summary = next.summary;
  }
  return merged;
}
