import { ageFromDob } from "@/lib/format";
import type { PqData } from "./types";
import { computeTotals, type Totals } from "./totals";

export type ConcernId =
  | "cashflow"
  | "tax"
  | "investments"
  | "risk"
  | "estate"
  | "rmd"
  | "fees"
  | "titling"
  | "beneficiaries"
  | "ltc"
  | "umbrella"
  | "coordination"
  | "roth-gap"
  | "liquidity-death";

export type Concern = {
  id: ConcernId;
  title: string;
  severity: "high" | "watch" | "info";
  summary: string;
  strategy: string[];
  applies: boolean;
};

export function buildConcerns(pq: PqData, totals: Totals = computeTotals(pq)): Concern[] {
  const age = ageFromDob(pq.client.dob) ?? ageFromDob(pq.spouse.dob);
  const withdrawal =
    totals.investableAssets > 0 && totals.shortage < 0
      ? (Math.abs(totals.shortage) / totals.investableAssets) * 100
      : 0;
  const qualifiedShare =
    totals.totalAssetsExRE > 0 ? totals.deferred / totals.totalAssetsExRE : 0;
  const rothShare = totals.totalAssetsExRE > 0 ? totals.roth / totals.totalAssetsExRE : 0;
  const cashShare = totals.totalAssetsExRE > 0 ? totals.cash / totals.totalAssetsExRE : 0;
  const hasTrust = pq.estateDocs.trust;
  const hasPoas = pq.estateDocs.financialPoa && pq.estateDocs.medicalPoa;
  const hasLife = pq.insurance.some((i) => /life/i.test(i.type) && i.deathBenefit > 0);
  const namedBeneficiaries =
    [...pq.deferred, ...pq.roth, ...pq.investments, ...pq.insurance].filter((r) =>
      "beneficiary" in r ? Boolean(r.beneficiary?.trim()) : false,
    ).length;
  const accountCount =
    pq.deferred.length + pq.roth.length + pq.investments.length + pq.insurance.length;
  const advisorNamed = [pq.advisors.attorney, pq.advisors.accountant, pq.advisors.insurance].filter(
    (a) => a.name.trim(),
  ).length;
  const rmdAge = age !== null && age >= 70;

  const all: Concern[] = [
    {
      id: "cashflow",
      title: "Cash flow planning",
      severity: totals.shortage < 0 ? "high" : "watch",
      applies: totals.expenses > 0,
      summary:
        totals.shortage < 0
          ? `Guaranteed income covers ${formatCover(totals)} of today’s ${fmt(totals.expenses)} spending, leaving a ${fmt(Math.abs(totals.shortage))} annual gap to fund from investments${withdrawal ? ` (~${withdrawal.toFixed(1)}% withdrawal).` : "."}`
          : `Guaranteed income of ${fmt(totals.guaranteedRetirement)} covers today’s ${fmt(totals.expenses)} spending, with a ${fmt(totals.shortage)} surplus before tax and COLA.`,
      strategy: [
        "Build cash-flow projections to test shortfalls across longevity, inflation, and tax.",
        "Determine the minimum rate of return required on investments to fund lifetime income.",
        "Set a maximum safe spending level so the plan is not sequence-of-returns dependent.",
        "Coordinate Social Security timing with tax brackets and Roth conversion windows.",
        "Evaluate pension survivor options against the household’s cash-flow need.",
      ],
    },
    {
      id: "tax",
      title: "Tax planning",
      severity: qualifiedShare > 0.4 && rothShare < 0.05 ? "high" : "watch",
      applies: totals.deferred > 0 || totals.investments > 0,
      summary:
        rothShare < 0.02
          ? `The portfolio is not tax-diversified. ${fmt(totals.deferred)} sits in tax-deferred accounts and ${fmt(totals.roth)} in Roth — most withdrawals will be ordinary income.`
          : `Tax location is mixed: deferred ${fmt(totals.deferred)}, taxable ${fmt(totals.investments)}, Roth ${fmt(totals.roth)}. Active management can still reduce lifetime tax.`,
      strategy: [
        "Develop a multi-year Roth conversion map, sized to remaining brackets and IRMAA cliffs.",
        "Weight equities in taxable accounts and fixed income in qualified accounts.",
        "Harvest gains and losses; use charitable giving (QCD / DAF) to offset conversions.",
        "Plan for RMDs at 73 (75 for those who turn 74 after 2032) before the forced-income years.",
        "Structure retirement paychecks from tax-free, ordinary, and capital-gain sources.",
      ],
    },
    {
      id: "roth-gap",
      title: "No tax-free bucket",
      severity: "high",
      applies: totals.roth === 0 && totals.deferred > 0,
      summary:
        "There is currently no Roth / tax-free balance. Future rate increases and RMDs will push ordinary income into higher brackets with little flexibility.",
      strategy: [
        "Begin Roth conversions in years with lower ordinary income (pre-RMD, pre-Social Security).",
        "Evaluate backdoor Roth contributions if earned income remains.",
        "Keep five-year clocks in view for each conversion vintage.",
      ],
    },
    {
      id: "investments",
      title: "Investment management",
      severity: "watch",
      applies: totals.investableAssets > 0,
      summary: `${fmt(totals.totalAssetsExRE)} of investable assets (ex-real estate) needs a distribution-era allocation across 12–20 asset classes, with fees and capital-gain distributions kept in check.`,
      strategy: [
        "Build a diversified, tax-efficient portfolio sized to the cash-flow required return.",
        "Prefer institutional index funds; use ETFs where institutional share classes are not available.",
        "Consolidate accounts to cut cost and make rebalancing and asset location real.",
        "Shift the mandate from accumulation to distribution — no market timing required.",
        "Rebalance to bands tied to spending, not to a calendar.",
      ],
    },
    {
      id: "fees",
      title: "Unnecessary account fees",
      severity: totals.weightedFeePct >= 0.5 ? "high" : "info",
      applies: totals.managedAssets > 0 && totals.annualFees > 0,
      summary: `Approximate weighted fund expense is ${totals.weightedFeePct.toFixed(2)}% — about ${fmt(totals.annualFees)} per year on ${fmt(totals.managedAssets)} of managed assets, before advisor or trading costs.`,
      strategy: [
        "Replace high-turnover active funds with institutional index exposure where it is the better vehicle.",
        "Surface hidden expense ratios, 12b-1s, and commissions on A-share mutual funds.",
        "Measure cost in dollars, not just basis points.",
      ],
    },
    {
      id: "rmd",
      title: "Required minimum distributions",
      severity: rmdAge || (age !== null && age >= 68) ? "high" : "watch",
      applies: totals.deferred > 0,
      summary:
        age !== null
          ? `At age ${age}, RMDs from ${fmt(totals.deferred)} of qualified assets will begin the year after ${age >= 73 ? "they started" : "age 73"} and are taxed as ordinary income.`
          : `Qualified balances of ${fmt(totals.deferred)} will generate RMDs beginning at 73 (75 if born 1960+).`,
      strategy: [
        "Model RMD income against Social Security taxation, IRMAA, and the surviving-spouse bracket.",
        "Use the pre-RMD window for conversions rather than waiting for forced distributions.",
        "QCDs after 70½ can satisfy RMDs with charitable intent.",
      ],
    },
    {
      id: "risk",
      title: "Risk management",
      severity: !hasLife || !pq.hasLtc ? "watch" : "info",
      applies: true,
      summary:
        "Premature death, long-term care, and liability claims can undo an otherwise funded plan. Coverage should be sized to cash-flow, not to a product.",
      strategy: [
        "Analyze the income gap on first death (pension survivor election, Social Security, expenses).",
        "Price long-term care against self-insurance from cash and home equity.",
        "Review dwelling cost-per-square-foot, liability limits, and deductibles on home and auto.",
        "Consider an umbrella policy sized to net worth.",
      ],
    },
    {
      id: "ltc",
      title: "Long-term care protection",
      severity: pq.hasLtc ? "info" : "watch",
      applies: !pq.hasLtc,
      summary:
        "No long-term care policy is on file. Private-room nursing costs now routinely exceed $100,000 per year and are not covered by Medicare beyond a short skilled-care window.",
      strategy: [
        "Compare traditional LTC, hybrid life/LTC, and a dedicated self-insurance reserve.",
        "Document the family-care preference so the surviving spouse is not the default plan.",
      ],
    },
    {
      id: "umbrella",
      title: "Umbrella liability protection",
      severity: pq.hasUmbrella ? "info" : "watch",
      applies: !pq.hasUmbrella && totals.netWorth > 1_000_000,
      summary: `With a ${fmt(totals.netWorth)} net worth, auto and homeowners liability limits are unlikely to cover a catastrophic claim.`,
      strategy: [
        "Add an umbrella of at least $1–5 million, coordinated with underlying auto and home limits.",
        "Confirm the umbrella sits over all licensed drivers and properties.",
      ],
    },
    {
      id: "estate",
      title: "Estate planning",
      severity: !hasTrust || !hasPoas ? "high" : "watch",
      applies: true,
      summary: estateSummary(pq, hasTrust, hasPoas),
      strategy: [
        "Review the living trust so non-qualified assets avoid probate and receive a step-up in basis.",
        "Confirm pour-over will, financial POA, medical POA, HIPAA release, and quality-of-life directive.",
        "Retitle bank and brokerage accounts to the trust; keep retirement accounts on beneficiary forms.",
        "Revisit A/B vs. disclaimer provisions given the 2026 estate-tax exemption sunset.",
      ],
    },
    {
      id: "titling",
      title: "Assets may not be titled correctly",
      severity: hasTrust ? "watch" : "high",
      applies: totals.investments + totals.cash + totals.realEstate > 0,
      summary:
        "Trusts, TOD/POD, and joint titling each transfer differently. A trust that is not on the account title still goes through probate.",
      strategy: [
        "Audit every non-qualified account and deed against the trust.",
        "Use TOD/POD only as a complement to, not a substitute for, a funded trust on larger estates.",
      ],
    },
    {
      id: "beneficiaries",
      title: "Beneficiaries may not be titled correctly",
      severity: namedBeneficiaries < accountCount / 2 ? "high" : "watch",
      applies: accountCount > 0,
      summary: `${namedBeneficiaries} of ${accountCount} retirement, brokerage, and insurance records have a beneficiary on file. These pass by contract, not by the will.`,
      strategy: [
        "Review primary and contingent beneficiaries on IRAs, 401(k)s, life insurance, and annuities.",
        "Name people or a see-through trust — not the estate — to avoid IRD acceleration.",
        "Update designations after any marriage, divorce, or death.",
      ],
    },
    {
      id: "liquidity-death",
      title: "Temporary liquidity at death",
      severity: "info",
      applies: true,
      summary:
        "Funeral, medical, and administrative costs arrive before accounts retitle. Social Security’s burial benefit is $255 against a typical $15,000 funeral.",
      strategy: [
        "Keep a dedicated cash reserve for final expenses, legal bills, and unpaid debts.",
        "Or fund a small final-expense policy so the family is not waiting on probate.",
      ],
    },
    {
      id: "coordination",
      title: "Coordination of professionals",
      severity: advisorNamed < 2 ? "watch" : "info",
      applies: true,
      summary:
        advisorNamed < 2
          ? "The CPA, estate attorney, and insurance agent are not fully on file. Uncoordinated advice is how tax, titling, and insurance recommendations collide."
          : "Advisors are named. The next step is a working cadence so tax, estate, and investment moves happen in one sequence.",
      strategy: [
        "Introduce the CFP®, CPA, and estate attorney on a shared planning memo.",
        "Run Roth conversions, gifting, and trust funding as one calendar, not three.",
      ],
    },
  ];

  return all.filter((c) => c.applies);
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCover(t: Totals) {
  if (t.expenses <= 0) return "—";
  return `${Math.round((t.guaranteedRetirement / t.expenses) * 100)}%`;
}

function estateSummary(pq: PqData, hasTrust: boolean, hasPoas: boolean) {
  const missing: string[] = [];
  if (!pq.estateDocs.will) missing.push("will");
  if (!hasTrust) missing.push("living trust");
  if (!pq.estateDocs.financialPoa) missing.push("financial POA");
  if (!pq.estateDocs.medicalPoa) missing.push("medical POA");
  if (!pq.estateDocs.hipaa) missing.push("HIPAA");
  if (!pq.estateDocs.qualityOfLife) missing.push("quality-of-life directive");
  if (missing.length === 0) return "Core documents are marked in place. Review for funding, titling, and 2026 exemption changes.";
  return `Documents not confirmed: ${missing.join(", ")}. Unfunded or missing documents put the estate through probate and public record.`;
}

export const TAX_STRATEGIES = [
  "Roth conversion strategies",
  "Roth contribution strategies (back door)",
  "Asset liquidation strategies",
  "Tax gain and loss harvesting",
  "Charitable giving strategies",
  "Income management for insurance and Social Security taxation",
  "Address current and future income tax burden",
  "Tax diversification of assets (tax-free, capital gains, tax-deferred)",
  "Tax-efficient investments (credits and deductions)",
  "Employer-sponsored plans",
  "Business planning strategies",
];

export const INVESTMENT_STRATEGIES = [
  "Reduce risk — do not take more risk than needed",
  "Reduce fees",
  "Reduce capital-gain distributions",
  "Increase liquidity",
  "Tax efficient",
  "Strategic gains",
  "Properly diversified",
  "Create a portfolio that will provide a lifetime of retirement income",
  "Eliminate the need for market timing — 12–20 asset classes",
  "Shift from accumulation to distribution",
  "Asset location to optimize tax treatment",
];

export const ASSET_CLASSES = {
  us: [
    "Large Cap Value",
    "Large Cap Growth",
    "Mid Cap Value",
    "Mid Cap Growth",
    "Small Cap Value",
    "Small Cap Growth",
    "Tilts — Energy",
    "Tilts — Real Estate",
  ],
  intl: [
    "Developed Markets",
    "Large/Mid/Small Cap Growth",
    "Large/Mid/Small Cap Value",
    "Diversified Emerging Markets",
  ],
  fixed: ["Short Term (ST) Bonds", "US Treasuries", "Private Debt", "International ST Bonds"],
};
