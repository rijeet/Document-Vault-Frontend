"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useGoogleLogin } from "@/features/auth/hooks";

declare global {
  interface Window {
    google?: any;
  }
}

function LoginForm() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync, isPending, error } = useGoogleLogin();

  useEffect(() => {
    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        await mutateAsync(response.credential);
        const redirectTo = searchParams.get("redirectTo");
        const destination = redirectTo && redirectTo !== "/" ? redirectTo : "/documents";
        router.push(destination);
      } catch {
        // error surfaced below via `error`
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

    if (!tryInit()) {
      const interval = setInterval(() => tryInit() && clearInterval(interval), 200);
      return () => clearInterval(interval);
    }
  }, [mutateAsync, router, searchParams]);

  return (
    <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-text-primary">Document Vault</h1>
      <p className="mt-2 text-sm text-text-secondary">Sign in to access your documents.</p>
      <div className="mt-6 flex justify-center" ref={buttonRef} />
      {isPending && <p className="mt-4 text-sm text-text-muted">Signing you in…</p>}
      {error && <p className="mt-4 text-sm text-danger">Something went wrong. Please try again.</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
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
    </>
  );
}