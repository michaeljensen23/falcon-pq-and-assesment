import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/limits-D0iI08tS.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out (auth on — the default, including live preview) -> throws
* `UnauthorizedError` (see `verify.server.ts`). Only when auth is explicitly
* disabled (`VITE_AUTH_ENABLED=false`) does it resolve the shared dev user and
* never throw. Use it on every server function that touches per-user data, and
* scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B6w7Ysfi.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-Cf0zU2sM.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var MAX_B64_CHARS = Math.ceil(4194304) + 16;
var MAX_NOTES_CHARS = 4e4;
var MAX_EXTRACT_CHARS = 8e4;
var MAX_BUNDLE_CHARS = 18e4;
var MAX_FIELD_CHARS = 4e3;
var MAX_NOTE_FIELD_CHARS = 12e3;
var FILL_COOLDOWN_MS = 8e3;
var FOLLOWUP_COOLDOWN_MS = 2e3;
var EXT_KIND = {
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
	xlsx: "xlsx"
};
var KIND_MIME = {
	pdf: "application/pdf",
	image: "image/jpeg",
	text: "text/plain",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};
function fileExt(name) {
	const parts = (name.replace(/\\/g, "/").split("/").pop() ?? "").toLowerCase().split(".");
	if (parts.length < 2) return "";
	return parts.pop() ?? "";
}
function kindFromFilename(name) {
	return EXT_KIND[fileExt(name)] ?? null;
}
function mimeForKind(kind, filename) {
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
/** Client-side gate: allow missing extensions when the browser supplies a known MIME. */
function isLikelyUpload(filename, mime = "") {
	if (kindFromFilename(filename)) return true;
	const m = mime.toLowerCase();
	if (m === "application/pdf") return true;
	if (m.startsWith("image/") && !m.includes("svg")) return true;
	if (m.includes("spreadsheet") || m.includes("excel")) return true;
	if (m === "text/plain" || m === "text/csv" || m === "text/markdown" || m === "application/json") return true;
	return false;
}
function mimeFromFilename(name, fallback = "") {
	const kind = kindFromFilename(name);
	return kind ? mimeForKind(kind, name) : fallback;
}
function kindOf(filename, _mime) {
	return kindFromFilename(filename) ?? "text";
}
function sanitizeFilename(name) {
	return (name.replace(/\\/g, "/").split("/").pop() ?? "document").replace(/[^\w.\- ()[\]]+/g, "_").replace(/^\.+/, "").slice(0, 160) || "document";
}
function requireId(value, label = "id") {
	if (typeof value !== "string") throw new Error(`Invalid ${label}`);
	const id = value.trim();
	if (!id || id.length > 120) throw new Error(`Invalid ${label}`);
	return id;
}
function startsWith(bytes, sig) {
	if (bytes.length < sig.length) return false;
	return sig.every((b, i) => bytes[i] === b);
}
function zipLooksLikeXlsx(bytes) {
	const head = new TextDecoder("latin1").decode(bytes.slice(0, Math.min(bytes.length, 16384)));
	return head.includes("xl/") || head.includes("xl\\");
}
/** Magic-byte sniff so a renamed HTML file cannot pose as a PDF or image. */
function sniffKind(bytes) {
	if (startsWith(bytes, [
		37,
		80,
		68,
		70
	])) return "pdf";
	if (startsWith(bytes, [
		255,
		216,
		255
	])) return "image";
	if (startsWith(bytes, [
		137,
		80,
		78,
		71,
		13,
		10,
		26,
		10
	])) return "image";
	if (startsWith(bytes, [
		71,
		73,
		70,
		56
	])) return "image";
	if (bytes.length >= 12 && startsWith(bytes, [
		82,
		73,
		70,
		70
	]) && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80) return "image";
	if (startsWith(bytes, [
		80,
		75,
		3,
		4
	]) || startsWith(bytes, [
		80,
		75,
		5,
		6
	])) return zipLooksLikeXlsx(bytes) ? "xlsx" : null;
	if (startsWith(bytes, [
		208,
		207,
		17,
		224
	])) return null;
	if (bytes.includes(0)) return null;
	const head = new TextDecoder("utf-8").decode(bytes.slice(0, 256)).trimStart().toLowerCase();
	if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<svg") || head.startsWith("<script") || head.startsWith("<?xml")) return null;
	return "text";
}
function bytesFromBase64(compact) {
	if (typeof Buffer !== "undefined") return Buffer.from(compact, "base64");
	const bin = atob(compact);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
function decodeBase64(raw) {
	const compact = raw.replace(/\s+/g, "");
	if (!compact || compact.length > MAX_B64_CHARS) throw new Error("File is too large.");
	if (!/^[A-Za-z0-9+/]+=*$/.test(compact)) throw new Error("File data was not valid.");
	const bytes = bytesFromBase64(compact);
	if (!bytes.length) throw new Error("The file was empty.");
	if (bytes.length > 3145728) throw new Error("Each file must be 3 MB or smaller.");
	return bytes;
}
function encodeBase64(bytes) {
	if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin);
}
function inspectFile(filename, bytes) {
	const safeName = sanitizeFilename(filename);
	const named = kindFromFilename(safeName);
	const sniffed = sniffKind(bytes);
	if (!sniffed) throw new Error("That file type is not accepted. Use PDF, image, text, CSV, or Excel (.xlsx).");
	if (named && named !== sniffed) throw new Error("That file type is not accepted. Use PDF, image, text, CSV, or Excel (.xlsx).");
	const kind = named ?? sniffed;
	let outName = safeName;
	if (!named) {
		const ext = kind === "image" ? "jpg" : kind === "xlsx" ? "xlsx" : kind === "pdf" ? "pdf" : "txt";
		if (!fileExt(outName)) outName = `${outName}.${ext}`;
	}
	let mime = mimeForKind(kind, outName);
	if (kind === "image") {
		if (startsWith(bytes, [
			137,
			80,
			78,
			71
		])) mime = "image/png";
		else if (startsWith(bytes, [
			71,
			73,
			70
		])) mime = "image/gif";
		else if (startsWith(bytes, [
			82,
			73,
			70,
			70
		])) mime = "image/webp";
		else mime = "image/jpeg";
	}
	return {
		kind,
		mime,
		filename: outName
	};
}
function safeJsonParse(text) {
	if (text.length > 25e4) throw new Error("Model response was too large.");
	return JSON.parse(text, (key, value) => {
		if (key === "__proto__" || key === "constructor" || key === "prototype") return void 0;
		return value;
	});
}
function publicError(err, fallback) {
	const message = err instanceof Error ? err.message : fallback;
	if (!message || message.length > 180) return fallback;
	if (/[{}\n]|api\.x\.ai|Bearer|ECONN|fetch|Grok error|Could not stage|stack|at \/|Unexpected|SyntaxError/i.test(message)) return fallback;
	return message;
}
//#endregion
export { safeJsonParse as _, MAX_FIELD_CHARS as a, authMiddleware as c, inspectFile as d, isLikelyUpload as f, requireId as g, publicError as h, MAX_EXTRACT_CHARS as i, decodeBase64 as l, mimeFromFilename as m, FOLLOWUP_COOLDOWN_MS as n, MAX_NOTES_CHARS as o, kindOf as p, MAX_BUNDLE_CHARS as r, MAX_NOTE_FIELD_CHARS as s, FILL_COOLDOWN_MS as t, encodeBase64 as u };
