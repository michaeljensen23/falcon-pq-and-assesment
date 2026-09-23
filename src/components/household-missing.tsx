import { Link } from "@tanstack/react-router";
import { FalconWordmark } from "@/components/brand/falcon-mark";
import { Button } from "@/components/ui/button";

export function HouseholdMissing({
  message = "This household file is no longer on the server.",
}: {
  message?: string;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div className="max-w-md">
        <div className="flex justify-center">
          <FalconWordmark className="h-24" />
        </div>
        <h1 className="mt-8 font-display text-3xl text-navy">Household not found</h1>
        <p className="mt-3 text-sm text-slate">{message}</p>
        <Button asChild className="mt-8">
          <Link to="/">Back to book of business</Link>
        </Button>
      </div>
    </main>
  );
}
