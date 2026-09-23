/** Compact JSON the model must return. IDs are assigned when we merge into the PQ. */
export const INTAKE_JSON_INSTRUCTIONS = `{
  "advisor": string,
  "paraPlanner": string,
  "dateOfSecondMeeting": string (YYYY-MM-DD),
  "referredBy": string,
  "familyNotes": string,
  "client": { "firstName", "nickname", "lastName", "dob", "maritalStatus", "yearsMarried", "jobTitle", "employer", "yearsAtJob", "retirementAge" },
  "spouse": { same keys as client },
  "address": { "street", "city", "state", "zip", "country" },
  "children": [{ "name", "age" }],
  "grandchildrenCount": string,
  "grandchildrenNotes": string,
  "advisors": {
    "attorney": { "name", "firm", "notes", "preference": boolean, "commitment": boolean },
    "accountant": { same },
    "insurance": { same },
    "other": { same }
  },
  "realEstate": [{ "description", "marketValue": number, "liabilityAmount": number, "rateTerm", "payment": number, "incomeEbt": number, "acquisitionYear", "purchasePrice": number, "additions": number, "ownership" }],
  "deferred": [{ "custodian", "marketValue": number, "additions": number, "extra": number, "type", "ownership", "beneficiary", "feePct": number }],
  "roth": [{ same as deferred }],
  "investments": [{ same as deferred }],
  "cash": [{ "description", "marketValue": number, "intRate", "owner" }],
  "business": [{ "description", "marketValue": number, "costBasis": number, "owner" }],
  "otherLiabilities": [{ "description", "amount": number, "intRate", "termPmt" }],
  "insurance": [{ "company", "type", "deathBenefit": number, "insured", "owner", "policyDate", "annualPremium": number, "cashValue": number, "beneficiary" }],
  "income": [{ "description", "currentAmount": number, "futureRetirementAmount": number, "type", "startDate", "owner", "survivorCola" }],
  "annualExpenses": number,
  "filingStatus": string,
  "capLossCarryForward": number,
  "taxableIncome": number,
  "itemizedDed": number,
  "federalTax": number,
  "stateTax": number,
  "ficaTax": number,
  "taxDeferredContributions": number,
  "retirementBenefits": string,
  "goals": string,
  "concerns": string,
  "estateDocs": { "will": boolean, "trust": boolean, "financialPoa": boolean, "medicalPoa": boolean, "hipaa": boolean, "qualityOfLife": boolean },
  "hasUmbrella": boolean,
  "hasLtc": boolean,
  "sectionNotes": { "<sectionId>": string },
  "summary": string (2–4 sentences of what you extracted and what is still missing)
}

Section ids for sectionNotes: opening, family, occupation, advisors, real-estate, deferred, roth, investments, cash, business, liabilities, insurance, income, goals.

Account type hints:
- deferred: Traditional IRA, Rollover IRA, 401(k), 403(b), 457, SEP/SIMPLE, Pension, Annuity
- roth: Roth IRA, Roth 401(k), After-tax 401(k), HSA
- investments: Brokerage, Individual stocks, ETF / mutual fund, Non-qualified annuity, Crypto, Other
- income type: W2, Social Security, Pension, Rental, Other
}`;
