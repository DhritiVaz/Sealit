"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { OAuthButtons } from "@/components/AuthButtons";
import { NavBar } from "@/components/Nav";
import { signInWithProvider } from "@/lib/auth";
import { getOnboarding, setAuth } from "@/lib/storage";

export default function SignupPage() {
  const router = useRouter();

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuth(true);
    router.push("/onboarding");
  }

  async function handleOAuth(provider: string) {
    if (provider === "google" || provider === "github") {
      try {
        await signInWithProvider(provider);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not start sign-in.";
        alert(message);
      }
      return;
    }

    setAuth(true);
    const onboarding = getOnboarding();
    router.push(onboarding?.completed ? "/feed" : "/onboarding");
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <NavBar
        right={
          <Link href="/login" className="text-[13px] font-medium text-muted transition-colors hover:text-primary">
            Already have an account? Log in →
          </Link>
        }
      />

      <div className="flex min-h-[calc(100vh-59px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          <h1 className="mb-2 text-[34px] font-bold tracking-tight text-foreground">Create your account.</h1>
          <p className="mb-9 text-[15px] leading-relaxed text-muted">
            Join builders who open Sealit every morning.
          </p>

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-[#E0E0DC] bg-white px-3.5 py-3 text-[15px] outline-none focus:border-primary"
              />
            </div>

            <div className="mb-7">
              <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-[#E0E0DC] bg-white px-3.5 py-3 text-[15px] outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="mb-0 w-full rounded-[10px] bg-primary py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-88"
            >
              Create account →
            </button>
          </form>

          <OAuthButtons onAuth={handleOAuth} mode="signup" />
        </div>
      </div>
    </div>
  );
}
