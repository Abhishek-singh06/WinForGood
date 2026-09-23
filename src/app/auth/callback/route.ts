import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getAppUrl, getSafeRedirectPath } from "@/lib/auth/url";

/**
 * Supabase Auth Callback Handler
 * Handles OAuth, PKCE, and email verification redirects from Supabase Auth.
 * Exchanges the temporary authorization code for an authenticated user session.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const authError = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");

  const appBaseUrl = getAppUrl();
  const safeNext = getSafeRedirectPath(next, "/dashboard");

  // If Supabase returned an explicit authentication error (e.g. otp_expired)
  if (authError) {
    const errorUrl = new URL("/login", appBaseUrl);
    errorUrl.searchParams.set("error", authError);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

    // Track cookies set during the code exchange
    const cookiesToForward: Array<{ name: string; value: string; options?: any }> = [];

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // May be ignored in static rendering or specific runtime phases
            }
            cookiesToForward.push({ name, value, options });
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      let destination = safeNext;

      // If user came through generic email verification without explicit next target,
      // determine whether to route to subscriber dashboard or admin console based on profile role
      if (!next) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        destination = profile?.role === "admin" ? "/admin" : "/dashboard";
      }

      const redirectResponse = NextResponse.redirect(new URL(destination, appBaseUrl));

      // Synchronize cookies onto response to guarantee session persistence across origins
      cookiesToForward.forEach(({ name, value, options }) => {
        redirectResponse.cookies.set(name, value, options);
      });

      return redirectResponse;
    }
  }

  // If code is missing or exchange failed, redirect to login with error parameter
  const failureUrl = new URL("/login", appBaseUrl);
  failureUrl.searchParams.set("error", "verification_failed");
  return NextResponse.redirect(failureUrl);
}
