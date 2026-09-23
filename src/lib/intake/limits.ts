export const MAX_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_B64_CHARS = Math.ceil((MAX_FILE_BYTES * 4) / 3) + 16;
export const MAX_FILES = 8;
export const MAX_NOTES_CHARS = 40_000;
export const MAX_EXTRACT_CHARS = 80_000;
export const MAX_BUNDLE_CHARS = 180_000;
export const MAX_MODEL_CHARS = 250_000;
export const MAX_PQ_JSON_CHARS = 400_000;
export const MAX_ID_CHARS = 120;
export const MAX_SHEET_ROWS = 500;
export const MAX_SHEETS = 20;
export const MAX_EXTRACT_ROWS = 24;
export const MAX_FIELD_CHARS = 4_000;
export const MAX_NOTE_FIELD_CHARS = 12_000;
export const FILL_COOLDOWN_MS = 8_000;
export const FILL_HOURLY_CAP = 12;
export const FOLLOWUP_COOLDOWN_MS = 2_000;
export const FOLLOWUP_HOURLY_CAP = 40;
export const UPLOAD_COOLDOWN_MS = 400;
export const UPLOAD_HOURLY_CAP = 40;
export const PARSE_COOLDOWN_MS = 400;
export const PARSE_HOURLY_CAP = 60;
export const MAX_HOUSEHOLDS = 40;
/** Uncompressed workbook budget. A 3 MB zip can still be a decompression bomb. */
export const MAX_XLSX_UNCOMPRESSED = 12_000_000;
export const MAX_XLSX_ENTRIES = 40;

export type FileKind = "pdf" | "image" | "text" | "xlsx";

const EXT_KIND: Record<string, FileKind> = {
  pdf: "pdf",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  txt: "text",
  md: "text",
  csv: "text",
  json: "text",
  xlsx: "xlsx",
};

const KIND_MIME: Record<FileKind, string> = {
  pdf: "application/pdf",
  image: "image/jpeg",
  text: "text/plain",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function fileExt(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "";
  const parts = base.toLowerCase().split(".");
  if (parts.length < 2) return "";
  return parts.pop() ?? "";
}

export function kindFromFilename(name: string): FileKind | null {
  return EXT_KIND[fileExt(name)] ?? null;
}

export function mimeForKind(kind: FileKind, filename: string): string {
  const ext = fileExt(filename);
  if (kind === "image") {
    if (ext === "png") return "image/png";
    if (ext === "webp") return "image/webp";
    if (ext === "gif") return "image/gif";
    return "image/jpeg";
  }
  if (kind === "text") {
    if (ext === "csv") return "text/csv";
    if (ext === "json") return "application/json";
    if (ext === "md") return "text/markdown";
    return "text/plain";
  }
  return KIND_MIME[kind];
}

export function isAllowedUpload(filename: string, _mime?: string): boolean {
  return kindFromFilename(filename) !== null;
}

/** Client-side gate: allow missing extensions when the browser supplies a known MIME. */
export function isLikelyUpload(filename: string, mime = ""): boolean {
  if (kindFromFilename(filename)) return true;
  const m = mime.toLowerCase();
  if (m === "application/pdf") return true;
  if (m.startsWith("image/") && !m.includes("svg")) return true;
  if (m.includes("spreadsheet") || m.includes("excel")) return true;
  if (m === "text/plain" || m === "text/csv" || m === "text/markdown" || m === "application/json") {
    return true;
  }
  return false;
}

export function mimeFromFilename(name: string, fallback = ""): string {
  const kind = kindFromFilename(name);
  return kind ? mimeForKind(kind, name) : fallback;
}

export function kindOf(filename: string, _mime?: string): FileKind {
  return kindFromFilename(filename) ?? "text";
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "document";
  const cleaned = base
    .replace(/[^\w.\- ()[\]]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 160);
  return cleaned || "document";
}

export function requireId(value: unknown, label = "id"): string {
  if (typeof value !== "string") throw new Error(`Invalid ${label}`);
  const id = value.trim();
  if (!id || id.length > MAX_ID_CHARS) throw new Error(`Invalid ${label}`);
  if (!/^[A-Za-z0-9_.:-]+$/.test(id)) throw new Error(`Invalid ${label}`);
  return id;
}

function startsWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  return sig.every((b, i) => bytes[i] === b);
}

function zipLooksLikeXlsx(bytes: Uint8Array): boolean {
  const head = new TextDecoder("latin1").decode(bytes.slice(0, Math.min(bytes.length, 16_384)));
  return head.includes("xl/") || head.includes("xl\\");
}

