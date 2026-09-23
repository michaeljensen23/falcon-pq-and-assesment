import ExcelJS from "exceljs";
import { MAX_EXTRACT_CHARS, MAX_SHEET_ROWS, MAX_SHEETS, zipUncompressedOk } from "./limits";

function cellText(value: unknown, depth = 0): string {
  if (depth > 4) return "";
  if (value == null || value === "") return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return value.slice(0, 400);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    const rec = value as Record<string, unknown>;
    if (typeof rec.text === "string") return rec.text.slice(0, 400);
    if (rec.result != null) return cellText(rec.result, depth + 1);
    if (typeof rec.richText === "object" && Array.isArray(rec.richText)) {
      return rec.richText.map((p: { text?: string }) => p.text ?? "").join("").slice(0, 400);
    }
    if (rec.hyperlink != null) return cellText(rec.text ?? rec.hyperlink, depth + 1);
  }
  return String(value).slice(0, 400);
}

/** Flatten a workbook into labeled TSV so Grok can read Falcon PQ sheets and statements. */
export async function workbookToText(bytes: Uint8Array): Promise<string> {
  if (!zipUncompressedOk(bytes)) {
    throw new Error("That workbook is too large to read.");
  }
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(bytes) as unknown as ArrayBuffer);
  const parts: string[] = [];
  let sheets = 0;
  wb.eachSheet((sheet) => {
    if (sheets >= MAX_SHEETS) return;
    sheets += 1;
    parts.push(`# Sheet: ${String(sheet.name).slice(0, 80)}`);
    try {
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > MAX_SHEET_ROWS) throw new Error("sheet-row-cap");
        const values = Array.isArray(row.values) ? row.values.slice(1, 24) : [];
        const cells = values.map(cellText);
        if (cells.some((c) => c.trim())) parts.push(cells.join("\t"));
      });
    } catch (err) {
      if (!(err instanceof Error) || err.message !== "sheet-row-cap") throw err;
    }
  });
  const text = parts.join("\n").trim();
  return text.length > MAX_EXTRACT_CHARS ? text.slice(0, MAX_EXTRACT_CHARS) : text;
}
