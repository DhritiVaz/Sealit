import { NextResponse } from "next/server";
import { POST_LOGIN_PATH, POST_SIGNUP_PATH } from "@/lib/auth-paths";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function resolveNextPath(next: string | null): string {
  if (next === POST_SIGNUP_PATH) return POST_SIGNUP_PATH;
  return POST_LOGIN_PATH;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("No authorization code received.")}`
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Supabase is not configured.")}`
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const next = resolveNextPath(searchParams.get("next"));

  return NextResponse.redirect(new URL(next, origin));
}
