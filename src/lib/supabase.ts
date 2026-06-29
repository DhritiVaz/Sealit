import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Problem } from "./types";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!supabase) {
    supabase = createClient(url, key);
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export async function fetchProblems(limit = 200): Promise<Problem[]> {
  const client = getSupabase();
  if (!client) return [];

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await client
    .from("problems")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return (data ?? []) as Problem[];
}

export async function fetchProblemById(id: string): Promise<Problem | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Problem;
}

export async function insertProblem(
  problem: Omit<Problem, "id" | "created_at">
): Promise<Problem | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("problems")
    .insert(problem)
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return null;
  }

  return data as Problem;
}

export async function problemExistsByUrl(url: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const { data } = await client
    .from("problems")
    .select("id")
    .eq("source_url", url)
    .maybeSingle();

  return Boolean(data);
}
