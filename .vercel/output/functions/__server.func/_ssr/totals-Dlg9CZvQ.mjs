import { n as uid } from "./utils-Pdh8pBxf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/totals-Dlg9CZvQ.js
var DEFAULT_DOCS = [
	{ name: "Federal tax returns (last 2 years)" },
	{ name: "Investment / brokerage statements" },
	{ name: "Retirement plan statements (401k / IRA)" },
	{ name: "Social Security statements" },
	{ name: "Pension / annuity statements" },
	{ name: "Life & disability insurance policies" },
	{ name: "Long-term care policies" },
	{ name: "Estate documents (will, trust, POAs)" },
	{ name: "Mortgage / HELOC statements" },
	{ name: "Pay stubs or K-1s" }
];
function emptyPerson() {
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
		retirementAge: ""
	};
}
function emptyAdvisor() {
	return {
		name: "",
		firm: "",
		notes: "",
		preference: false,
		commitment: false
	};
}
function emptyChild() {
	return {
		id: uid(),
		name: "",
		age: ""
	};
}
function emptyRealEstate() {
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
		ownership: ""
	};
}
function emptyAccount(extraLabel = "") {
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
		feePct: 0
	};
}
function emptyCash() {
	return {
		id: uid(),
		description: "",
		marketValue: 0,
		intRate: "",
		owner: ""
	};
}
function emptyBusiness() {
	return {
		id: uid(),
		description: "",
		marketValue: 0,
		costBasis: 0,
		owner: ""
	};
}
function emptyLiability() {
	return {
		id: uid(),
		description: "",
		amount: 0,
		intRate: "",
		termPmt: ""
	};
}
function emptyInsurance() {
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
		beneficiary: ""
	};
}
function emptyIncome() {
	return {
		id: uid(),
		description: "",
		currentAmount: 0,
		futureRetirementAmount: 0,
		type: "Other",
		startDate: "",
		owner: "",
		survivorCola: ""
	};
}
function emptyDocs() {
	return DEFAULT_DOCS.map((d) => ({
		id: uid(),
		name: d.name,
		received: false
	}));
}
function emptyPq() {
	return {
		advisor: "",
		paraPlanner: "",
		dateOfSecondMeeting: "",
		requestedDocuments: emptyDocs(),
		referredBy: "",
		familyNotes: "",
		client: emptyPerson(),
		spouse: emptyPerson(),
		address: {
			street: "",
			city: "",
			state: "",
			zip: "",
			country: "USA"
		},
		children: [emptyChild(), emptyChild()],
		grandchildrenCount: "",
		grandchildrenNotes: "",
		advisors: {
			other: emptyAdvisor(),
			attorney: emptyAdvisor(),
			accountant: emptyAdvisor(),
			insurance: emptyAdvisor()
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
			qualityOfLife: false
		},
		hasUmbrella: false,
		hasLtc: false,
		sectionNotes: {},
		completedSections: []
	};
}
var INCOME_BUCKETS = {
	socialSecurity: [
		"social security",
		"ss",
		"ssi",
		"ssdi"
	],
	pension: [
		"pension",
		"defined benefit",
		"annuity income"
	],
	rental: [
		"rental",
		"rent",
		"re income"
	],
	va: [
		"va",
		"veteran",
		"va benefit"
	]
};
function matches(type, needles) {
	const t = type.toLowerCase();
	return needles.some((n) => t.includes(n));
}
function computeTotals(pq) {
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
	const incomeRetirement = pq.income.reduce((a, r) => a + (r.futureRetirementAmount || 0), 0);
	const sumBy = (needles, field) => pq.income.reduce((a, r) => {
		if (!matches(r.type || r.description, needles)) return a;
		return a + (field === "current" ? r.currentAmount : r.futureRetirementAmount) || a;
	}, 0);
	const socialSecurity = Math.max(sumBy(INCOME_BUCKETS.socialSecurity, "future"), sumBy(INCOME_BUCKETS.socialSecurity, "current"));
	const pension = Math.max(sumBy(INCOME_BUCKETS.pension, "future"), sumBy(INCOME_BUCKETS.pension, "current"));
	const rental = Math.max(sumBy(INCOME_BUCKETS.rental, "future"), sumBy(INCOME_BUCKETS.rental, "current")) + realEstateIncome;
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
	const feeAccounts = [
		...pq.deferred,
		...pq.roth,
		...pq.investments
	];
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
		managedAssets
	};
}
function householdLabel(pq) {
	const a = [pq.client.firstName, pq.client.lastName].filter(Boolean).join(" ").trim();
	const b = [pq.spouse.firstName, pq.spouse.lastName].filter(Boolean).join(" ").trim();
	if (a && b) {
		if (pq.client.lastName && pq.client.lastName === pq.spouse.lastName) return `${pq.client.lastName}, ${pq.client.firstName} & ${pq.spouse.firstName}`;
		return `${a} & ${b}`;
	}
	return a || b || "New household";
}
//#endregion
export { emptyCash as a, emptyIncome as c, emptyPerson as d, emptyPq as f, emptyBusiness as i, emptyInsurance as l, householdLabel as m, emptyAccount as n, emptyChild as o, emptyRealEstate as p, emptyAdvisor as r, emptyDocs as s, computeTotals as t, emptyLiability as u };
