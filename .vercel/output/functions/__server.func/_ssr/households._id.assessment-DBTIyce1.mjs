import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as RedirectToSignIn } from "./gates-DCAm7mH_.mjs";
import { t as AssessmentDocument } from "./document-DqbC23Za.mjs";
import { n as Route } from "./router-DpE5knej.mjs";
import { n as useHousehold, t as HouseholdMissing } from "./use-household-CH8beRcp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/households._id.assessment-DBTIyce1.js
var import_jsx_runtime = require_jsx_runtime();
function HouseholdAssessment() {
	const { id } = Route.useParams();
	const { user, isPending, pq, error } = useHousehold(id, "assessment");
	if (pq) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentDocument, {
		pq,
		meetingHref: `/households/${id}`,
		preparedBy: pq.advisor
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-navy-deep" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdMissing, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-navy-deep" });
}
//#endregion
export { HouseholdAssessment as component };
