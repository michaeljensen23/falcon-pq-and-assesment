import { i as TSS_SERVER_FUNCTION } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rate-limit-De0ABw4V.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var store = globalThis.__falconRate ??= /* @__PURE__ */ new Map();
/** Process-local cooldown + hourly cap. Fail closed with a public message. */
function consumeRateLimit(key, cooldownMs, hourlyCap) {
	const now = Date.now();
	let bucket = store.get(key);
	if (!bucket) {
		bucket = {
			last: 0,
			hourStart: now,
			hourCount: 0
		};
		store.set(key, bucket);
	}
	if (now - bucket.hourStart >= 36e5) {
		bucket.hourStart = now;
		bucket.hourCount = 0;
	}
	if (now - bucket.last < cooldownMs) return {
		ok: false,
		error: "Please wait a few seconds before asking Grok again."
	};
	if (bucket.hourCount >= hourlyCap) return {
		ok: false,
		error: "Grok limit reached for this hour. Try again later."
	};
	bucket.last = now;
	bucket.hourCount += 1;
	return { ok: true };
}
//#endregion
export { createServerRpc as n, consumeRateLimit as t };
