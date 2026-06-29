"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { getOnboarding, setAuth } from "@/lib/storage";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function finishAuth() {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const oauthError =
        params.get("error_description") ?? params.get("error");

      if (oauthError) {
        setError(oauthError);
        return;
      }

      if (!code) {
        setError("No authorization code received.");
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }

      setAuth(true);
      const onboarding = getOnboarding();
      router.replace(onboarding?.completed ? "/feed" : "/onboarding");
    }

    finishAuth();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">
          Sign-in failed
        </p>
        <p className="mb-6 max-w-md text-sm text-muted">{error}</p>
        <Link href="/login" className="text-sm font-semibold text-primary">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-muted">Signing you in…</p>
    </div>
  );
}
