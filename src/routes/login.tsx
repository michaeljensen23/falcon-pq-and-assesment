import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, oauthPopupPath, oauthPopupTarget, signIn, signOut } from "@/lib/auth/client";
import { FalconWordmark } from "@/components/brand/falcon-mark";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { FIRM_EMAIL_DOMAIN, isFirmEmail } from "@/lib/firm-email";

type LoginSearch = { reason?: "domain" };

export const Route = createFileRoute("/login")({
  validateSearch: (raw: Record<string, unknown>): LoginSearch => ({
    reason: raw.reason === "domain" ? "domain" : undefined,
  }),
  component: Login,
});

function friendlySignInError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";
  const lower = raw.toLowerCase();
  if (lower.includes("pop-up") || lower.includes("popup")) {
    return "The Google window was blocked. Allow pop-ups for this page and try again.";
  }
  if (lower.includes("cancelled") || lower.includes("canceled")) {
    return "Sign-in didn’t finish. Try Continue with Google again.";
  }
  return "Google sign-in didn’t start. Try again.";
}

function Login() {
  const { reason } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const google = GROK_PROVIDERS.find((p) => p.idp === "google");
  const allowed = isFirmEmail(user?.primaryEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !user || allowed) return;
    void signOut("/login?reason=domain");
  }, [isPending, user, allowed]);

  async function onGoogle() {
    if (!google || busy) return;
    setError(null);
    setBusy(true);
    try {
      await signIn(google.providerId, { callbackURL: "/", errorCallbackURL: "/login" });
    } catch (err) {
      setError(friendlySignInError(err));
      setBusy(false);
    }
  }

  if (isPending) {
    return <div className="min-h-dvh bg-navy" />;
  }
  if (user && allowed) return <Navigate to="/" />;
  if (user && !allowed) return <div className="min-h-dvh bg-navy" />;

  return (
    <main className="grid min-h-dvh place-items-center bg-navy px-6 py-10 text-cream">
      <div className="w-full max-w-sm">
        <FalconWordmark inverted className="mb-10 h-36 object-left" />
        <h1 className="font-display text-3xl">Advisor sign in</h1>
        <p className="mt-2 text-sm text-mist/80">
          Use a Google account on @{FIRM_EMAIL_DOMAIN}. Other accounts cannot open this
          workspace.
        </p>

        {reason === "domain" ? (
          <p className="mt-5 rounded-md bg-white/5 px-3 py-2 text-sm text-brass">
            That Google account isn’t on @{FIRM_EMAIL_DOMAIN}. Sign in with your Falcon
            Wealth account.
          </p>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-md bg-white/5 px-3 py-2 text-sm text-brass" role="alert">
            {error}
          </p>
        ) : null}

        {authEnabled && google ? (
          <Button asChild variant="cream" className="mt-8 w-full">
            <a
              href={oauthPopupPath(google.providerId)}
              target={oauthPopupTarget(google.providerId)}
              rel="opener"
              aria-disabled={busy}
              className={busy ? "pointer-events-none opacity-40" : undefined}
              onClick={(event) => {
                if (busy) {
                  event.preventDefault();
                  return;
                }
                // Same-tab OAuth when this page is top-level. Inside the preview
                // iframe, keep the native target so Google can open even if
                // window.open is blocked.
                try {
                  if (window.self === window.top) event.preventDefault();
                } catch {
                  /* framed — let the browser open the named window */
                }
                void onGoogle();
              }}
            >
              {busy ? "Opening Google…" : "Continue with Google"}
            </a>
          </Button>
        ) : (
          <p className="mt-8 text-sm text-mist">Sign-in is disabled.</p>
        )}

        <p className="mt-10 text-center text-xs text-mist/50">
          Falcon Discovery · @{FIRM_EMAIL_DOMAIN} only
        </p>
      </div>
    </main>
  );
}
