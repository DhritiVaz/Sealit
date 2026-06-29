"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "@/components/AppShell";
import { GOAL_OPTIONS } from "@/lib/constants";
import { signOut } from "@/lib/auth";
import { getOnboarding } from "@/lib/storage";
import { useNavCounts } from "@/lib/use-nav-counts";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { OnboardingProfile } from "@/lib/types";

function userInitial(user: User | null) {
  const name =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "B";
  return String(name).charAt(0).toUpperCase();
}

function userDisplayName(user: User | null) {
  return (
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Builder"
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { savedCount, buildingCount } = useNavCounts();
  const [user, setUser] = useState<User | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOnboarding(getOnboarding());

    async function loadUser() {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const goalLabel =
    GOAL_OPTIONS.find((g) => g.id === onboarding?.goal)?.label ?? onboarding?.goal;

  return (
    <AppShell savedCount={savedCount} buildingCount={buildingCount}>
      <div className="mx-auto max-w-[640px] px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {userInitial(user)}
          </div>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">
              {userDisplayName(user)}
            </h1>
            {user?.email ? (
              <p className="text-sm text-muted">{user.email}</p>
            ) : null}
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-[#EBEBEB] bg-white p-6">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#BBBBBA]">
            Your preferences
          </h2>

          {onboarding ? (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {onboarding.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-[#F0F0EE] px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted">Domains</p>
                <div className="flex flex-wrap gap-2">
                  {onboarding.domains.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {goalLabel ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted">Goal</p>
                  <p className="text-sm font-medium text-foreground">{goalLabel}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No onboarding preferences saved yet.
            </p>
          )}
        </section>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-[10px] border border-[#E0E0DC] bg-white py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:border-[#C0C0BC] disabled:opacity-60"
        >
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </AppShell>
  );
}
