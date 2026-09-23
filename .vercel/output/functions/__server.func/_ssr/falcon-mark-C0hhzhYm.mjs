import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-Pdh8pBxf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/falcon-mark-C0hhzhYm.js
var import_jsx_runtime = require_jsx_runtime();
function FalconMark({ className, gold = true }) {
	const fill = gold ? "var(--color-brass)" : "currentColor";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 64 64",
		className: cn("shrink-0", className),
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			fill,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M32 6c2.4 6.8 4.2 12 4.2 18.4 0 4.6-1.4 8.4-4.2 11.6-2.8-3.2-4.2-7-4.2-11.6C27.8 18 29.6 12.8 32 6Z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M32 10c6.2 4.8 11.4 7.6 16.8 8.2 4.2.5 8.2-.4 12.2-2.4-3.6 6.4-8.2 10.4-13.8 12.2-4.4 1.4-8.6.8-12.4-1.6 1.6-5.2 0.2-10.6-2.8-16.4Z",
					opacity: "0.92"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M32 10C25.8 14.8 20.6 17.6 15.2 18.2 11 18.7 7 17.8 3 15.8c3.6 6.4 8.2 10.4 13.8 12.2 4.4 1.4 8.6.8 12.4-1.6-1.6-5.2-.2-10.6 2.8-16.4Z",
					opacity: "0.92"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M36.4 36.4c5.8 1.4 10.6 4.6 14.4 9.4 3 3.8 5 8.2 6 13.2-7.2-2.4-12.8-6.4-16.8-11.8-2.6-3.6-4-7.2-3.6-10.8Z",
					opacity: "0.85"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M27.6 36.4c-5.8 1.4-10.6 4.6-14.4 9.4-3 3.8-5 8.2-6 13.2 7.2-2.4 12.8-6.4 16.8-11.8 2.6-3.6 4-7.2 3.6-10.8Z",
					opacity: "0.85"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M32 34c1.8 7.4 1.4 14.2 0 24-1.4-9.8-1.8-16.6 0-24Z" })
			]
		})
	});
}
function FalconWordmark({ className, inverted = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FalconMark, {
			className: "size-8",
			gold: true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("font-display text-[1.35rem] font-semibold tracking-tight", inverted ? "text-cream" : "text-navy"),
				children: "Falcon Wealth"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em]", inverted ? "text-brass" : "text-brass-dim"),
				children: "Planning made simple"
			})]
		})]
	});
}
//#endregion
export { FalconWordmark as n, FalconMark as t };
