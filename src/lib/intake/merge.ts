import { MAX_EXTRACT_ROWS, MAX_FIELD_CHARS, MAX_NOTE_FIELD_CHARS } from "./limits";
import {
  consolidatePq,
  mergeNotes,
  pickLabel,
  pickMoney,
  pickText,
  reconcileList,
} from "./reconcile";
import {
  emptyAccount,
  emptyAdvisor,
  emptyBusiness,
  emptyCash,
  emptyChild,
  emptyIncome,
  emptyInsurance,
  emptyLiability,
  emptyPerson,
  emptyPq,
  emptyRealEstate,
} from "@/lib/pq/empty";
import { SECTIONS, type SectionId, sectionCompleteness } from "@/lib/pq/sections";
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
} from "@/lib/pq/types";
import { uid } from "@/lib/utils";

export type IntakeExtract = {
  advisor?: string;
  paraPlanner?: string;
  dateOfSecondMeeting?: string;
  referredBy?: string;
  familyNotes?: string;
  client?: Partial<Person>;
  spouse?: Partial<Person>;
  address?: Partial<PqData["address"]>;
  children?: { name?: string; age?: string }[];
  grandchildrenCount?: string;
  grandchildrenNotes?: string;
  advisors?: {
    attorney?: Partial<AdvisorContact>;
    accountant?: Partial<AdvisorContact>;
    insurance?: Partial<AdvisorContact>;
    other?: Partial<AdvisorContact>;
  };
  realEstate?: Partial<RealEstateRow>[];
  deferred?: Partial<AccountRow>[];
  roth?: Partial<AccountRow>[];
  investments?: Partial<AccountRow>[];
  cash?: Partial<CashRow>[];
  business?: Partial<BusinessRow>[];
  otherLiabilities?: Partial<LiabilityRow>[];
  insurance?: Partial<InsuranceRow>[];
  income?: Partial<IncomeRow>[];
  annualExpenses?: number;
  filingStatus?: string;
  capLossCarryForward?: number;
  taxableIncome?: number;
  itemizedDed?: number;
  federalTax?: number;
  stateTax?: number;
  ficaTax?: number;
  taxDeferredContributions?: number;
  retirementBenefits?: string;
  goals?: string;
  concerns?: string;
  estateDocs?: Partial<PqData["estateDocs"]>;
  hasUmbrella?: boolean;
  hasLtc?: boolean;
  sectionNotes?: Record<string, string>;
  summary?: string;
};

const SECTION_IDS = new Set<string>(SECTIONS.map((s) => s.id));

function str(v: unknown, max = MAX_FIELD_CHARS): string {
  if (v == null) return "";
  return String(v).trim().slice(0, max);
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.abs(v) > 1e12 ? 0 : v;
  }
  if (typeof v === "string") {
    const cleaned = v.trim().slice(0, 40).replace(/[$,]/g, "").replace(/^\((.*)\)$/, "-$1");
    const n = Number(cleaned);
    if (!Number.isFinite(n) || Math.abs(n) > 1e12) return 0;
    return n;
  }
  return 0;
}

function bool(v: unknown): boolean {
  return v === true || v === "true" || v === "yes";
}

function prefer(existing: string, incoming: unknown, max = MAX_FIELD_CHARS): string {
  if (existing && existing.trim()) return existing;
  return str(incoming, max);
}

function updateNum(existing: number, incoming: unknown): number {
  const n = num(incoming);
  if (n) return n;
  return existing;
}

function preferBool(existing: boolean, incoming: unknown): boolean {
  if (existing) return existing;
  return bool(incoming);
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function person(base: Person, incoming?: Partial<Person>): Person {
  const src = asRecord(incoming) ?? {};
  return {
    firstName: prefer(base.firstName, src.firstName),
    nickname: prefer(base.nickname, src.nickname),
    lastName: prefer(base.lastName, src.lastName),
    dob: prefer(base.dob, src.dob),
    maritalStatus: prefer(base.maritalStatus, src.maritalStatus),
    yearsMarried: prefer(base.yearsMarried, src.yearsMarried),
    jobTitle: prefer(base.jobTitle, src.jobTitle),
    employer: prefer(base.employer, src.employer),
    yearsAtJob: prefer(base.yearsAtJob, src.yearsAtJob),
    retirementAge: prefer(base.retirementAge, src.retirementAge),
  };
}

function advisor(base: AdvisorContact, incoming?: Partial<AdvisorContact>): AdvisorContact {
  const src = asRecord(incoming) ?? {};
  return {
    name: prefer(base.name, src.name),
    firm: prefer(base.firm, src.firm),
    notes: prefer(base.notes, src.notes, MAX_NOTE_FIELD_CHARS),
    preference: preferBool(base.preference, src.preference),
    commitment: preferBool(base.commitment, src.commitment),
  };
}

function joinNotes(existing: string, incoming: unknown) {
  return mergeNotes(existing, str(incoming, MAX_NOTE_FIELD_CHARS), MAX_NOTE_FIELD_CHARS * 2);
}

function takeRows<T>(rows: T[] | undefined): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, MAX_EXTRACT_ROWS);
}

