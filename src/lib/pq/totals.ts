import type { PqData } from "./types";

const INCOME_BUCKETS = {
  socialSecurity: ["social security", "ss", "ssi", "ssdi"],
  pension: ["pension", "defined benefit", "annuity income"],
  rental: ["rental", "rent", "re income"],
  va: ["va", "veteran", "va benefit"],
} as const;

function matches(type: string, needles: readonly string[]) {
  const t = type.toLowerCase();
  return needles.some((n) => t.includes(n));
}

export type Totals = {
  cash: number;
  deferred: number;
  roth: number;
  investments: number;
  realEstate: number;
  realEstateLiabilities: number;
  realEstateIncome: number;
  business: number;
  insuranceCashValue: number;
  otherLiabilities: number;
  liquidAssets: number;
  investableAssets: number;
  totalAssets: number;
  totalAssetsExRE: number;
  totalLiabilities: number;
  netWorth: number;
  netWorthExRE: number;
  additionsDeferred: number;
  additionsRoth: number;
  additionsInvestments: number;
  companyMatch: number;
  incomeCurrent: number;
  incomeRetirement: number;
  socialSecurity: number;
  pension: number;
  rental: number;
  va: number;
  guaranteedRetirement: number;
  expenses: number;
  taxDeferredContributions: number;
  totalSavings: number;
  cashFlow: number;
  shortage: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  insurancePremium: number;
  insuranceDeathBenefit: number;
  weightedFeePct: number;
  annualFees: number;
  managedAssets: number;
};

export function computeTotals(pq: PqData): Totals {
  const cash = pq.cash.reduce((a, r) => a + (r.marketValue || 0), 0);
  const deferred = pq.deferred.reduce((a, r) => a + (r.marketValue || 0), 0);
  const roth = pq.roth.reduce((a, r) => a + (r.marketValue || 0), 0);
  const investments = pq.investments.reduce((a, r) => a + (r.marketValue || 0), 0);
  const realEstate = pq.realEstate.reduce((a, r) => a + (r.marketValue || 0), 0);
  const realEstateLiabilities = pq.realEstate.reduce((a, r) => a + (r.liabilityAmount || 0), 0);
  const realEstateIncome = pq.realEstate.reduce((a, r) => a + (r.incomeEbt || 0), 0);
  const business = pq.business.reduce((a, r) => a + (r.marketValue || 0), 0);
  const insuranceCashValue = pq.insurance.reduce((a, r) => a + (r.cashValue || 0), 0);
  const otherLiabilities = pq.otherLiabilities.reduce((a, r) => a + (r.amount || 0), 0);

  const liquidAssets = cash;
  const investableAssets = deferred + roth + investments;
  const totalAssetsExRE = cash + deferred + roth + investments + business + insuranceCashValue;
  const totalAssets = totalAssetsExRE + realEstate;
  const totalLiabilities = realEstateLiabilities + otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  const netWorthExRE = totalAssetsExRE - otherLiabilities;

  const additionsDeferred = pq.deferred.reduce((a, r) => a + (r.additions || 0), 0);
  const additionsRoth = pq.roth.reduce((a, r) => a + (r.additions || 0), 0);
  const additionsInvestments = pq.investments.reduce((a, r) => a + (r.additions || 0), 0);
  const companyMatch = pq.deferred.reduce((a, r) => a + (r.extra || 0), 0);

  const incomeCurrent = pq.income.reduce((a, r) => a + (r.currentAmount || 0), 0);
  const incomeRetirement = pq.income.reduce(
    (a, r) => a + (r.futureRetirementAmount || 0),
    0,
  );

  const sumBy = (needles: readonly string[], field: "current" | "future") =>
    pq.income.reduce((a, r) => {
      if (!matches(r.type || r.description, needles)) return a;
      return a + (field === "current" ? r.currentAmount : r.futureRetirementAmount) || a;
    }, 0);

  const socialSecurity = Math.max(
    sumBy(INCOME_BUCKETS.socialSecurity, "future"),
    sumBy(INCOME_BUCKETS.socialSecurity, "current"),
  );
  const pension = Math.max(
    sumBy(INCOME_BUCKETS.pension, "future"),
    sumBy(INCOME_BUCKETS.pension, "current"),
  );
  const rental =
    Math.max(sumBy(INCOME_BUCKETS.rental, "future"), sumBy(INCOME_BUCKETS.rental, "current")) +
    realEstateIncome;
  const va = Math.max(sumBy(INCOME_BUCKETS.va, "future"), sumBy(INCOME_BUCKETS.va, "current"));

  const guaranteedRetirement = socialSecurity + pension + rental + va;
  const expenses = pq.annualExpenses || 0;
  const taxDeferredContributions = pq.taxDeferredContributions || additionsDeferred;
  const totalSavings = additionsDeferred + additionsRoth + additionsInvestments + companyMatch;
  const cashFlow = incomeCurrent - expenses - taxDeferredContributions;
  const shortage = guaranteedRetirement - expenses;

  const federalTax = pq.federalTax || 0;
  const stateTax = pq.stateTax || 0;
  const ficaTax = pq.ficaTax || 0;

  const insurancePremium = pq.insurance.reduce((a, r) => a + (r.annualPremium || 0), 0);
  const insuranceDeathBenefit = pq.insurance.reduce((a, r) => a + (r.deathBenefit || 0), 0);

  const feeAccounts = [...pq.deferred, ...pq.roth, ...pq.investments];
  const managedAssets = feeAccounts.reduce((a, r) => a + (r.marketValue || 0), 0);
  const feeWeighted = feeAccounts.reduce((a, r) => a + (r.marketValue || 0) * (r.feePct || 0), 0);
  const weightedFeePct = managedAssets > 0 ? feeWeighted / managedAssets : 0;
  const annualFees = managedAssets * (weightedFeePct / 100);

  return {
    cash,
    deferred,
    roth,
    investments,
    realEstate,
    realEstateLiabilities,
    realEstateIncome,
    business,
    insuranceCashValue,
    otherLiabilities,
    liquidAssets,
    investableAssets,
    totalAssets,
    totalAssetsExRE,
    totalLiabilities,
    netWorth,
    netWorthExRE,
    additionsDeferred,
    additionsRoth,
    additionsInvestments,
    companyMatch,
    incomeCurrent,
    incomeRetirement,
    socialSecurity,
    pension,
    rental,
    va,
    guaranteedRetirement,
    expenses,
    taxDeferredContributions,
    totalSavings,
    cashFlow,
    shortage,
    federalTax,
    stateTax,
    ficaTax,
    totalTax: federalTax + stateTax + ficaTax,
    insurancePremium,
    insuranceDeathBenefit,
    weightedFeePct,
    annualFees,
    managedAssets,
  };
}

export function householdLabel(pq: PqData) {
  const a = [pq.client.firstName, pq.client.lastName].filter(Boolean).join(" ").trim();
  const b = [pq.spouse.firstName, pq.spouse.lastName].filter(Boolean).join(" ").trim();
  if (a && b) {
    const sameLast = pq.client.lastName && pq.client.lastName === pq.spouse.lastName;
    if (sameLast) return `${pq.client.lastName}, ${pq.client.firstName} & ${pq.spouse.firstName}`;
    return `${a} & ${b}`;
  }
  return a || b || "New household";
}
