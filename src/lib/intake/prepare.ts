import { decodeBase64, inspectFile, kindOf, MAX_EXTRACT_CHARS } from "./limits";
import { pdfTextIsUseful, pdfToText } from "./pdf";
import type { PreparedSource } from "./xai";

export type StoredFile = {
  filename: string;
  mimeType: string;
  contentB64: string | null;
  notesText: string | null;
  kind: string;
  bytes?: Uint8Array;
};

function cachedText(file: StoredFile): string {
  const t = file.notesText?.trim() ?? "";
  return t && pdfTextIsUseful(t) ? t.slice(0, MAX_EXTRACT_CHARS) : "";
}

/** Prefer extracted text already stored on the file — no PDF/Excel decode needed. */
export function textsFromStored(files: StoredFile[]): string[] {
  const out: string[] = [];
  for (const file of files) {
    const t = cachedText(file);
    if (t) out.push(t);
  }
  return out;
}

export async function prepareSources(files: StoredFile[]): Promise<PreparedSource[]> {
  const out: PreparedSource[] = [];
  for (const file of files) {
    if (file.kind === "notes") continue;
    const cached = cachedText(file);
    if (cached) {
      out.push({ filename: file.filename, kind: "text", mime: "text/plain", text: cached });
      continue;
    }
    let bytes = file.bytes;
    if (!bytes && file.contentB64) {
      try {
        bytes = decodeBase64(file.contentB64);
      } catch {
        continue;
      }
    }
    let filename = file.filename;
    let mime = file.mimeType || "application/octet-stream";
    let kind = kindOf(filename, mime);
    if (bytes) {
      try {
        const inspected = inspectFile(filename, bytes);
        filename = inspected.filename;
        mime = inspected.mime;
        kind = inspected.kind;
      } catch {
        continue;
      }
    }
    if (kind === "xlsx" && bytes) {
      try {
        const { workbookToText } = await import("./xlsx");
        const text = await workbookToText(bytes);
        out.push({ filename, kind, mime, text });
      } catch {
        out.push({
          filename,
          kind: "text",
          mime: "text/plain",
          text: `[Could not read workbook ${filename}]`,
        });
      }
      continue;
    }
    if (kind === "pdf") {
      const text = bytes ? pdfToText(bytes) : "";
      if (pdfTextIsUseful(text)) {
        out.push({ filename, kind: "text", mime: "text/plain", text });
      }
      continue;
    }
    if (kind === "text") {
      const text = bytes ? Buffer.from(bytes).toString("utf8") : "";
      out.push({
        filename,
        kind,
        mime,
        text: text.slice(0, MAX_EXTRACT_CHARS),
      });
      continue;
    }
    if (kind === "image" && bytes) {
      out.push({ filename, kind, mime, bytes });
    }
  }
  return out;
}

export function currentHint(snapshot: {
  client?: string;
  spouse?: string;
  advisor?: string;
}): string {
  const bits = [
    snapshot.advisor ? `Advisor: ${snapshot.advisor.slice(0, 80)}` : "",
    snapshot.client ? `Client: ${snapshot.client.slice(0, 80)}` : "",
    snapshot.spouse ? `Spouse: ${snapshot.spouse.slice(0, 80)}` : "",
  ].filter(Boolean);
  return bits.join("\n");
}
