"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.3c-.25-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.59H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.41z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.59l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const error = searchParams.get("error");
  const redirectTo = searchParams.get("redirectTo");

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const destination =
      redirectTo?.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/documents";
    router.replace(destination);
  }, [isAuthenticated, isLoading, redirectTo, router]);

  const googleAuthHref = `/api/auth/google${
    redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
  }`;

  if (isLoading || isAuthenticated) {
    return (
      <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8 text-center">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-text-primary">Document Vault</h1>
      <p className="mt-2 text-sm text-text-secondary">Sign in to access your documents.</p>

      <a
        href={googleAuthHref}
        className="mt-6 flex items-center justify-center gap-3 rounded-full border border-border-subtle bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100 focus-ring"
      >
        <GoogleIcon className="h-5 w-5" />
        Sign in with Google
      </a>

      {error && (
        <div className="mt-4 rounded-md border border-danger-muted bg-danger-muted/50 p-3 text-left">
          <p className="text-sm text-danger">{error}</p>
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
