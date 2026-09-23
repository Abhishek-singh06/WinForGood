"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthCallbackUrl, getSafeRedirectPath } from "./url";

export interface AuthResponse {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export interface UserProfile {
  id: string;
  role: "subscriber" | "admin";
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

/**
 * Retrieves the currently authenticated user and their verified database profile.
 * Executes strictly on the server with Row Level Security enforcement.
 */
export async function getCurrentUserAndProfile(): Promise<{
  user: any;
  profile: UserProfile | null;
} | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Fallback profile representation if trigger is pending
    return {
      user,
      profile: {
        id: user.id,
        role: "subscriber",
        full_name: user.user_metadata?.full_name || "Subscriber",
        email: user.email || "",
        created_at: user.created_at,
      },
    };
  }

  return { user, profile: profile as UserProfile };
}

/**
 * Authenticates an existing user via Supabase Auth and determines authorized redirect.
 */
export async function signInAction(
  prevState: any,
  formData: FormData
): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please provide both email and password." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message || "Invalid credentials. Please verify your email and password.",
    };
  }

  // Fetch verified profile to determine role-based landing
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const isUserAdmin = profile?.role === "admin";
  const nextParam = (formData.get("next") as string)?.trim();
  const safeNext = nextParam ? getSafeRedirectPath(nextParam) : null;
  const destination = isUserAdmin ? "/admin" : (safeNext || "/dashboard");

  revalidatePath("/", "layout");
  redirect(destination);
}

/**
 * Registers a new subscriber via Supabase Auth.
 * CRITICAL: Client CANNOT supply a role. Server strictly sets subscriber role.
 */
export async function signUpAction(
  prevState: any,
  formData: FormData
): Promise<AuthResponse> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!fullName || !email || !password) {
    return { success: false, error: "All registration fields are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const charityId = (formData.get("charityId") as string)?.trim();
  const charityPercentageRaw = formData.get("charityPercentage");
  let charityPercentage = 10;
  if (charityPercentageRaw) {
    const parsedPct = Number(charityPercentageRaw);
    if (!isNaN(parsedPct)) {
      if (parsedPct < 10) {
        return { success: false, error: "Charity allocation cannot be below the statutory 10% floor (PRD § 07)." };
      }
      if (parsedPct > 100) {
        return { success: false, error: "Charity allocation cannot exceed 100%." };
      }
      charityPercentage = parsedPct;
    }
  }

  const supabase = await createServerSupabaseClient();
  const emailRedirectTo = getAuthCallbackUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name: fullName,
        charity_id: charityId || null,
        charity_percentage: charityPercentage,
        // Notice: No 'role' accepted from client; handle_new_user trigger forces 'subscriber'
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to create account. Please try again.",
    };
  }

  // Check if strict email confirmation is demanded by environment configuration
  const requireEmailConfirmation = process.env.AUTH_REQUIRE_EMAIL_CONFIRMATION === "true";

  // For Demo/Test/Review experience: auto-confirm user if session is not yet active
  if (!requireEmailConfirmation && data.user && !data.session) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminClient = createAdminClient();
        await adminClient.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        });
      } catch (adminErr) {
        console.warn("[signUpAction] Auto-confirm bypassed:", adminErr);
      }
    }
  }

  revalidatePath("/", "layout");
  
  if (requireEmailConfirmation && !data.session) {
    return {
      success: true,
      redirectTo: "/login?confirmed=pending",
    };
  }

  // Seamless Demo/Test/Review flow:
  // User account is created. Proceed directly to Login.
  return {
    success: true,
    redirectTo: `/login?registered=true&email=${encodeURIComponent(email)}`,
  };
}

/**
 * Signs out the authenticated user and clears session cookies.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
