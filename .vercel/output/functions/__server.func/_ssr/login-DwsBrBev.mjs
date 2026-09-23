import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as signIn, i as oauthPopupTarget, o as signOut, r as oauthPopupPath } from "./client-B6w7Ysfi.mjs";
import { n as isFirmEmail, t as FIRM_EMAIL_DOMAIN } from "./firm-email-XfcvrAu2.mjs";
import { t as FalconMark } from "./falcon-mark-C0hhzhYm.mjs";
import { n as useCurrentUserState } from "./use-current-user-BbAt2l2q.mjs";
import { t as Button } from "./button-BRLKHV4M.mjs";
import { t as GROK_PROVIDERS } from "./server-yY5cJ_0I.mjs";
import { i as Route$6 } from "./router-DpE5knej.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DwsBrBev.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function friendlySignInError(err) {
	const raw = err instanceof Error ? err.message : "";
	const lower = raw.toLowerCase();
	if (lower.includes("pop-up") || lower.includes("popup")) return "The Google window was blocked. Allow pop-ups for this page and try again.";
	if (lower.includes("cancelled") || lower.includes("canceled")) return "Sign-in didn’t finish. Try Continue with Google again.";
	if (raw) return raw;
	return "Google sign-in didn’t start. Try again.";
}
function Login() {
	const { reason } = Route$6.useSearch();
	const { user, isPending } = useCurrentUserState();
	const google = GROK_PROVIDERS.find((p) => p.idp === "google");
	const allowed = isFirmEmail(user?.primaryEmail);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (isPending || !user || allowed) return;
		signOut("/login?reason=domain");
	}, [
		isPending,
		user,
		allowed
	]);
	async function onGoogle() {
		if (!google || busy) return;
		setError(null);
		setBusy(true);
		try {
			await signIn(google.providerId, {
				callbackURL: "/",
				errorCallbackURL: "/login"
			});
		} catch (err) {
			setError(friendlySignInError(err));
			setBusy(false);
		}
	}
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-navy" });
	if (user && allowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	if (user && !allowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-navy" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-navy px-6 py-10 text-cream",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconMark, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: "Falcon Discovery"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.18em] text-brass",
						children: "Planning made simple"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Advisor sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-mist/80",
					children: [
						"Use a Google account on @",
						FIRM_EMAIL_DOMAIN,
						". Other accounts cannot open this workspace."
					]
				}),
				reason === "domain" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 rounded-md bg-white/5 px-3 py-2 text-sm text-brass",
					children: [
						"That Google account isn’t on @",
						FIRM_EMAIL_DOMAIN,
						". Sign in with your Falcon Wealth account."
					]
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 rounded-md bg-white/5 px-3 py-2 text-sm text-brass",
					role: "alert",
					children: error
				}) : null,
				google ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cream",
					className: "mt-8 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: oauthPopupPath(google.providerId),
						target: oauthPopupTarget(google.providerId),
						rel: "opener",
						"aria-disabled": busy,
						className: busy ? "pointer-events-none opacity-40" : void 0,
						onClick: (event) => {
							if (busy) {
								event.preventDefault();
								return;
							}
							try {
								if (window.self === window.top) event.preventDefault();
							} catch {}
							onGoogle();
						},
						children: busy ? "Opening Google…" : "Continue with Google"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-sm text-mist",
					children: "Sign-in is disabled."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-10 text-center text-xs text-mist/50",
					children: [
						"Falcon Wealth Planning · @",
						FIRM_EMAIL_DOMAIN,
						" only"
					]
				})
			]
		})
	});
}
//#endregion
export { Login as component };
