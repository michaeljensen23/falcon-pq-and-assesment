import { r as createServerFn } from "./ssr.mjs";
import { _ as safeJsonParse, c as authMiddleware, g as requireId } from "./limits-D0iI08tS.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/households-Cc-I3iZZ.js
var listHouseholds = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2ec285bca9942b03faf6e4f1fe3592a3082210798a274ef3419db0d0973c6ee2"));
var getHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => requireId(id, "household")).handler(createSsrRpc("a401b5978495d023aee0cc99b74692c8f36653f607a30d9216fcaf473ef10c22"));
/** After a missing file: reseed the sample and, if this advisor has a single file, return it. */
var recoverHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("7cd19084f7d50a7aa02c48889ac16966cc92bac2fc7f7f3e245a4dbaca460448"));
var createHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const rec = input && typeof input === "object" ? input : {};
	return {
		firstName: typeof rec.firstName === "string" ? rec.firstName.trim().slice(0, 80) : "",
		lastName: typeof rec.lastName === "string" ? rec.lastName.trim().slice(0, 80) : ""
	};
}).handler(createSsrRpc("64e25f0dfb684163433e7448dbac904960c5c401bce4c8742fc536bdd6ef602b"));
var saveHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Invalid household");
	const rec = input;
	if (!rec.pq || typeof rec.pq !== "object") throw new Error("Invalid questionnaire");
	const pqJson = JSON.stringify(rec.pq);
	if (pqJson.length > 4e5) throw new Error("Questionnaire is too large.");
	const pq = safeJsonParse(pqJson);
	const status = rec.status === "discovery" || rec.status === "review" || rec.status === "delivered" ? rec.status : void 0;
	return {
		id: requireId(rec.id, "household"),
		pq,
		status
	};
}).handler(createSsrRpc("cb33c68a467ce2a5978c61f2815224bea901c02832e97f66683e0ca8c337a23a"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => requireId(id, "household")).handler(createSsrRpc("71eb9981a1cb7906c6da9e38287459dcdc5922153487bc1da936ed73bc04e239"));
var suggestFollowUps = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("Invalid request");
	const rec = input;
	return {
		section: typeof rec.section === "string" ? rec.section.slice(0, 80) : "",
		prompt: typeof rec.prompt === "string" ? rec.prompt.slice(0, 2e3) : "",
		snapshot: typeof rec.snapshot === "string" ? rec.snapshot.slice(0, 8e3) : ""
	};
}).handler(createSsrRpc("72f718a1863a5cd7e1ab07fda9b03701e563c69ec3d71988388d22ae393e11cc"));
//#endregion
export { saveHousehold as a, recoverHousehold as i, getHousehold as n, suggestFollowUps as o, listHouseholds as r, createHousehold as t };
