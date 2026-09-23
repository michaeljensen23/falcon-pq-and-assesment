import "../_runtime.mjs";
import { l as Slot, m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-Pdh8pBxf.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,background-color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-navy text-cream shadow-[var(--shadow-border)] hover:bg-navy-mid",
			brass: "bg-brass text-navy-deep hover:bg-brass-dim",
			outline: "bg-transparent text-navy shadow-[var(--shadow-border)] hover:bg-paper-2",
			ghost: "text-navy hover:bg-paper-2",
			cream: "bg-cream text-navy shadow-[var(--shadow-border)] hover:bg-paper",
			destructive: "bg-rust text-cream hover:opacity-90",
			link: "text-navy-mid underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-5 text-base",
			icon: "size-10",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
