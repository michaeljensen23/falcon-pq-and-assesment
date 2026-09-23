import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as AssessmentDocument } from "./document-DqbC23Za.mjs";
import { t as loadDemoPq } from "./demo-storage-BhzjAEDi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo.assessment-Cm-VqDsW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DemoAssessment() {
	const [pq] = (0, import_react.useState)(() => loadDemoPq());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentDocument, {
		pq,
		meetingHref: "/demo",
		preparedBy: "Michael Jensen, CFP®"
	});
}
//#endregion
export { DemoAssessment as component };
