import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "left",
}: {
  className?: string;
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-deep/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-navy text-cream shadow-[var(--shadow-border)]",
          side === "left" ? "left-0" : "right-0",
          className,
        )}
      >
        <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 rounded-sm p-1 text-mist hover:bg-white/10">
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
