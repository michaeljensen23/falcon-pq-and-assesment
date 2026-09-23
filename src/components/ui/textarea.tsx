import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-lg bg-cream px-3 py-2 text-sm text-ink shadow-[var(--shadow-border)] placeholder:text-slate/70 focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
