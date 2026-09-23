import { useEffect, type ReactNode } from "react";
import { FalconWordmark } from "@/components/brand/falcon-mark";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isFirmEmail } from "@/lib/firm-email";

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-navy">
      <FalconWordmark inverted className="h-36" />
    </div>
  );
}

/** Branded lock: wait for the session, then send guests to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const allowed = isFirmEmail(user?.primaryEmail);

  useEffect(() => {
    if (isPending || !user || allowed) return;
    void signOut("/login?reason=domain");
  }, [isPending, user, allowed]);

  if (isPending) return <Splash />;
  if (!user) return <RedirectToSignIn />;
  if (!allowed) return <Splash />;
  return <>{children}</>;
}
