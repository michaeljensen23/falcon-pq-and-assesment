import "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-Pdh8pBxf.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
function DialogContent({ className, children, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-navy-deep/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-cream p-5 shadow-[var(--shadow-border-hover)]", className),
		children: [
			title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display text-xl text-navy",
				children: title
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "sr-only",
				children: "Dialog"
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				className: "absolute top-3 right-3 rounded-sm p-1 text-slate hover:bg-paper-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})
		]
	})] });
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-navy text-cream",
		muted: "bg-paper-2 text-slate",
		brass: "bg-brass/20 text-brass-dim",
		sage: "bg-sage/15 text-sage",
		rust: "bg-rust/15 text-rust",
		outline: "shadow-[var(--shadow-border)] text-navy"
	} },
	defaultVariants: { variant: "muted" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-10 w-full rounded-md bg-cream px-3 text-sm text-ink shadow-[var(--shadow-border)] transition-[box-shadow] placeholder:text-slate/70 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-slate", className),
		...props
	});
}
//#endregion
export { Label as a, Input as i, Dialog as n, DialogContent as r, Badge as t };
