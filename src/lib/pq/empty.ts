import { uid } from "@/lib/utils";
import type {
  AccountRow,
  AdvisorContact,
  BusinessRow,
  CashRow,
  Child,
  IncomeRow,
  InsuranceRow,
  LiabilityRow,
  Person,
  PqData,
  RealEstateRow,
  RequestedDoc,
} from "./types";

export const DEFAULT_DOCS: { name: string }[] = [
  { name: "Federal tax returns (last 2 years)" },
  { name: "Investment / brokerage statements" },
  { name: "Retirement plan statements (401k / IRA)" },
  { name: "Social Security statements" },
  { name: "Pension / annuity statements" },
  { name: "Life & disability insurance policies" },
  { name: "Long-term care policies" },
  { name: "Estate documents (will, trust, POAs)" },
  { name: "Mortgage / HELOC statements" },
  { name: "Pay stubs or K-1s" },
];

export function emptyPerson(): Person {
  return {
    firstName: "",
    nickname: "",
    lastName: "",
    dob: "",
    maritalStatus: "",
    yearsMarried: "",
    jobTitle: "",
    employer: "",
    yearsAtJob: "",
    retirementAge: "",
  };
}

export function emptyAdvisor(): AdvisorContact {
  return { name: "", firm: "", notes: "", preference: false, commitment: false };
}

export function emptyChild(): Child {
  return { id: uid(), name: "", age: "" };
}

export function emptyRealEstate(): RealEstateRow {
  return {
    id: uid(),
    description: "",
    marketValue: 0,
    liabilityAmount: 0,
    rateTerm: "",
    payment: 0,
    incomeEbt: 0,
    acquisitionYear: "",
    purchasePrice: 0,
    additions: 0,
    ownership: "",
  };
}

export function emptyAccount(extraLabel = ""): AccountRow {
  return {
    id: uid(),
    custodian: "",
    marketValue: 0,
    additions: 0,
    extra: 0,
    extraLabel,
    type: "",
    ownership: "",
    beneficiary: "",
    feePct: 0,
  };
}

export function emptyCash(): CashRow {
  return { id: uid(), description: "", marketValue: 0, intRate: "", owner: "" };
}

export function emptyBusiness(): BusinessRow {
  return { id: uid(), description: "", marketValue: 0, costBasis: 0, owner: "" };
}

export function emptyLiability(): LiabilityRow {
  return { id: uid(), description: "", amount: 0, intRate: "", termPmt: "" };
}

export function emptyInsurance(): InsuranceRow {
  return {
    id: uid(),
    company: "",
    type: "",
    deathBenefit: 0,
    insured: "",
    owner: "",
    policyDate: "",
    annualPremium: 0,
    cashValue: 0,
    beneficiary: "",
  };
}

export function emptyIncome(): IncomeRow {
  return {
    id: uid(),
    description: "",
    currentAmount: 0,
    futureRetirementAmount: 0,
    type: "Other",
    startDate: "",
    owner: "",
    survivorCola: "",
  };
}

export function emptyDocs(): RequestedDoc[] {
  return DEFAULT_DOCS.map((d) => ({ id: uid(), name: d.name, received: false }));
}

export function emptyPq(): PqData {
  return {
    advisor: "",
    paraPlanner: "",
    dateOfSecondMeeting: "",
    requestedDocuments: emptyDocs(),
    referredBy: "",
    familyNotes: "",
    client: emptyPerson(),
    spouse: emptyPerson(),
    address: { street: "", city: "", state: "", zip: "", country: "USA" },
    children: [emptyChild(), emptyChild()],
    grandchildrenCount: "",
    grandchildrenNotes: "",
    advisors: {
      other: emptyAdvisor(),
      attorney: emptyAdvisor(),
      accountant: emptyAdvisor(),
      insurance: emptyAdvisor(),
    },
    realEstate: [emptyRealEstate()],
    deferred: [emptyAccount("Company match")],
    roth: [emptyAccount("ER contrib / 5 years?")],
    investments: [emptyAccount("Cost basis")],
    cash: [emptyCash()],
    business: [emptyBusiness()],
    otherLiabilities: [emptyLiability()],
    insurance: [emptyInsurance()],
    income: [emptyIncome()],
    annualExpenses: 0,
    filingStatus: "Married Filing Jointly",
    capLossCarryForward: 0,
    taxableIncome: 0,
    itemizedDed: 0,
    federalTax: 0,
    stateTax: 0,
    ficaTax: 0,
    taxDeferredContributions: 0,
    retirementBenefits: "",
    goals: "",
    concerns: "",
    estateDocs: {
      will: false,
      trust: false,
      financialPoa: false,
      medicalPoa: false,
      hipaa: false,
      qualityOfLife: false,
    },
    hasUmbrella: false,
    hasLtc: false,
    sectionNotes: {},
    completedSections: [],
  };
}
