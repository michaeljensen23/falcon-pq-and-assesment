//#region node_modules/.nitro/vite/services/ssr/assets/firm-email-XfcvrAu2.js
/** Firm Google Workspace domain. Only these accounts may use the workspace. */
var FIRM_EMAIL_DOMAIN = "falconwp.com";
function isFirmEmail(email) {
	if (!email) return false;
	const normalized = email.trim().toLowerCase();
	const at = normalized.lastIndexOf("@");
	if (at < 1) return false;
	return normalized.slice(at + 1) === FIRM_EMAIL_DOMAIN;
}
//#endregion
export { isFirmEmail as n, FIRM_EMAIL_DOMAIN as t };
