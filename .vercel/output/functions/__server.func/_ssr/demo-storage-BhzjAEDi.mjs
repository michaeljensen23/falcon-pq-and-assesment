import { n as HAMMARTH_PQ } from "./hammarth-CxIEwxng.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo-storage-BhzjAEDi.js
var KEY = "falcon-demo-pq";
function loadDemoPq() {
	if (typeof window === "undefined") return structuredClone(HAMMARTH_PQ);
	try {
		const raw = sessionStorage.getItem(KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return structuredClone(HAMMARTH_PQ);
}
function saveDemoPq(pq) {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(KEY, JSON.stringify(pq));
	} catch {}
}
//#endregion
export { saveDemoPq as n, loadDemoPq as t };
