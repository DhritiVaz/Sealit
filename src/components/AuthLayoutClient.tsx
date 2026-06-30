"use client";

import { usePathname } from "next/navigation";
import { OAuthButtons } from "@/components/AuthButtons";
import { AuthBoPanel } from "@/components/AuthBoPanel";
import { AuthCrossfade } from "@/components/AuthCrossfade";
import { AuthPageProvider, useAuthPage } from "@/components/AuthPageContext";
import { AuthShell } from "@/components/AuthShell";
import { signInWithProvider } from "@/lib/auth";

function authVariant(pathname: string): "login" | "signup" | "forgot" {
  if (pathname === "/signup") return "signup";
  if (pathname === "/forgot-password") return "forgot";
  return "login";
}

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hideOAuth } = useAuthPage();
  const mode = pathname === "/signup" ? "signup" : "login";
  const showOAuth =
    (pathname === "/login" || pathname === "/signup") && !hideOAuth;
  const variant = authVariant(pathname);

  async function handleOAuth(provider: string) {
    if (provider === "google" || provider === "github") {
      try {
        await signInWithProvider(provider, mode);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not start sign-in.";
        alert(message);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthShell aside={<AuthBoPanel variant={variant} />}>
        <div className="auth-card">
          <AuthCrossfade>{children}</AuthCrossfade>
          <div className={showOAuth ? undefined : "hidden"} aria-hidden={!showOAuth}>
            <OAuthButtons onAuth={handleOAuth} mode={mode} />
          </div>
        </div>
      </AuthShell>
    </div>
  );
}

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthPageProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </AuthPageProvider>
  );
}
