import assert from "node:assert/strict";
import test from "node:test";

function assessmentPdfFilename(label) {
  const safe = label.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim() || "Household";
  return `Assessment - ${safe}.pdf`;
}

function pqPdfFilename(label) {
  const safe = label.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim() || "Household";
  return `PQ - ${safe}.pdf`;
}

test("assessment filename uses household label", () => {
  assert.equal(
    assessmentPdfFilename("Hammarth, Germain & Marguerite"),
    "Assessment - Hammarth, Germain & Marguerite.pdf",
  );
});

test("assessment filename strips illegal characters", () => {
  assert.equal(assessmentPdfFilename('A / B: "test"'), "Assessment - A B test.pdf");
});

test("assessment filename falls back when empty", () => {
  assert.equal(assessmentPdfFilename("   "), "Assessment - Household.pdf");
});

test("PQ filename uses household label", () => {
  assert.equal(pqPdfFilename("Hammarth, Germain & Marguerite"), "PQ - Hammarth, Germain & Marguerite.pdf");
});
