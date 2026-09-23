import { ageFromDob, formatMoney, formatPct } from "@/lib/format";
import { SECTIONS, type SectionId } from "./sections";
import type {
  AccountRow,
  AdvisorContact,
  BusinessRow,
  CashRow,
  IncomeRow,
  InsuranceRow,
  LiabilityRow,
  Person,
  PqData,
  RealEstateRow,
} from "./types";

export type FactPair = { k: string; v: string };

export type FactItem =
  | { kind: "pairs"; pairs: FactPair[] }
  | { kind: "row"; title: string; detail?: string; amount?: string }
  | { kind: "note"; text: string; heading?: string }
  | { kind: "empty" };

export type SectionFacts = {
  id: SectionId;
  number: string;
  label: string;
  prompt: string;
  items: FactItem[];
  notes: string;
};

function filled(v: string | number | boolean | undefined) {
  if (typeof v === "number") return v !== 0;
  if (typeof v === "boolean") return v;
  return Boolean(v && String(v).trim());
}

function rowFilled(obj: Record<string, unknown>, keys: string[]) {
  return keys.some((k) => filled(obj[k] as string | number | boolean));
}

function money(n: number) {
  return formatMoney(n);
}

function formatDob(iso: string) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const label = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const age = ageFromDob(iso);
  return age ? `${label} (age ${age})` : label;
}

function personName(p: Person) {
  const nick = p.nickname.trim();
  const core = [p.firstName, p.lastName].filter(Boolean).join(" ");
  if (nick && p.firstName && nick.toLowerCase() !== p.firstName.toLowerCase()) {
    return `${p.firstName} “${nick}” ${p.lastName}`.trim();
  }
  return core;
}

function join(parts: (string | number | undefined | null)[], sep = " · ") {
  return parts
    .map((p) => (typeof p === "number" ? String(p) : (p ?? "").trim()))
    .filter((p) => p && p !== "0")
    .join(sep);
}

function personPairs(p: Person, role: string): FactPair[] {
  const pairs: FactPair[] = [];
  const name = personName(p);
  if (name) pairs.push({ k: role, v: name });
  if (p.dob) pairs.push({ k: "Date of birth", v: formatDob(p.dob) });
  const marital = join([p.maritalStatus, p.yearsMarried ? `${p.yearsMarried} years` : ""]);
  if (marital) pairs.push({ k: "Marital status", v: marital });
  if (p.jobTitle) pairs.push({ k: "Occupation", v: p.jobTitle });
  if (p.employer) pairs.push({ k: "Employer", v: p.employer });
  if (p.yearsAtJob) pairs.push({ k: "Years in role", v: p.yearsAtJob });
  if (p.retirementAge) pairs.push({ k: "Retirement age", v: p.retirementAge });
  return pairs;
}

function advisorPairs(label: string, a: AdvisorContact): FactPair[] {
  const name = join([a.name, a.firm]);
  if (!name && !a.notes && !a.preference && !a.commitment) return [];
  const flags = [a.preference ? "Preference" : "", a.commitment ? "Commitment" : ""].filter(Boolean);
  const pairs: FactPair[] = [{ k: label, v: name || "—" }];
  if (flags.length) pairs.push({ k: `${label} status`, v: flags.join(" · ") });
  if (a.notes) pairs.push({ k: `${label} notes`, v: a.notes });
  return pairs;
}

function accountRow(r: AccountRow, extraLabel: string): FactItem {
  const title = join([r.custodian, r.type], " · ") || "Account";
  const detail = join([
    r.ownership ? `Owner ${r.ownership}` : "",
    r.beneficiary ? `Beneficiary ${r.beneficiary}` : "",
    r.additions ? `Additions ${money(r.additions)}` : "",
    r.extra ? `${extraLabel} ${money(r.extra)}` : "",
    r.feePct ? `Fee ${formatPct(r.feePct)}` : "",
  ]);
  return { kind: "row", title, detail: detail || undefined, amount: money(r.marketValue) };
}

