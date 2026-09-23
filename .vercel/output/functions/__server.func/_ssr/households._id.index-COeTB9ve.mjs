import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as UserButton, t as RedirectToSignIn } from "./gates-DCAm7mH_.mjs";
import { m as householdLabel, t as computeTotals } from "./totals-Dlg9CZvQ.mjs";
import { a as relativeSaved } from "./format-DK-owqV6.mjs";
import { t as SECTIONS } from "./sections-B44NPx6A.mjs";
import { t as MeetingWorkspace } from "./workspace-BXsBijN1.mjs";
import { r as Route$1 } from "./router-DpE5knej.mjs";
import { o as suggestFollowUps } from "./households-Cc-I3iZZ.mjs";
import { n as useHousehold, t as HouseholdMissing } from "./use-household-CH8beRcp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/households._id.index-COeTB9ve.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HouseholdMeeting() {
	const { id } = Route$1.useParams();
	const { user, isPending, pq, updatedAt, error, persist } = useHousehold(id, "meeting");
	const [aiBusy, setAiBusy] = (0, import_react.useState)(false);
	const [aiText, setAiText] = (0, import_react.useState)(null);
	const [aiSection, setAiSection] = (0, import_react.useState)(null);
	async function onAskAi(sectionId) {
		if (!pq) return;
		const def = SECTIONS.find((s) => s.id === sectionId);
		const totals = computeTotals(pq);
		setAiBusy(true);
		setAiSection(sectionId);
		try {
			const res = await suggestFollowUps({ data: {
				section: def?.label ?? sectionId,
				prompt: def?.prompt ?? "",
				snapshot: JSON.stringify({
					names: householdLabel(pq),
					totals: {
						cash: totals.cash,
						deferred: totals.deferred,
						roth: totals.roth,
						investments: totals.investments,
						expenses: totals.expenses,
						shortage: totals.shortage
					},
					notes: pq.sectionNotes[sectionId] ?? "",
					goals: pq.goals,
					concerns: pq.concerns
				}, null, 0)
			} });
			setAiText(res.ok ? res.text : res.error);
		} catch {
			setAiText("Could not reach Grok just now.");
		} finally {
			setAiBusy(false);
		}
	}
	if (pq) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingWorkspace, {
		title: householdLabel(pq),
		pq,
		onChange: persist,
		saveState: relativeSaved(updatedAt),
		assessmentHref: `/households/${id}/assessment`,
		householdId: id,
		onAskAi,
		aiBusy,
		aiText,
		aiSection,
		headerRight: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-paper" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdMissing, { message: "This meeting file is no longer on the server. Open the book of business to pick up Hammarth or another household." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 animate-pulse bg-paper-2" })
	});
}
//#endregion
export { HouseholdMeeting as component };
