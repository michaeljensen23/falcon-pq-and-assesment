import assert from "node:assert/strict";
import { test } from "node:test";

const {
  isRichStatement,
  parseStatementText,
  statementRowCount,
} = await import("../src/lib/intake/parse-statement.ts");

const DMF = `Liquid Assets
Deposit Accounts
Credit Cards
10
Citibank
26
Mercedes Benz Financial
10
Chase
2
GS Bank
161
Total Deposit Accounts
189
Brokerage Accounts
JP Morgan Securities*
1,197
JPM U.S. Large Cap Leaders Strategy x7033
258
JPMPI Dynamic Yield Strategy x7034
406
WCM Focused Growth Intl x7056
533
Fidelity Investments*
671
Self-Directed x1978
212
Self-Directed x0330
129
U.S. Large Cap Index Strategy x4615
330
Total Brokerage Accounts
1,868
Total Liquid Assets
2,057
Retirement Accounts
Fidelity Investments
Self-Directed Rollover IRA x3587
235
Roll'r IRA U.S. Large Cap Strategy x4620
1,449
TOTAL RETIREMENT ACCOUNTS
1,684
Residential Real Estate**
117 31st St, Manhattan Beach
5,905
Provident Funding
549
560 36th St, Manhattan Beach
3,706
Provident Funding
264
TOTAL RESIDENTIAL REAL ESTATE**
9,611
Partnerships/LLC-Commercial RE***
Dabby Properties
3,641
Tustin Plaza LLC
3,170
Back Bay Court Property LLC
774
Dabby Family LP
384
TOTAL PARTNERSHIPS/LLC-COMMERCIAL RE***
7,969
Total Assets
21,321
Total Liabilities
833
Net Assets
20,488
* All assets are held in my name.
**Source:Zillow
The property at 560 36th St is subject to a custody agreement with Christy Setaro, my daugher's mother granting Christy
significant rights in the property. The value of that property has not been reduced to reflect those right.
*** Per Copilot Calculation from 2021-2025 K1s
Dabby Properties
6% cap rate, AFTER 35% COMBINED DLOC+DLOM
Tustin Plaza LLC
6% cap rate, 40% Combined DLOC + DLOM Discount
Assets*
Confidential
Dan Freedman - Balance Sheet
Aug, 2026 $ (,000)
Liabilities`;

test("DMF-style sheet: scale, sleeves, mortgages, entities, name", () => {
  const extract = parseStatementText(DMF);
  assert.equal(extract.client?.firstName, "Dan");
  assert.equal(extract.client?.lastName, "Freedman");
  assert.equal(extract.address?.city, "Manhattan Beach");
  assert.equal(extract.address?.state, "CA");
  assert.equal(isRichStatement(extract), true);
  assert.ok(statementRowCount(extract) >= 15);

  const cash = Object.fromEntries((extract.cash ?? []).map((r) => [r.description, r.marketValue]));
  assert.equal(cash.Citibank, 26_000);
  assert.equal(cash.Chase, 2_000);
  assert.equal(cash["GS Bank"], 161_000);
  assert.equal(extract.cash?.length, 3);

  const inv = (extract.investments ?? []).map((r) => r.custodian);
  assert.equal(inv.includes("JP Morgan Securities"), false);
  assert.equal(inv.includes("Fidelity Investments"), false);
  assert.ok(inv.some((n) => /x7033/.test(n)));
  assert.ok(inv.some((n) => /x1978/.test(n)));
  assert.equal(
    (extract.investments ?? []).find((r) => /x7033/.test(r.custodian ?? ""))?.marketValue,
    258_000,
  );
  assert.equal(
    (extract.investments ?? []).some((r) => r.marketValue === 2_026_000),
    false,
    "Aug 2026 must not become an investment row",
  );

  const iras = extract.deferred ?? [];
  assert.equal(iras.length, 2);
  assert.equal(
    iras.find((r) => /x3587/.test(r.custodian ?? ""))?.marketValue,
    235_000,
  );
  assert.equal(
    iras.find((r) => /x4620/.test(r.custodian ?? ""))?.marketValue,
    1_449_000,
  );

  const homes = extract.realEstate ?? [];
  assert.equal(homes.length, 2);
  const first = homes.find((r) => /31st/.test(r.description ?? ""));
  const second = homes.find((r) => /36th/.test(r.description ?? ""));
  assert.equal(first?.marketValue, 5_905_000);
  assert.equal(first?.liabilityAmount, 549_000);
  assert.equal(second?.marketValue, 3_706_000);
  assert.equal(second?.liabilityAmount, 264_000);

  const biz = (extract.business ?? []).map((r) => r.description);
  assert.ok(biz.includes("Dabby Properties"));
  assert.ok(biz.includes("Tustin Plaza LLC"));
  assert.ok(biz.includes("Back Bay Court Property LLC"));
  assert.ok(biz.includes("Dabby Family LP"));
  assert.equal(
    (extract.business ?? []).find((r) => r.description === "Dabby Properties")?.marketValue,
    3_641_000,
  );

  const debts = extract.otherLiabilities ?? [];
  assert.ok(debts.some((r) => /credit cards/i.test(r.description ?? "") && r.amount === 10_000));
  assert.ok(debts.some((r) => /mercedes/i.test(r.description ?? "") && r.amount === 10_000));
  assert.equal(
    debts.some((r) => /provident/i.test(r.description ?? "")),
    false,
    "mortgages belong on the property, not other liabilities",
  );

  assert.match(extract.sectionNotes?.opening ?? "", /client's name/i);
  assert.match(extract.sectionNotes?.["real-estate"] ?? "", /custody agreement/i);
  assert.match(extract.sectionNotes?.["real-estate"] ?? "", /Christy Setaro/);
  assert.equal(
    /Tustin Plaza/i.test(extract.sectionNotes?.["real-estate"] ?? ""),
    false,
    "entity discounts belong on business, not real estate",
  );
  assert.match(extract.sectionNotes?.business ?? "", /DLOC/i);
  assert.match(extract.summary ?? "", /thousands/i);
});