function withNotes(items: FactItem[], notes: string): FactItem[] {
  if (notes.trim()) items.push({ kind: "note", text: notes.trim() });
  if (items.length === 0) items.push({ kind: "empty" });
  return items;
}

function sum(rows: { marketValue?: number; amount?: number }[], key: "marketValue" | "amount") {
  return rows.reduce((a, r) => a + (Number(r[key]) || 0), 0);
}

export function buildSectionFacts(pq: PqData): SectionFacts[] {
  return SECTIONS.map((def, i) => {
    const notes = (pq.sectionNotes[def.id] ?? "").trim();
    const items = factsFor(pq, def.id);
    return {
      id: def.id,
      number: String(i + 1).padStart(2, "0"),
      label: def.label,
      prompt: def.prompt,
      items: withNotes(items, notes),
      notes,
    };
  });
}

function factsFor(pq: PqData, id: SectionId): FactItem[] {
  switch (id) {
    case "opening": {
      const pairs: FactPair[] = [];
      if (pq.advisor) pairs.push({ k: "Advisor", v: pq.advisor });
      if (pq.paraPlanner) pairs.push({ k: "Paraplanner", v: pq.paraPlanner });
      if (pq.dateOfSecondMeeting) pairs.push({ k: "Meeting date", v: formatDob(pq.dateOfSecondMeeting) });
      if (pq.referredBy) pairs.push({ k: "Referred by", v: pq.referredBy });
      const received = pq.requestedDocuments.filter((d) => d.received).map((d) => d.name);
      const outstanding = pq.requestedDocuments.filter((d) => !d.received).map((d) => d.name);
      if (received.length) pairs.push({ k: "Documents received", v: received.join(", ") });
      if (outstanding.length) pairs.push({ k: "Still outstanding", v: outstanding.join(", ") });
      return pairs.length ? [{ kind: "pairs", pairs }] : [];
    }
    case "family": {
      const pairs: FactPair[] = [
        ...personPairs(pq.client, "Client"),
        ...personPairs(pq.spouse, "Spouse"),
      ];
      const addr = join(
        [pq.address.street, join([pq.address.city, pq.address.state, pq.address.zip], ", "), pq.address.country],
        ", ",
      );
      if (addr) pairs.push({ k: "Residence", v: addr });
      const kids = pq.children.filter((c) => filled(c.name) || filled(c.age));
      if (kids.length) {
        pairs.push({
          k: "Children",
          v: kids.map((c) => join([c.name, c.age ? `age ${c.age}` : ""], ", ")).join("; "),
        });
      }
      if (pq.grandchildrenCount || pq.grandchildrenNotes) {
        pairs.push({
          k: "Grandchildren",
          v: join([pq.grandchildrenCount, pq.grandchildrenNotes], " — "),
        });
      }
      const items: FactItem[] = pairs.length ? [{ kind: "pairs", pairs }] : [];
      if (pq.familyNotes.trim()) items.push({ kind: "note", text: pq.familyNotes.trim() });
      return items;
    }
    case "occupation": {
      const pairs = [
        ...personPairs(pq.client, "Client").filter((p) =>
          ["Client", "Occupation", "Employer", "Years in role", "Retirement age"].includes(p.k),
        ),
        ...personPairs(pq.spouse, "Spouse").filter((p) =>
          ["Spouse", "Occupation", "Employer", "Years in role", "Retirement age"].includes(p.k),
        ),
      ];
      return pairs.length ? [{ kind: "pairs", pairs }] : [];
    }
    case "advisors": {
      const pairs = [
        ...advisorPairs("Attorney", pq.advisors.attorney),
        ...advisorPairs("CPA", pq.advisors.accountant),
        ...advisorPairs("Insurance", pq.advisors.insurance),
        ...advisorPairs("Other", pq.advisors.other),
      ];
      return pairs.length ? [{ kind: "pairs", pairs }] : [];
    }
    case "real-estate": {
      const rows = pq.realEstate.filter((r) =>
        rowFilled(r as unknown as Record<string, unknown>, ["description", "marketValue"]),
      );
      if (!rows.length) return [];
      const items: FactItem[] = rows.map((r: RealEstateRow) => {
        const detail = join([
          r.ownership ? `Owned ${r.ownership}` : "",
          r.liabilityAmount ? `Mortgage ${money(r.liabilityAmount)}` : "",
          r.rateTerm ? r.rateTerm : "",
          r.payment ? `Pmt ${money(r.payment)}` : "",
          r.incomeEbt ? `Income ${money(r.incomeEbt)}` : "",
          r.acquisitionYear ? `Acquired ${r.acquisitionYear}` : "",
          r.purchasePrice ? `Cost ${money(r.purchasePrice)}` : "",
        ]);
        return {
          kind: "row",
          title: r.description || "Property",
          detail: detail || undefined,
          amount: money(r.marketValue),
        };
      });
      const total = sum(rows, "marketValue");
      const debt = rows.reduce((a, r) => a + (r.liabilityAmount || 0), 0);
      items.push({
        kind: "row",
        title: "Real estate total",
        detail: debt ? `Mortgages ${money(debt)}` : undefined,
        amount: money(total),
      });
      return items;
    }
    case "deferred":
      return accountSection(pq.deferred, "Company match");
    case "roth":
      return accountSection(pq.roth, "ER contrib");
    case "investments":
      return accountSection(pq.investments, "Cost basis");
    case "cash": {
      const rows = pq.cash.filter((r) =>
        rowFilled(r as unknown as Record<string, unknown>, ["description", "marketValue"]),
      );
      if (!rows.length) return [];
      const items: FactItem[] = rows.map((r: CashRow) => ({
        kind: "row",
        title: r.description || "Cash",
        detail: join([r.owner ? `Owner ${r.owner}` : "", r.intRate ? `${r.intRate}` : ""]) || undefined,
        amount: money(r.marketValue),
      }));
      items.push({ kind: "row", title: "Cash total", amount: money(sum(rows, "marketValue")) });
      return items;
    }
    case "business": {
      const rows = pq.business.filter((r) =>
        rowFilled(r as unknown as Record<string, unknown>, ["description", "marketValue"]),
      );
      if (!rows.length) return [];
      const items: FactItem[] = rows.map((r: BusinessRow) => ({
        kind: "row",
        title: r.description || "Business",
        detail: join([r.owner ? `Owner ${r.owner}` : "", r.costBasis ? `Basis ${money(r.costBasis)}` : ""]) || undefined,
        amount: money(r.marketValue),
      }));
      items.push({ kind: "row", title: "Business total", amount: money(sum(rows, "marketValue")) });
      return items;
    }
    case "liabilities": {
      const rows = pq.otherLiabilities.filter((r) =>
        rowFilled(r as unknown as Record<string, unknown>, ["description", "amount"]),
      );
      if (!rows.length) return [];
      const items: FactItem[] = rows.map((r: LiabilityRow) => ({
        kind: "row",
        title: r.description || "Liability",
        detail: join([r.intRate, r.termPmt]) || undefined,
        amount: money(r.amount),
      }));
      items.push({ kind: "row", title: "Other liabilities total", amount: money(sum(rows, "amount")) });
      return items;
    }
    case "insurance": {
      const rows = pq.insurance.filter((r) =>
        rowFilled(r as unknown as Record<string, unknown>, ["company", "type", "deathBenefit"]),
      );
      const items: FactItem[] = rows.map((r: InsuranceRow) => ({
        kind: "row",
        title: join([r.company, r.type], " · ") || "Policy",
        detail:
          join([
            r.insured ? `Insured ${r.insured}` : "",
            r.owner ? `Owner ${r.owner}` : "",
            r.beneficiary ? `Beneficiary ${r.beneficiary}` : "",
            r.annualPremium ? `Premium ${money(r.annualPremium)}` : "",
            r.cashValue ? `Cash value ${money(r.cashValue)}` : "",
            r.policyDate ? r.policyDate : "",
          ]) || undefined,
        amount: r.deathBenefit ? money(r.deathBenefit) : undefined,
      }));
      const estate = [
        pq.estateDocs.will && "Will",
        pq.estateDocs.trust && "Living trust",
        pq.estateDocs.financialPoa && "Financial POA",
        pq.estateDocs.medicalPoa && "Medical POA",
        pq.estateDocs.hipaa && "HIPAA",
        pq.estateDocs.qualityOfLife && "Quality-of-life directive",
      ].filter(Boolean) as string[];
      items.push({
        kind: "pairs",
        pairs: [
          { k: "Estate documents", v: estate.length ? estate.join(", ") : "None confirmed" },
          { k: "Umbrella liability", v: pq.hasUmbrella ? "Yes" : "No" },
          { k: "Long-term care policy", v: pq.hasLtc ? "Yes" : "No" },
        ],
      });
      return items;
    }
    case "income": {
      const rows = pq.income.filter((r) =>
        rowFilled(r as unknown as Record<string, unknown>, ["description", "currentAmount", "futureRetirementAmount"]),
      );
      const items: FactItem[] = rows.map((r: IncomeRow) => ({
        kind: "row",
        title: join([r.description, r.type], " · ") || "Income",
        detail:
          join([
            r.owner ? `Owner ${r.owner}` : "",
            r.futureRetirementAmount ? `Retirement ${money(r.futureRetirementAmount)}` : "",
            r.startDate ? `Starts ${r.startDate}` : "",
            r.survivorCola ? r.survivorCola : "",
          ]) || undefined,
        amount: r.currentAmount ? money(r.currentAmount) : undefined,
      }));
      const pairs: FactPair[] = [];
      if (pq.annualExpenses) pairs.push({ k: "Annual expenses", v: money(pq.annualExpenses) });
      if (pq.filingStatus) pairs.push({ k: "Filing status", v: pq.filingStatus });
      if (pq.taxableIncome) pairs.push({ k: "Taxable income", v: money(pq.taxableIncome) });
      if (pq.federalTax) pairs.push({ k: "Federal tax", v: money(pq.federalTax) });
      if (pq.stateTax) pairs.push({ k: "State tax", v: money(pq.stateTax) });
      if (pq.ficaTax) pairs.push({ k: "FICA", v: money(pq.ficaTax) });
      if (pq.itemizedDed) pairs.push({ k: "Itemized deductions", v: money(pq.itemizedDed) });
      if (pq.capLossCarryForward) pairs.push({ k: "Cap-loss carryforward", v: money(pq.capLossCarryForward) });
      if (pq.taxDeferredContributions) {
        pairs.push({ k: "Tax-deferred contributions", v: money(pq.taxDeferredContributions) });
      }
      if (pq.retirementBenefits.trim()) pairs.push({ k: "Retirement benefits", v: pq.retirementBenefits.trim() });
      if (pairs.length) items.push({ kind: "pairs", pairs });
      return items;
    }
    case "goals": {
      const items: FactItem[] = [];
      if (pq.goals.trim()) items.push({ kind: "note", heading: "Goals", text: pq.goals.trim() });
      if (pq.concerns.trim()) items.push({ kind: "note", heading: "Concerns", text: pq.concerns.trim() });
      return items;
    }
  }
}

function accountSection(rows: AccountRow[], extraLabel: string): FactItem[] {
  const filledRows = rows.filter((r) =>
    rowFilled(r as unknown as Record<string, unknown>, ["custodian", "marketValue", "type"]),
  );
  if (!filledRows.length) return [];
  const items: FactItem[] = filledRows.map((r) => accountRow(r, extraLabel));
  items.push({ kind: "row", title: "Section total", amount: money(sum(filledRows, "marketValue")) });
  return items;
}

export function pqPdfFilename(label: string) {
  const safe = label.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim() || "Household";
  return `PQ - ${safe}.pdf`;
}