function account(row: Partial<AccountRow>, extraLabel: string): AccountRow {
  return {
    ...emptyAccount(extraLabel),
    id: uid(),
    custodian: str(row.custodian),
    marketValue: num(row.marketValue),
    additions: num(row.additions),
    extra: num(row.extra),
    extraLabel,
    type: str(row.type),
    ownership: str(row.ownership),
    beneficiary: str(row.beneficiary),
    feePct: num(row.feePct),
  };
}

export function mergeIntake(current: PqData, extract: IntakeExtract): PqData {
  const base: PqData = { ...emptyPq(), ...current };
  const src = asRecord(extract) ?? {};
  const address = asRecord(src.address);
  const advisors = asRecord(src.advisors);
  const estateDocs = asRecord(src.estateDocs);
  const next: PqData = {
    ...base,
    advisor: prefer(base.advisor, src.advisor),
    paraPlanner: prefer(base.paraPlanner, src.paraPlanner),
    dateOfSecondMeeting: prefer(base.dateOfSecondMeeting, src.dateOfSecondMeeting),
    referredBy: prefer(base.referredBy, src.referredBy),
    familyNotes: joinNotes(base.familyNotes, src.familyNotes),
    client: person(base.client, src.client as Partial<Person> | undefined),
    spouse: person(base.spouse ?? emptyPerson(), src.spouse as Partial<Person> | undefined),
    address: {
      street: prefer(base.address.street, address?.street),
      city: prefer(base.address.city, address?.city),
      state: prefer(base.address.state, address?.state),
      zip: prefer(base.address.zip, address?.zip),
      country: prefer(base.address.country, address?.country) || "USA",
    },
    grandchildrenCount: prefer(base.grandchildrenCount, src.grandchildrenCount),
    grandchildrenNotes: joinNotes(base.grandchildrenNotes, src.grandchildrenNotes),
    advisors: {
      attorney: advisor(base.advisors.attorney, advisors?.attorney as Partial<AdvisorContact> | undefined),
      accountant: advisor(base.advisors.accountant, advisors?.accountant as Partial<AdvisorContact> | undefined),
      insurance: advisor(base.advisors.insurance, advisors?.insurance as Partial<AdvisorContact> | undefined),
      other: advisor(base.advisors.other ?? emptyAdvisor(), advisors?.other as Partial<AdvisorContact> | undefined),
    },
    annualExpenses: updateNum(base.annualExpenses, src.annualExpenses),
    filingStatus: prefer(base.filingStatus, src.filingStatus),
    capLossCarryForward: updateNum(base.capLossCarryForward, src.capLossCarryForward),
    taxableIncome: updateNum(base.taxableIncome, src.taxableIncome),
    itemizedDed: updateNum(base.itemizedDed, src.itemizedDed),
    federalTax: updateNum(base.federalTax, src.federalTax),
    stateTax: updateNum(base.stateTax, src.stateTax),
    ficaTax: updateNum(base.ficaTax, src.ficaTax),
    taxDeferredContributions: updateNum(base.taxDeferredContributions, src.taxDeferredContributions),
    retirementBenefits: prefer(base.retirementBenefits, src.retirementBenefits, MAX_NOTE_FIELD_CHARS),
    goals: joinNotes(base.goals, src.goals),
    concerns: joinNotes(base.concerns, src.concerns),
    estateDocs: {
      will: preferBool(base.estateDocs.will, estateDocs?.will),
      trust: preferBool(base.estateDocs.trust, estateDocs?.trust),
      financialPoa: preferBool(base.estateDocs.financialPoa, estateDocs?.financialPoa),
      medicalPoa: preferBool(base.estateDocs.medicalPoa, estateDocs?.medicalPoa),
      hipaa: preferBool(base.estateDocs.hipaa, estateDocs?.hipaa),
      qualityOfLife: preferBool(base.estateDocs.qualityOfLife, estateDocs?.qualityOfLife),
    },
    hasUmbrella: preferBool(base.hasUmbrella, src.hasUmbrella),
    hasLtc: preferBool(base.hasLtc, src.hasLtc),
    sectionNotes: { ...base.sectionNotes },
  };

  const kids = takeRows(src.children as { name?: string; age?: string }[])
    .map((c) => ({ ...emptyChild(), name: str(c?.name), age: str(c?.age, 16) }))
    .filter((c) => c.name);
  next.children = reconcileList(base.children, kids, {
    isFilled: (c) => Boolean(c.name),
    label: (c) => c.name,
    overlay: (a, b) => ({ ...a, name: pickLabel(a.name, b.name), age: pickText(a.age, b.age) }),
    value: () => 0,
  });

  next.realEstate = reconcileList(
    base.realEstate,
    takeRows(src.realEstate as Partial<RealEstateRow>[]).map((r) => ({
      ...emptyRealEstate(),
      description: str(r.description),
      marketValue: num(r.marketValue),
      liabilityAmount: num(r.liabilityAmount),
      rateTerm: str(r.rateTerm),
      payment: num(r.payment),
      incomeEbt: num(r.incomeEbt),
      acquisitionYear: str(r.acquisitionYear, 16),
      purchasePrice: num(r.purchasePrice),
      additions: num(r.additions),
      ownership: str(r.ownership),
    })),
    {
      isFilled: (r) => Boolean(r.description || r.marketValue),
      label: (r) => r.description,
      overlay: (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        marketValue: pickMoney(a.marketValue, b.marketValue),
        liabilityAmount: pickMoney(a.liabilityAmount, b.liabilityAmount),
        rateTerm: pickText(a.rateTerm, b.rateTerm),
        payment: pickMoney(a.payment, b.payment),
        incomeEbt: pickMoney(a.incomeEbt, b.incomeEbt),
        acquisitionYear: pickText(a.acquisitionYear, b.acquisitionYear),
        purchasePrice: pickMoney(a.purchasePrice, b.purchasePrice),
        additions: pickMoney(a.additions, b.additions),
        ownership: pickText(a.ownership, b.ownership),
      }),
      value: (r) => r.marketValue,
    },
  );

  const extraFor = { deferred: "Company match", roth: "ER contrib / 5 years?", investments: "Cost basis" } as const;
  (["deferred", "roth", "investments"] as const).forEach((key) => {
    next[key] = reconcileList(
      base[key],
      takeRows(src[key] as Partial<AccountRow>[]).map((r) => account(r, extraFor[key])),
      {
        isFilled: (r) => Boolean(r.custodian || r.marketValue),
        label: (r) => r.custodian,
        overlay: (a, b) => ({
          ...a,
          custodian: pickLabel(a.custodian, b.custodian),
          marketValue: pickMoney(a.marketValue, b.marketValue),
          additions: pickMoney(a.additions, b.additions),
          extra: pickMoney(a.extra, b.extra),
          type: pickText(a.type, b.type),
          ownership: pickText(a.ownership, b.ownership),
          beneficiary: pickText(a.beneficiary, b.beneficiary),
          feePct: pickMoney(a.feePct, b.feePct),
        }),
        value: (r) => r.marketValue,
      },
    );
  });

  next.cash = reconcileList(
    base.cash,
    takeRows(src.cash as Partial<CashRow>[]).map((r) => ({
      ...emptyCash(),
      description: str(r.description),
      marketValue: num(r.marketValue),
      intRate: str(r.intRate, 32),
      owner: str(r.owner),
    })),
    {
      isFilled: (r) => Boolean(r.description || r.marketValue),
      label: (r) => r.description,
      overlay: (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        marketValue: pickMoney(a.marketValue, b.marketValue),
        intRate: pickText(a.intRate, b.intRate),
        owner: pickText(a.owner, b.owner),
      }),
      value: (r) => r.marketValue,
    },
  );

  next.business = reconcileList(
    base.business,
    takeRows(src.business as Partial<BusinessRow>[]).map((r) => ({
      ...emptyBusiness(),
      description: str(r.description),
      marketValue: num(r.marketValue),
      costBasis: num(r.costBasis),
      owner: str(r.owner),
    })),
    {
      isFilled: (r) => Boolean(r.description || r.marketValue),
      label: (r) => r.description,
      overlay: (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        marketValue: pickMoney(a.marketValue, b.marketValue),
        costBasis: pickMoney(a.costBasis, b.costBasis),
        owner: pickText(a.owner, b.owner),
      }),
      value: (r) => r.marketValue,
    },
  );

  next.otherLiabilities = reconcileList(
    base.otherLiabilities,
    takeRows(src.otherLiabilities as Partial<LiabilityRow>[]).map((r) => ({
      ...emptyLiability(),
      description: str(r.description),
      amount: num(r.amount),
      intRate: str(r.intRate, 32),
      termPmt: str(r.termPmt),
    })),
    {
      isFilled: (r) => Boolean(r.description || r.amount),
      label: (r) => r.description,
      overlay: (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        amount: pickMoney(a.amount, b.amount),
        intRate: pickText(a.intRate, b.intRate),
        termPmt: pickText(a.termPmt, b.termPmt),
      }),
      value: (r) => r.amount,
    },
  );

  next.insurance = reconcileList(
    base.insurance,
    takeRows(src.insurance as Partial<InsuranceRow>[]).map((r) => ({
      ...emptyInsurance(),
      company: str(r.company),
      type: str(r.type),
      deathBenefit: num(r.deathBenefit),
      insured: str(r.insured),
      owner: str(r.owner),
      policyDate: str(r.policyDate, 16),
      annualPremium: num(r.annualPremium),
      cashValue: num(r.cashValue),
      beneficiary: str(r.beneficiary),
    })),
    {
      isFilled: (r) => Boolean(r.company || r.type || r.deathBenefit),
      label: (r) => `${r.company} ${r.type}`,
      overlay: (a, b) => ({
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
      value: (r) => r.deathBenefit,
    },
  );

  next.income = reconcileList(
    base.income,
    takeRows(src.income as Partial<IncomeRow>[]).map((r) => ({
      ...emptyIncome(),
      description: str(r.description),
      currentAmount: num(r.currentAmount),
      futureRetirementAmount: num(r.futureRetirementAmount),
      type: str(r.type) || "Other",
      startDate: str(r.startDate, 16),
      owner: str(r.owner),
      survivorCola: str(r.survivorCola, 32),
    })),
    {
      isFilled: (r) => Boolean(r.description || r.currentAmount),
      label: (r) => r.description,
      overlay: (a, b) => ({
        ...a,
        description: pickLabel(a.description, b.description),
        currentAmount: pickMoney(a.currentAmount, b.currentAmount),
        futureRetirementAmount: pickMoney(a.futureRetirementAmount, b.futureRetirementAmount),
        type: pickText(a.type, b.type),
        startDate: pickText(a.startDate, b.startDate),
        owner: pickText(a.owner, b.owner),
        survivorCola: pickText(a.survivorCola, b.survivorCola),
      }),
      value: (r) => r.currentAmount,
    },
  );

  const sectionNotes = asRecord(src.sectionNotes);
  if (sectionNotes) {
    for (const [key, value] of Object.entries(sectionNotes)) {
      if (!SECTION_IDS.has(key)) continue;
      next.sectionNotes[key] = joinNotes(next.sectionNotes[key] ?? "", value);
    }
  }

  if (src.summary) {
    next.sectionNotes.opening = joinNotes(next.sectionNotes.opening ?? "", src.summary);
  }

  return consolidatePq(next);
}

export function gainedSections(before: PqData, after: PqData): SectionId[] {
  return SECTIONS.filter(
    (s) => sectionCompleteness(after, s.id).filled > sectionCompleteness(before, s.id).filled,
  ).map((s) => s.id);
}

export function markDocsReceived(pq: PqData, filenames: string[]): PqData {
  if (!filenames.length) return pq;
  const blob = filenames.join(" ").toLowerCase();
  const hits: Record<string, boolean> = {
    tax: /tax|1040|k-?1/.test(blob),
    investment: /broker|schwab|fidelity|vanguard|statement|invest/.test(blob),
    retirement: /401|ira|retirement|rollover/.test(blob),
    social: /social security|ssa-/.test(blob),
    pension: /pension|annuity/.test(blob),
    insurance: /life|disability|insurance|policy/.test(blob),
    ltc: /long[- ]term care|ltc/.test(blob),
    estate: /will|trust|poa|estate/.test(blob),
    mortgage: /mortgage|heloc|escrow/.test(blob),
    pay: /pay ?stub|w-?2|k-?1/.test(blob),
  };
  const map: Record<string, keyof typeof hits> = {
    "Federal tax returns (last 2 years)": "tax",
    "Investment / brokerage statements": "investment",
    "Retirement plan statements (401k / IRA)": "retirement",
    "Social Security statements": "social",
    "Pension / annuity statements": "pension",
    "Life & disability insurance policies": "insurance",
    "Long-term care policies": "ltc",
    "Estate documents (will, trust, POAs)": "estate",
    "Mortgage / HELOC statements": "mortgage",
    "Pay stubs or K-1s": "pay",
  };
  return {
    ...pq,
    requestedDocuments: pq.requestedDocuments.map((d) => ({
      ...d,
      received: d.received || Boolean(map[d.name] && hits[map[d.name]]),
    })),
  };
}
