import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as HAMMARTH_NAME } from "./hammarth-CxIEwxng.mjs";
import { n as saveDemoPq, t as loadDemoPq } from "./demo-storage-BhzjAEDi.mjs";
import { t as MeetingWorkspace } from "./workspace-BXsBijN1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo.index-Dp4_93OL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DemoMeeting() {
	const [pq, setPq] = (0, import_react.useState)(() => loadDemoPq());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingWorkspace, {
		title: HAMMARTH_NAME,
		pq,
		onChange: (next) => {
			setPq(next);
			saveDemoPq(next);
		},
		saveState: "Sample — this browser only",
		assessmentHref: "/demo/assessment",
		backHref: "/",
		backLabel: "Book of business",
		banner: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-print bg-brass px-4 py-2 text-center text-sm text-navy-deep",
			children: "Sample household from a completed discovery. Open a household from the book to keep a permanent copy."
		})
	});
}
//#endregion
export { DemoMeeting as component };
