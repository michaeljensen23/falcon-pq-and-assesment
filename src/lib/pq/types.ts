export type Person = {
  firstName: string;
  nickname: string;
  lastName: string;
  dob: string;
  maritalStatus: string;
  yearsMarried: string;
  jobTitle: string;
  employer: string;
  yearsAtJob: string;
  retirementAge: string;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Child = { id: string; name: string; age: string };

export type AdvisorContact = {
  name: string;
  firm: string;
  notes: string;
  preference: boolean;
  commitment: boolean;
};

export type RealEstateRow = {
  id: string;
  description: string;
  marketValue: number;
  liabilityAmount: number;
  rateTerm: string;
  payment: number;
  incomeEbt: number;
  acquisitionYear: string;
  purchasePrice: number;
  additions: number;
  ownership: string;
};

export type AccountRow = {
  id: string;
  custodian: string;
  marketValue: number;
  additions: number;
  extra: number;
  extraLabel?: string;
  type: string;
  ownership: string;
  beneficiary: string;
  feePct: number;
};

export type CashRow = {
  id: string;
  description: string;
  marketValue: number;
  intRate: string;
  owner: string;
};

export type BusinessRow = {
  id: string;
  description: string;
  marketValue: number;
  costBasis: number;
  owner: string;
};

export type LiabilityRow = {
  id: string;
  description: string;
  amount: number;
  intRate: string;
  termPmt: string;
};

export type InsuranceRow = {
  id: string;
  company: string;
  type: string;
  deathBenefit: number;
  insured: string;
  owner: string;
  policyDate: string;
  annualPremium: number;
  cashValue: number;
  beneficiary: string;
};

export type IncomeRow = {
  id: string;
  description: string;
  currentAmount: number;
  futureRetirementAmount: number;
  type: string;
  startDate: string;
  owner: string;
  survivorCola: string;
};

export type RequestedDoc = { id: string; name: string; received: boolean };

export type EstateDocs = {
  will: boolean;
  trust: boolean;
  financialPoa: boolean;
  medicalPoa: boolean;
  hipaa: boolean;
  qualityOfLife: boolean;
};

export type PqData = {
  advisor: string;
  paraPlanner: string;
  dateOfSecondMeeting: string;
  requestedDocuments: RequestedDoc[];
  referredBy: string;
  familyNotes: string;
  client: Person;
  spouse: Person;
  address: Address;
  children: Child[];
  grandchildrenCount: string;
  grandchildrenNotes: string;
  advisors: {
    other: AdvisorContact;
    attorney: AdvisorContact;
    accountant: AdvisorContact;
    insurance: AdvisorContact;
  };
  realEstate: RealEstateRow[];
  deferred: AccountRow[];
  roth: AccountRow[];
  investments: AccountRow[];
  cash: CashRow[];
  business: BusinessRow[];
  otherLiabilities: LiabilityRow[];
  insurance: InsuranceRow[];
  income: IncomeRow[];
  annualExpenses: number;
  filingStatus: string;
  capLossCarryForward: number;
  taxableIncome: number;
  itemizedDed: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  taxDeferredContributions: number;
  retirementBenefits: string;
  goals: string;
  concerns: string;
  estateDocs: EstateDocs;
  hasUmbrella: boolean;
  hasLtc: boolean;
  sectionNotes: Record<string, string>;
  completedSections: string[];
};

export type HouseholdStatus = "discovery" | "review" | "delivered";

export type Household = {
  id: string;
  userId: string;
  displayName: string;
  status: HouseholdStatus;
  advisorName: string;
  meetingDate: string | null;
  pq: PqData;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
};

export type HouseholdSummary = {
  id: string;
  displayName: string;
  status: HouseholdStatus;
  advisorName: string;
  meetingDate: string | null;
  updatedAt: string;
  createdAt: string;
  netWorth: number;
  totalAssets: number;
  completeness: number;
  clientName: string;
  spouseName: string;
};
