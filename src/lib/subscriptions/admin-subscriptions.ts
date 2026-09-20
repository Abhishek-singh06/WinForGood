"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscriptions/types";

export interface AdminSubscriptionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

const OFFLINE_ADMIN_SUBSCRIPTIONS: AdminSubscriptionItem[] = [
  {
    id: "sub-001",
    userId: "user-sub-001",
    userName: "Arthur Pendelton",
    userEmail: "arthur@example.com",
    plan: "monthly",
    status: "active",
    currentPeriodStart: "2026-08-01T00:00:00Z",
    currentPeriodEnd: "2026-09-01T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: "sub_test_001",
    stripeCustomerId: "cus_test_001",
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "sub-002",
    userId: "user-sub-002",
    userName: "Beatrice Webb",
    userEmail: "beatrice@example.com",
    plan: "yearly",
    status: "active",
    currentPeriodStart: "2026-08-12T00:00:00Z",
    currentPeriodEnd: "2027-08-12T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: "sub_test_002",
    stripeCustomerId: "cus_test_002",
    createdAt: "2026-08-12T14:30:00Z",
  },
  {
    id: "sub-003",
    userId: "user-sub-003",
    userName: "Charles Darwin",
    userEmail: "charles@example.com",
    plan: "monthly",
    status: "past_due",
    currentPeriodStart: "2026-08-20T00:00:00Z",
    currentPeriodEnd: "2026-09-20T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: "sub_test_003",
    stripeCustomerId: "cus_test_003",
    createdAt: "2026-08-20T09:15:00Z",
  },
  {
    id: "sub-004",
    userId: "user-sub-004",
    userName: "Dorothy Hodgkin",
    userEmail: "dorothy@example.com",
    plan: "monthly",
    status: "canceled",
    currentPeriodStart: "2026-08-02T00:00:00Z",
    currentPeriodEnd: "2026-09-02T00:00:00Z",
    cancelAtPeriodEnd: true,
    stripeSubscriptionId: "sub_test_004",
    stripeCustomerId: "cus_test_004",
    createdAt: "2026-09-02T11:45:00Z",
  },
];

export async function getAdminSubscriptionsList(): Promise<AdminSubscriptionItem[]> {
  const auth = await getCurrentUserAndProfile();
  if (!auth?.user || auth.profile?.role !== "admin") {
    throw new Error("Unauthorized: Administrator access required (PRD § 03 / BR-141).");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    return OFFLINE_ADMIN_SUBSCRIPTIONS;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: subs, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (subError || !subs) {
      return OFFLINE_ADMIN_SUBSCRIPTIONS;
    }

    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
    const profileMap = new Map<string, { name: string; email: string }>();
    profiles?.forEach((p) => profileMap.set(p.id, { name: p.full_name || "Subscriber", email: p.email || "" }));

    return subs.map((s: any) => {
      const p = profileMap.get(s.user_id);
      return {
        id: s.id,
        userId: s.user_id,
        userName: p?.name || "Subscriber",
        userEmail: p?.email || "",
        plan: s.plan,
        status: s.status,
        currentPeriodStart: s.current_period_start,
        currentPeriodEnd: s.current_period_end,
        cancelAtPeriodEnd: s.cancel_at_period_end || false,
        stripeSubscriptionId: s.stripe_subscription_id,
        stripeCustomerId: s.stripe_customer_id,
        createdAt: s.created_at,
      };
    });
  } catch {
    return OFFLINE_ADMIN_SUBSCRIPTIONS;
  }
}
