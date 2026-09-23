import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as FalconWordmark } from "./falcon-mark-C0hhzhYm.mjs";
import { n as UserButton } from "./gates-DCAm7mH_.mjs";
import { t as RequireAuth } from "./auth-gate-Dcm51oqg.mjs";
import { t as Button } from "./button-BRLKHV4M.mjs";
import { n as formatDate, r as formatMoney } from "./format-DK-owqV6.mjs";
import { s as Plus } from "../_libs/lucide-react.mjs";
import { a as Label, i as Input, n as Dialog, r as DialogContent, t as Badge } from "./label-DhrC2xFK.mjs";
import { r as listHouseholds, t as createHousehold } from "./households-Cc-I3iZZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D4fTtETF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOfBusiness, {}) });
}
function BookOfBusiness() {
	const navigate = useNavigate();
	const [rows, setRows] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		listHouseholds().then(setRows).catch(() => setRows([]));
	}, []);
	async function create() {
		setCreating(true);
		try {
			const { id } = await createHousehold({ data: {
				firstName,
				lastName
			} });
			setOpen(false);
			await navigate({
				to: "/households/$id",
				params: { id }
			});
		} finally {
			setCreating(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 items-center justify-between gap-3 border-b border-border bg-cream px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconWordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/demo",
							children: "Sample"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-5xl px-4 py-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.18em] text-brass-dim",
						children: "Book of business"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl text-navy",
						children: "Households in discovery"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New household"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 divide-y divide-border overflow-hidden rounded-xl bg-cream shadow-[var(--shadow-border)]",
					children: rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse bg-paper-2" }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-16 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-navy",
							children: "No households yet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-slate",
							children: "Start a discovery or open the Hammarth sample."
						})]
					}) : rows.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/households/$id",
						params: { id: h.id },
						className: "flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-paper/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium text-navy",
									children: h.displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-slate",
									children: [
										"Updated ",
										formatDate(h.updatedAt),
										h.advisorName ? ` · ${h.advisorName}` : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "tabular text-sm text-navy",
									children: formatMoney(h.totalAssets)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-slate",
									children: "investable"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: h.status === "delivered" ? "sage" : h.status === "review" ? "brass" : "muted",
								children: h.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-16 text-right text-xs tabular text-slate",
								children: [h.completeness, "%"]
							})
						]
					}, h.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					title: "New household",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "fn",
								children: "Client first name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "fn",
								className: "mt-1",
								value: firstName,
								onChange: (e) => setFirstName(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "ln",
								children: "Last name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "ln",
								className: "mt-1",
								value: lastName,
								onChange: (e) => setLastName(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => void create(),
								disabled: creating,
								children: "Open meeting"
							})
						]
					})
				})
			})
		]
	});
}
//#endregion
export { Home as component };
