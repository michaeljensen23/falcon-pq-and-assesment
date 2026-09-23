import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { o as signOut } from "./client-B6w7Ysfi.mjs";
import { n as isFirmEmail } from "./firm-email-XfcvrAu2.mjs";
import { n as FalconWordmark } from "./falcon-mark-C0hhzhYm.mjs";
import { n as useCurrentUserState } from "./use-current-user-BbAt2l2q.mjs";
import { t as RedirectToSignIn } from "./gates-DCAm7mH_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-gate-Dcm51oqg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Splash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-navy",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconWordmark, { inverted: true })
	});
}
/** Branded lock: wait for the session, then send guests to /login. */
function RequireAuth({ children }) {
	const { user, isPending } = useCurrentUserState();
	const allowed = isFirmEmail(user?.primaryEmail);
	(0, import_react.useEffect)(() => {
		if (isPending || !user || allowed) return;
		signOut("/login?reason=domain");
	}, [
		isPending,
		user,
		allowed
	]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!allowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { RequireAuth as t };
