import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as FalconWordmark } from "./falcon-mark-C0hhzhYm.mjs";
import { n as useCurrentUserState } from "./use-current-user-BbAt2l2q.mjs";
import { f as emptyPq } from "./totals-Dlg9CZvQ.mjs";
import { t as Button } from "./button-BRLKHV4M.mjs";
import { a as saveHousehold, i as recoverHousehold, n as getHousehold } from "./households-Cc-I3iZZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-household-CH8beRcp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HouseholdMissing({ message = "This household file is no longer on the server." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-paper px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconWordmark, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-8 font-display text-3xl text-navy",
					children: "Household not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-slate",
					children: message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Back to book of business"
					})
				})
			]
		})
	});
}
var PREFIX = "falcon-household-draft:";
function key(id) {
	return `${PREFIX}${id}`;
}
function loadHouseholdDraft(id) {
	if (typeof window === "undefined" || !id) return null;
	try {
		const raw = window.localStorage.getItem(key(id));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.pq || typeof parsed.pq !== "object") return null;
		return {
			pq: {
				...emptyPq(),
				...parsed.pq
			},
			savedAt: parsed.savedAt || (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch {
		return null;
	}
}
function saveHouseholdDraft(id, pq) {
	if (typeof window === "undefined" || !id) return;
	try {
		const draft = {
			pq,
			savedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		window.localStorage.setItem(key(id), JSON.stringify(draft));
	} catch {}
}
function useHousehold(id, kind = "meeting") {
	const navigate = useNavigate();
	const { user, isPending } = useCurrentUserState();
	const userId = user?.id ?? null;
	const [pq, setPq] = (0, import_react.useState)(null);
	const [updatedAt, setUpdatedAt] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const pqRef = (0, import_react.useRef)(null);
	const fileIdRef = (0, import_react.useRef)(id);
	const timer = (0, import_react.useRef)(null);
	pqRef.current = pq;
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		let cancelled = false;
		fileIdRef.current = id;
		async function load() {
			try {
				const h = await getHousehold({ data: id });
				if (cancelled) return;
				if (h) {
					const draft = loadHouseholdDraft(h.id) ?? loadHouseholdDraft(id);
					const newerDraft = draft && draft.savedAt > h.updatedAt;
					fileIdRef.current = h.id;
					setPq(newerDraft ? draft.pq : h.pq);
					setUpdatedAt(newerDraft ? draft.savedAt : h.updatedAt);
					setError(null);
					if (newerDraft) saveHousehold({ data: {
						id: h.id,
						pq: draft.pq
					} }).then((r) => {
						if (!cancelled) setUpdatedAt(r.updatedAt);
					});
					else saveHouseholdDraft(h.id, h.pq);
					return;
				}
				const draft = loadHouseholdDraft(id);
				if (draft) {
					fileIdRef.current = id;
					setPq(draft.pq);
					setUpdatedAt(draft.savedAt);
					setError(null);
					saveHousehold({ data: {
						id,
						pq: draft.pq
					} }).then((r) => {
						if (!cancelled) setUpdatedAt(r.updatedAt);
					});
					return;
				}
				const recovered = await recoverHousehold();
				if (cancelled) return;
				if (recovered) {
					fileIdRef.current = recovered.id;
					setPq(recovered.pq);
					setUpdatedAt(recovered.updatedAt);
					setError(null);
					saveHouseholdDraft(recovered.id, recovered.pq);
					if (recovered.id !== id) {
						if (kind === "assessment") await navigate({
							to: "/households/$id/assessment",
							params: { id: recovered.id },
							replace: true
						});
						else await navigate({
							to: "/households/$id",
							params: { id: recovered.id },
							replace: true
						});
					}
					return;
				}
				if (pqRef.current) return;
				setError("Household not found.");
			} catch {
				const draft = loadHouseholdDraft(id);
				if (draft) {
					fileIdRef.current = id;
					setPq(draft.pq);
					setUpdatedAt(draft.savedAt);
					setError(null);
					return;
				}
				if (pqRef.current) return;
				setError("Could not load this household.");
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [
		id,
		userId,
		kind,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, []);
	function persist(next, status) {
		setPq(next);
		const fileId = fileIdRef.current;
		saveHouseholdDraft(fileId, next);
		if (fileId !== id) saveHouseholdDraft(id, next);
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			saveHousehold({ data: {
				id: fileId,
				pq: next,
				status
			} }).then((r) => setUpdatedAt(r.updatedAt)).catch(() => void 0);
		}, 700);
	}
	return {
		user,
		isPending,
		pq,
		updatedAt,
		error,
		persist
	};
}
//#endregion
export { useHousehold as n, HouseholdMissing as t };
