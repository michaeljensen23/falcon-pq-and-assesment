import assert from "node:assert/strict";
import { createJiti } from "jiti";
import { test } from "node:test";

const jiti = createJiti(import.meta.url, { interopDefault: true, alias: { "@": "/workspace/src" } });
const { labelsMatch, accountNo, consolidatePq, diffPq, reconcileList, pickMoney, pickLabel } =
  await jiti.import("../src/lib/intake/reconcile.ts");
const { mergeIntake } = await jiti.import("../src/lib/intake/merge.ts");
const { emptyPq, emptyCash, emptyAccount } = await jiti.import("../src/lib/pq/empty.ts");

test("labels match by account number, address, and name", () => {
  assert.equal(accountNo("JPM U.S. Large Cap Leaders Strategy x7033"), "7033");
  assert.equal(labelsMatch("JPM U.S. Large Cap Leaders Strategy x7033", "Large Cap x7033"), true);
  assert.equal(labelsMatch("117 31st St, Manhattan Beach", "117 31st Street"), true);
  assert.equal(labelsMatch("Citibank", "Citibank*"), true);
  assert.equal(labelsMatch("Fidelity Investments", "Self-Directed x1978"), false);
});

test("second statement updates Citibank in place and does not duplicate", () => {
  const first = mergeIntake(emptyPq(), {
    cash: [{ description: "Citibank", marketValue: 26_000 }],
  });
  const second = mergeIntake(first, {
    cash: [{ description: "Citibank", marketValue: 30_000 }],
  });
  const filled = second.cash.filter((r) => r.marketValue);
  assert.equal(filled.length, 1);
  assert.equal(filled[0].marketValue, 30_000);
  const report = diffPq(first, second);
  assert.equal(report.added.length, 0);
  assert.ok(report.updated.some((l) => /Citibank/.test(l)));
});

test("account number match updates the sleeve instead of adding a twin", () => {
  const first = mergeIntake(emptyPq(), {
    investments: [{ custodian: "JPM U.S. Large Cap Leaders Strategy x7033", marketValue: 258_000 }],
  });
  const second = mergeIntake(first, {
    investments: [{ custodian: "Large Cap Leaders x7033", marketValue: 275_000 }],
  });
  const filled = second.investments.filter((r) => r.marketValue);
  assert.equal(filled.length, 1);
  assert.equal(filled[0].marketValue, 275_000);
  assert.match(filled[0].custodian, /x7033/);
});

test("parent total is dropped when sleeves are present", () => {
  const pq = mergeIntake(emptyPq(), {
    investments: [
      { custodian: "JP Morgan Securities", marketValue: 1_197_000 },
      { custodian: "JPM U.S. Large Cap Leaders Strategy x7033", marketValue: 258_000 },
      { custodian: "JPMPI Dynamic Yield Strategy x7034", marketValue: 406_000 },
      { custodian: "WCM Focused Growth Intl x7056", marketValue: 533_000 },
    ],
  });
  const names = pq.investments.filter((r) => r.marketValue).map((r) => r.custodian);
  assert.equal(names.some((n) => /JP Morgan Securities/i.test(n) && !/x\d/.test(n)), false);
  assert.equal(names.length, 3);
});

test("consolidate folds duplicate cash rows already on the PQ", () => {
  const pq = emptyPq();
  pq.cash = [
    { ...emptyCash(), description: "Chase", marketValue: 2_000 },
    { ...emptyCash(), description: "Chase", marketValue: 2_000 },
    { ...emptyCash(), description: "GS Bank", marketValue: 161_000 },
  ];
  const next = consolidatePq(pq);
  const chase = next.cash.filter((r) => /chase/i.test(r.description));
  assert.equal(chase.length, 1);
});

test("reconcileList keeps extra fields while replacing the balance", () => {
  const existing = [{ ...emptyAccount("Cost basis"), custodian: "Schwab x1111", marketValue: 10_000, beneficiary: "Spouse", ownership: "Client" }];
  const incoming = [{ ...emptyAccount("Cost basis"), custodian: "Schwab x1111", marketValue: 12_500 }];
  const out = reconcileList(existing, incoming, {
    isFilled: (r) => Boolean(r.custodian || r.marketValue),
    label: (r) => r.custodian,
    overlay: (a, b) => ({
      ...a,
      custodian: pickLabel(a.custodian, b.custodian),
      marketValue: pickMoney(a.marketValue, b.marketValue),
      beneficiary: a.beneficiary || b.beneficiary,
      ownership: a.ownership || b.ownership,
    }),
    value: (r) => r.marketValue,
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].marketValue, 12_500);
  assert.equal(out[0].beneficiary, "Spouse");
  assert.equal(out[0].ownership, "Client");
});
