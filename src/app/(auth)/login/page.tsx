"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { AlertCircle, ChevronDown } from "lucide-react";
import { useGoogleLogin } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api-client";

declare global {
  interface Window {
    google?: any;
  }
}

const INIT_TIMEOUT_MS = 8000;
const INIT_POLL_INTERVAL_MS = 200;

const BLOCKED_HELP_MESSAGE =
  "Google Sign-In failed to load or open. This is almost always caused by a browser privacy feature — Brave Shields, an ad blocker, or a privacy extension — blocking Google's sign-in script or popup.";

function LoginForm() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync, isPending, error: mutationError } = useGoogleLogin();

  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);
  const [initTimeoutError, setInitTimeoutError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = async (response: { credential: string }) => {
      setAuthError(null);
      try {
        await mutateAsync(response.credential);
        const redirectTo = searchParams.get("redirectTo");
        const destination = redirectTo && redirectTo !== "/" ? redirectTo : "/documents";
        router.push(destination);
      } catch (err) {
        setAuthError(
          err instanceof ApiError
            ? err.message
            : "Couldn't sign you in — please try again.",
        );
      }
    };

    const tryInit = () => {
      if (!window.google || !buttonRef.current) return false;
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        width: 280,
      });
      return true;
    };

    if (tryInit()) return;

    let elapsed = 0;
    const interval = setInterval(() => {
      if (tryInit()) {
        clearInterval(interval);
        return;
      }
      elapsed += INIT_POLL_INTERVAL_MS;
      if (elapsed >= INIT_TIMEOUT_MS) {
        clearInterval(interval);
        setInitTimeoutError(BLOCKED_HELP_MESSAGE);
      }
    }, INIT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [mutateAsync, router, searchParams]);

  // Priority: an explicit backend/auth error is the most specific and
  // actionable, so it takes precedence over the more generic load/init
  // failures if somehow more than one fires.
  const displayError = authError ?? initTimeoutError ?? scriptLoadError;

  return (
    <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-text-primary">Document Vault</h1>
      <p className="mt-2 text-sm text-text-secondary">Sign in to access your documents.</p>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onError={() =>
          setScriptLoadError(
            "Google's sign-in script couldn't load. Check your internet connection, or a browser extension may be blocking it.",
          )
        }
      />

      <div className="mt-6 flex justify-center" ref={buttonRef} />

      {isPending && <p className="mt-4 text-sm text-text-muted">Signing you in…</p>}

      {displayError && (
        <div className="mt-4 rounded-md border border-danger-muted bg-danger-muted/50 p-3 text-left">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm text-danger">{displayError}</p>
          </div>
        </div>
      )}

      {(displayError || mutationError) && (
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary focus-ring"
        >
          Trouble signing in?
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHelp ? "rotate-180" : ""}`} />
        </button>
      )}

      {showHelp && (
        <div className="mt-3 space-y-2 rounded-md bg-surface-2 p-3 text-left text-xs text-text-secondary">
          <p>Common causes and fixes, in order of likelihood:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Brave Shields</strong> — click the lion icon in the address bar and lower
              shields, or allow cross-site cookies, for this site.
            </li>
            <li>
              <strong>Ad blocker / privacy extension</strong> — try disabling it for this site,
              since many block Google's sign-in script or popup by default.
            </li>
            <li>
              <strong>Popup blocked</strong> — check the address bar for a blocked-popup icon and
              allow popups for this site.
            </li>
            <li>
              If it works in a private/incognito window but not your normal window, that's a strong
              sign an extension is the cause — most browsers disable extensions in private windows
              by default.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8 text-center">
            <p className="text-sm text-text-muted">Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}