/** Magic-byte sniff so a renamed HTML file cannot pose as a PDF or image. */
export function sniffKind(bytes: Uint8Array): FileKind | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf"; // %PDF
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "image";
  if (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image";
  }
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06])) {
    return zipLooksLikeXlsx(bytes) ? "xlsx" : null;
  }
  if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) return null; // OLE: .xls / .doc / macros
  if (bytes.includes(0)) return null;
  const head = new TextDecoder("utf-8").decode(bytes.slice(0, 256)).trimStart().toLowerCase();
  if (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("<svg") ||
    head.startsWith("<script") ||
    head.startsWith("<?xml")
  ) {
    return null;
  }
  return "text";
}

function bytesFromBase64(compact: string): Uint8Array {
  if (typeof Buffer !== "undefined") return Buffer.from(compact, "base64");
  const bin = atob(compact);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function decodeBase64(raw: string): Uint8Array {
  const compact = raw.replace(/\s+/g, "");
  if (!compact || compact.length > MAX_B64_CHARS) {
    throw new Error("File is too large.");
  }
  if (!/^[A-Za-z0-9+/]+=*$/.test(compact)) {
    throw new Error("File data was not valid.");
  }
  const bytes = bytesFromBase64(compact);
  if (!bytes.length) throw new Error("The file was empty.");
  if (bytes.length > MAX_FILE_BYTES) throw new Error("Each file must be 3 MB or smaller.");
  return bytes;
}

export function encodeBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

export function inspectFile(filename: string, bytes: Uint8Array): { kind: FileKind; mime: string; filename: string } {
  const safeName = sanitizeFilename(filename);
  const named = kindFromFilename(safeName);
  const sniffed = sniffKind(bytes);
  if (!sniffed) {
    throw new Error("That file type is not accepted. Use PDF, image, text, CSV, or Excel (.xlsx).");
  }
  if (named && named !== sniffed) {
    throw new Error("That file type is not accepted. Use PDF, image, text, CSV, or Excel (.xlsx).");
  }
  const kind = named ?? sniffed;
  let outName = safeName;
  if (!named) {
    const ext = kind === "image" ? "jpg" : kind === "xlsx" ? "xlsx" : kind === "pdf" ? "pdf" : "txt";
    if (!fileExt(outName)) outName = `${outName}.${ext}`;
  }
  let mime = mimeForKind(kind, outName);
  if (kind === "image") {
    if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) mime = "image/png";
    else if (startsWith(bytes, [0x47, 0x49, 0x46])) mime = "image/gif";
    else if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46])) mime = "image/webp";
    else mime = "image/jpeg";
  }
  return { kind, mime, filename: outName };
}

export function safeJsonParse(text: string): unknown {
  if (text.length > MAX_MODEL_CHARS) throw new Error("Model response was too large.");
  return JSON.parse(text, (key, value) => {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return undefined;
    return value;
  });
}

export function publicError(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : fallback;
  if (!message || message.length > 180) return fallback;
  if (
    /[{}\n]|api\.x\.ai|Bearer|ECONN|fetch|Grok error|Could not stage|stack|at \/|Unexpected|SyntaxError|password|secret|token|relation |column |syntax error|duplicate key|pg_|ECONNREFUSED/i.test(
      message,
    )
  ) {
    return fallback;
  }
  return message;
}

/**
 * True when a zip's central directory stays inside a small uncompressed budget.
 * Rejects zip64 and missing directories so ExcelJS never inflates a bomb.
 */
export function zipUncompressedOk(
  bytes: Uint8Array,
  maxUncompressed = MAX_XLSX_UNCOMPRESSED,
  maxEntries = MAX_XLSX_ENTRIES,
): boolean {
  const buf = Buffer.from(bytes);
  const eocdSig = 0x06054b50;
  const scanFrom = Math.max(0, buf.length - 66_000);
  let eocd = -1;
  for (let i = buf.length - 22; i >= scanFrom; i--) {
    if (buf.readUInt32LE(i) === eocdSig) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0 || eocd + 22 > buf.length) return false;
  const entries = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOff = buf.readUInt32LE(eocd + 16);
  if (!entries || entries > maxEntries) return false;
  if (cdOff > buf.length || cdSize > buf.length || cdOff + cdSize > buf.length) return false;
  let off = cdOff;
  let total = 0;
  for (let n = 0; n < entries; n++) {
    if (off + 46 > buf.length || buf.readUInt32LE(off) !== 0x02014b50) return false;
    const uncomp = buf.readUInt32LE(off + 24);
    if (uncomp === 0xffffffff) return false;
    total += uncomp;
    if (total > maxUncompressed) return false;
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    off += 46 + nameLen + extraLen + commentLen;
  }
  return off <= buf.length;
}
