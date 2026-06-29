"use client";

import { getSupabaseBrowser } from "./supabase-browser";
import { setAuth } from "./storage";

export async function signInWithProvider(provider: "google" | "github") {
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    throw new Error("Supabase is not configured. Check your .env.local file.");
  }

  const redirectTo = `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabaseBrowser();
  if (supabase) {
    await supabase.auth.signOut();
  }
  setAuth(false);
}
