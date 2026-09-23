//#region node_modules/.nitro/vite/services/ssr/assets/format-DK-owqV6.js
function formatMoney(value, opts) {
	if (!Number.isFinite(value)) return "—";
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (opts?.compact && abs >= 1e6) {
		const n = abs / 1e6;
		return `${sign}$${n.toFixed(n >= 10 ? 1 : 2)}M`;
	}
	if (opts?.compact && abs >= 1e3) {
		const n = abs / 1e3;
		return `${sign}$${n.toFixed(n >= 100 ? 0 : 1)}k`;
	}
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: opts?.cents ? 2 : 0,
		minimumFractionDigits: opts?.cents ? 2 : 0
	}).format(value);
}
function parseMoney(raw) {
	const cleaned = raw.replace(/[^0-9.-]/g, "");
	if (!cleaned || cleaned === "-" || cleaned === ".") return 0;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : 0;
}
function ageFromDob(dob, asOf = /* @__PURE__ */ new Date()) {
	if (!dob) return null;
	const d = new Date(dob);
	if (Number.isNaN(d.getTime())) return null;
	let age = asOf.getFullYear() - d.getFullYear();
	const m = asOf.getMonth() - d.getMonth();
	if (m < 0 || m === 0 && asOf.getDate() < d.getDate()) age -= 1;
	return age >= 0 && age < 130 ? age : null;
}
function formatDate(iso) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
function relativeSaved(iso) {
	if (!iso) return "Not saved";
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return "Saved";
	const s = Math.round((Date.now() - t) / 1e3);
	if (s < 8) return "Saved";
	if (s < 60) return "Saved just now";
	if (s < 3600) return `Saved ${Math.floor(s / 60)}m ago`;
	return `Saved ${formatDate(iso)}`;
}
//#endregion
export { relativeSaved as a, parseMoney as i, formatDate as n, formatMoney as r, ageFromDob as t };
