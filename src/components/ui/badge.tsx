import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-navy text-cream",
        muted: "bg-paper-2 text-slate",
        brass: "bg-brass/20 text-brass-dim",
        sage: "bg-sage/15 text-sage",
        rust: "bg-rust/15 text-rust",
        outline: "shadow-[var(--shadow-border)] text-navy",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
