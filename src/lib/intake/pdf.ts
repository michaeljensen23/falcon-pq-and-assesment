import { inflateRawSync, inflateSync } from "node:zlib";
import { MAX_EXTRACT_CHARS } from "./limits";

const SCALE_RE =
  /\$\s*\(?\s*,?0{3}\)?|\(\s*,?000\s*\)|in thousands|amounts in 000|\$000s|\$\s*\(000\)/i;

function unescapePdf(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] !== "\\") {
      out += raw[i];
      continue;
    }
    const n = raw[i + 1];
    if (n === "n") {
      out += "\n";
      i += 1;
    } else if (n === "r") {
      out += "\r";
      i += 1;
    } else if (n === "t") {
      out += "\t";
      i += 1;
    } else if (n === "(" || n === ")" || n === "\\") {
      out += n;
      i += 1;
    } else if (n && n >= "0" && n <= "7") {
      let oct = n;
      i += 1;
      const n2 = raw[i + 1];
      if (n2 && n2 >= "0" && n2 <= "7") {
        oct += n2;
        i += 1;
      }
      const n3 = raw[i + 1];
      if (n3 && n3 >= "0" && n3 <= "7") {
        oct += n3;
        i += 1;
      }
      out += String.fromCharCode(parseInt(oct, 8));
    } else {
      i += 1;
    }
  }
  return out;
}

function parseParen(s: string, i: number): { text: string; i: number } {
  let buf = "";
  let esc = false;
  for (let j = i + 1; j < s.length; j++) {
    const c = s[j]!;
    if (esc) {
      buf += c;
      esc = false;
      continue;
    }
    if (c === "\\") {
      esc = true;
      continue;
    }
    if (c === ")") return { text: unescapePdf(buf), i: j };
    buf += c;
  }
  return { text: unescapePdf(buf), i: s.length };
}

function stringsFromContent(s: string): string[] {
  const lines: string[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      const parsed = parseParen(s, i);
      i = parsed.i;
      let k = i + 1;
      while (k < s.length && s[k] === " ") k += 1;
      if (s.startsWith("Tj", k) && parsed.text.trim()) lines.push(parsed.text);
    } else if (s[i] === "[") {
      let j = i + 1;
      let piece = "";
      let depth = 1;
      while (j < s.length && depth > 0) {
        if (s[j] === "(") {
          const parsed = parseParen(s, j);
          piece += parsed.text;
          j = parsed.i + 1;
          continue;
        }
        if (s[j] === "[") depth += 1;
        else if (s[j] === "]") depth -= 1;
        j += 1;
      }
      let k = j;
      while (k < s.length && s[k] === " ") k += 1;
      if (s.startsWith("TJ", k) && piece.trim()) lines.push(piece);
      i = j;
    }
  }
  return lines;
}

function inflateStream(payload: Buffer): Buffer | null {
  const opts = { maxOutputLength: 1_500_000 };
  try {
    return inflateSync(payload, opts);
  } catch {
    /* try raw */
  }
  try {
    return inflateRawSync(payload, opts);
  } catch {
    return null;
  }
}

/**
 * Fast, worker-free text extract from typical statement PDFs (FlateDecode + Tj/TJ).
 * Avoids shipping a PDF.js worker through the app server.
 */
export function pdfToText(bytes: Uint8Array): string {
  const latin = Buffer.from(bytes).toString("latin1");
  const lines: string[] = [];
  let pos = 0;
  let streams = 0;
  while (pos < latin.length && streams < 48 && lines.length < 4_000) {
    const start = latin.indexOf("stream", pos);
    if (start < 0) break;
    let i = start + 6;
    if (latin[i] === "\r") i += 1;
    if (latin[i] === "\n") i += 1;
    const end = latin.indexOf("endstream", i);
    if (end < 0) break;
    pos = end + 9;
    streams += 1;
    let payload = Buffer.from(latin.slice(i, end), "latin1");
    while (
      payload.length &&
      (payload[payload.length - 1] === 10 || payload[payload.length - 1] === 13)
    ) {
      payload = payload.subarray(0, payload.length - 1);
    }
    const decoded = inflateStream(payload);
    if (!decoded) continue;
    const s = decoded.toString("latin1");
    if (!s.includes("Tj") && !s.includes("TJ")) continue;
    if (!s.includes("BT") && !s.includes("Tm")) continue;
    for (const line of stringsFromContent(s)) {
      const t = line.replace(/\s+/g, " ").trim();
      if (t) lines.push(t);
    }
  }
  let text = lines.join("\n").trim();
  if (!text) return "";
  if (SCALE_RE.test(text)) {
    text = `[SCALE: figures on this statement are in thousands of dollars. Multiply every table amount by 1,000 before storing money.]\n\n${text}`;
  }
  return text.length > MAX_EXTRACT_CHARS ? text.slice(0, MAX_EXTRACT_CHARS) : text;
}

export function pdfTextIsUseful(text: string): boolean {
  const body = text.replace(/\[SCALE:[^\]]+\]/g, "").replace(/\s+/g, " ").trim();
  return body.length >= 80;
}
