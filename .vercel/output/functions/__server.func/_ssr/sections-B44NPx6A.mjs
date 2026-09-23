//#region node_modules/.nitro/vite/services/ssr/assets/sections-B44NPx6A.js
var SECTIONS = [
	{
		id: "opening",
		label: "Meeting open",
		short: "Open",
		prompt: "Who is in the room, who referred them, and which documents are still outstanding?"
	},
	{
		id: "family",
		label: "Family",
		short: "Family",
		prompt: "Walk the household: names, ages, address, children and grandchildren."
	},
	{
		id: "occupation",
		label: "Occupation",
		short: "Work",
		prompt: "Job titles, employers, years in role, and intended retirement age."
	},
	{
		id: "advisors",
		label: "Advisors",
		short: "Team",
		prompt: "Attorney, CPA, insurance agent — preference or commitment?"
	},
	{
		id: "real-estate",
		label: "Real estate",
		short: "Property",
		prompt: "Homes and rentals: value, mortgages, income, and ownership."
	},
	{
		id: "deferred",
		label: "Tax-deferred",
		short: "IRA / 401k",
		prompt: "Qualified accounts, additions, match, type, owner, beneficiary."
	},
	{
		id: "roth",
		label: "Roth & after-tax",
		short: "Roth",
		prompt: "Roth IRAs and after-tax accounts. Note the five-year clock."
	},
	{
		id: "investments",
		label: "Brokerage & crypto",
		short: "Taxable",
		prompt: "Non-qualified investments, cost basis, ownership, beneficiaries."
	},
	{
		id: "cash",
		label: "Cash & CDs",
		short: "Cash",
		prompt: "Emergency reserves, bank cash, CDs, and who owns them."
	},
	{
		id: "business",
		label: "Business & other",
		short: "Business",
		prompt: "Business interests, collectibles, and other assets. List business cash here."
	},
	{
		id: "liabilities",
		label: "Other liabilities",
		short: "Debt",
		prompt: "Notes, HELOCs, margin, student loans — anything not on real estate."
	},
	{
		id: "insurance",
		label: "Insurance",
		short: "Protect",
		prompt: "Life, LTC, disability — company, benefit, premium, cash value, beneficiary."
	},
	{
		id: "income",
		label: "Income & tax",
		short: "Cash flow",
		prompt: "Wages, Social Security, pensions, expenses, and the current tax picture."
	},
	{
		id: "goals",
		label: "Goals & concerns",
		short: "Goals",
		prompt: "What does a great next decade look like, and what keeps them up at night?"
	}
];
function filled(v) {
	if (typeof v === "number") return v !== 0;
	if (typeof v === "boolean") return v;
	return Boolean(v && String(v).trim());
}
function rowFilled(obj, keys) {
	return keys.some((k) => filled(obj[k]));
}
function sectionCompleteness(pq, id) {
	switch (id) {
		case "opening": {
			const docs = pq.requestedDocuments.length;
			return {
				filled: pq.requestedDocuments.filter((d) => d.received).length + [
					pq.advisor,
					pq.referredBy,
					pq.dateOfSecondMeeting
				].filter(filled).length,
				total: Math.max(docs + 3, 1)
			};
		}
		case "family": {
			const keys = [
				pq.client.firstName,
				pq.client.lastName,
				pq.client.dob,
				pq.client.maritalStatus,
				pq.address.city,
				pq.address.state
			];
			return {
				filled: keys.filter(filled).length,
				total: keys.length
			};
		}
		case "occupation": {
			const keys = [
				pq.client.jobTitle,
				pq.client.employer,
				pq.client.retirementAge
			];
			return {
				filled: keys.filter(filled).length,
				total: keys.length
			};
		}
		case "advisors": return {
			filled: [
				pq.advisors.attorney,
				pq.advisors.accountant,
				pq.advisors.insurance
			].filter((p) => filled(p.name) || filled(p.firm)).length,
			total: 3
		};
		case "real-estate": {
			const rows = pq.realEstate.filter((r) => rowFilled(r, ["description", "marketValue"]));
			return {
				filled: rows.length,
				total: Math.max(rows.length, 1)
			};
		}
		case "deferred": {
			const rows = pq.deferred.filter((r) => rowFilled(r, ["custodian", "marketValue"]));
			return {
				filled: rows.length,
				total: Math.max(rows.length, 1)
			};
		}
		case "roth": return {
			filled: pq.roth.filter((r) => rowFilled(r, ["custodian", "marketValue"])).length > 0 || pq.completedSections.includes("roth") ? 1 : 0,
			total: 1
		};
		case "investments": {
			const rows = pq.investments.filter((r) => rowFilled(r, ["custodian", "marketValue"]));
			return {
				filled: rows.length,
				total: Math.max(rows.length, 1)
			};
		}
		case "cash": {
			const rows = pq.cash.filter((r) => rowFilled(r, ["description", "marketValue"]));
			return {
				filled: rows.length,
				total: Math.max(rows.length, 1)
			};
		}
		case "business": {
			const rows = pq.business.filter((r) => rowFilled(r, ["description", "marketValue"]));
			const marked = pq.completedSections.includes("business");
			return {
				filled: rows.length > 0 || marked ? 1 : 0,
				total: 1
			};
		}
		case "liabilities": {
			const rows = pq.otherLiabilities.filter((r) => rowFilled(r, ["description", "amount"]));
			const marked = pq.completedSections.includes("liabilities");
			return {
				filled: rows.length > 0 || marked ? 1 : 0,
				total: 1
			};
		}
		case "insurance": {
			const rows = pq.insurance.filter((r) => rowFilled(r, [
				"company",
				"type",
				"deathBenefit"
			]));
			return {
				filled: rows.length,
				total: Math.max(rows.length, 1)
			};
		}
		case "income": {
			const keys = [
				pq.annualExpenses,
				pq.filingStatus,
				pq.income.some((i) => i.currentAmount > 0)
			];
			return {
				filled: (pq.annualExpenses > 0 ? 1 : 0) + (filled(pq.filingStatus) ? 1 : 0) + (pq.income.some((i) => i.currentAmount > 0) ? 1 : 0),
				total: keys.length
			};
		}
		case "goals": return {
			filled: [pq.goals, pq.concerns].filter(filled).length,
			total: 2
		};
	}
}
function overallCompleteness(pq) {
	const parts = SECTIONS.map((s) => sectionCompleteness(pq, s.id));
	const filled = parts.reduce((a, p) => a + p.filled, 0);
	const total = parts.reduce((a, p) => a + p.total, 0);
	return total === 0 ? 0 : Math.round(filled / total * 100);
}
//#endregion
export { overallCompleteness as n, sectionCompleteness as r, SECTIONS as t };
