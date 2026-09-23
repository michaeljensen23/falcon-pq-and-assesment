import { cn } from "@/lib/utils";

const LOGO_SRC = "/falcon-logo.png";
const MARK_SRC = "/falcon-mark.png";

export function FalconMark({
  className,
  gold: _gold = true,
}: {
  className?: string;
  gold?: boolean;
}) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}

export function FalconWordmark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Falcon Wealth Planning"
      className={cn(
        "block h-16 w-auto shrink-0 object-contain object-left",
        !inverted && "rounded-md",
        className,
      )}
    />
  );
}
