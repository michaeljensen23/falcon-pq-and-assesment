import assert from "node:assert/strict";
import { test } from "node:test";

const {
  decodeBase64,
  encodeBase64,
  inspectFile,
  isAllowedUpload,
  publicError,
  requireId,
  safeJsonParse,
  sanitizeFilename,
  sniffKind,
  zipUncompressedOk,
  MAX_B64_CHARS,
} = await import("../src/lib/intake/limits.ts");
const { consumeRateLimit } = await import("../src/lib/intake/rate-limit.ts");

test("filename allowlist ignores client MIME and blocks .xls", () => {
  assert.equal(isAllowedUpload("notes.txt", "text/html"), true);
  assert.equal(isAllowedUpload("macro.xls", "application/vnd.ms-excel"), false);
  assert.equal(isAllowedUpload("../../etc/passwd.pdf"), true);
  assert.equal(isAllowedUpload("payload.html"), false);
  assert.equal(sanitizeFilename("../../etc/passwd.pdf"), "passwd.pdf");
  assert.equal(sanitizeFilename(".hidden.pdf"), "hidden.pdf");
});

test("magic-byte sniff rejects masquerades", () => {
  assert.equal(sniffKind(Buffer.from("%PDF-1.7\n")), "pdf");
  assert.equal(sniffKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), "image");
  assert.equal(sniffKind(Buffer.from("<!doctype html>")), null);
  assert.equal(sniffKind(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'>")), null);
  assert.equal(sniffKind(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])), null);
  const zipNotXlsx = Buffer.concat([Buffer.from("PK\u0003\u0004"), Buffer.from("word/document.xml")]);
  assert.equal(sniffKind(zipNotXlsx), null);
  const xlsx = Buffer.concat([Buffer.from("PK\u0003\u0004"), Buffer.from("xl/workbook.xml")]);
  assert.equal(sniffKind(xlsx), "xlsx");
});

test("inspect requires extension and bytes to agree", () => {
  const pdf = Buffer.from("%PDF-1.4\n%EOF");
  assert.equal(inspectFile("return.pdf", pdf).kind, "pdf");
  assert.equal(inspectFile("statement", pdf).kind, "pdf");
  assert.equal(inspectFile("statement", pdf).filename.endsWith(".pdf"), true);
  assert.throws(() => inspectFile("return.txt", pdf));
  assert.throws(() => inspectFile("notes.txt", Buffer.from("<html>alert(1)</html>")));
  assert.throws(() => inspectFile("photo.png", Buffer.from("%PDF-1.4")));
});

test("base64 is capped before decode", () => {
  const ok = encodeBase64(Buffer.from("hello"));
  assert.deepEqual(Buffer.from(decodeBase64(ok)), Buffer.from("hello"));
  assert.throws(() => decodeBase64("!!!!"));
  assert.throws(() => decodeBase64("A".repeat(MAX_B64_CHARS + 1)));
});

test("JSON parse drops prototype keys and publicError hides API bodies", () => {
  const parsed = safeJsonParse('{"advisor":"MJ","__proto__":{"admin":true},"constructor":{"ok":1}}');
  assert.equal(parsed.advisor, "MJ");
  assert.equal(Object.getPrototypeOf(parsed).admin, undefined);
  assert.equal(parsed.admin, undefined);
  assert.equal(
    publicError(new Error('{"error":"Incorrect API key provided: sk-abc"}'), "fallback"),
    "fallback",
  );
  assert.equal(publicError(new Error("Each file must be 3 MB or smaller."), "fallback"), "Each file must be 3 MB or smaller.");
  assert.equal(publicError(new Error('relation "households" does not exist'), "fallback"), "fallback");
  assert.equal(publicError(new Error("password authentication failed"), "fallback"), "fallback");
});

test("zip budget rejects an uncompressed bomb", () => {
  const name = Buffer.from("xl/workbook.xml");
  const entry = Buffer.alloc(46 + name.length);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt32LE(50_000_000, 24);
  entry.writeUInt16LE(name.length, 28);
  name.copy(entry, 46);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(entry.length, 12);
  eocd.writeUInt32LE(0, 16);
  assert.equal(zipUncompressedOk(Buffer.concat([entry, eocd])), false);

  const small = Buffer.alloc(46 + name.length);
  small.writeUInt32LE(0x02014b50, 0);
  small.writeUInt32LE(120, 24);
  small.writeUInt16LE(name.length, 28);
  name.copy(small, 46);
  const eocdOk = Buffer.alloc(22);
  eocdOk.writeUInt32LE(0x06054b50, 0);
  eocdOk.writeUInt16LE(1, 10);
  eocdOk.writeUInt32LE(small.length, 12);
  eocdOk.writeUInt32LE(0, 16);
  assert.equal(zipUncompressedOk(Buffer.concat([small, eocdOk])), true);
  assert.equal(zipUncompressedOk(Buffer.from("not a zip")), false);
});

test("ids and rate limit fail closed", () => {
  assert.equal(requireId("abc-1", "household"), "abc-1");
  assert.equal(requireId("cd2838f3-f703-4265-bbd5-18208ab2808d"), "cd2838f3-f703-4265-bbd5-18208ab2808d");
  assert.throws(() => requireId("", "household"));
  assert.throws(() => requireId("x".repeat(200), "household"));
  assert.throws(() => requireId("../etc/passwd", "household"));
  assert.throws(() => requireId("<script>", "household"));
  assert.throws(() => requireId("id with space", "household"));
  assert.throws(() => requireId("a/b", "household"));
  const first = consumeRateLimit("test:unit", 60_000, 1);
  const second = consumeRateLimit("test:unit", 60_000, 1);
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
});
