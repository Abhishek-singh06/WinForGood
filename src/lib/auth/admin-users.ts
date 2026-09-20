"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { CHARITIES } from "@/lib/data/charities";

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: "subscriber" | "admin";
  createdAt: string;
  charityId: string | null;
  charityName: string | null;
  charityPercentage: number;
  subscriptionStatus: "active" | "past_due" | "canceled" | "none";
  subscriptionPlan: "monthly" | "yearly" | "none";
  scoresCount: number;
}

const OFFLINE_ADMIN_USERS: AdminUserListItem[] = [
  {
    id: "user-sub-001",
    fullName: "Arthur Pendelton",
    email: "arthur@example.com",
    role: "subscriber",
    createdAt: "2026-08-01T10:00:00Z",
    charityId: "charity-youth",
    charityName: "Youth Horizon Initiative",
    charityPercentage: 15,
    subscriptionStatus: "active",
    subscriptionPlan: "monthly",
    scoresCount: 5,
  },
  {
    id: "user-sub-002",
    fullName: "Beatrice Webb",
    email: "beatrice@example.com",
    role: "subscriber",
    createdAt: "2026-08-12T14:30:00Z",
    charityId: "charity-cleanwater",
    charityName: "Clean Water Allies",
    charityPercentage: 10,
    subscriptionStatus: "active",
    subscriptionPlan: "yearly",
    scoresCount: 5,
  },
  {
    id: "user-sub-003",
    fullName: "Charles Darwin",
    email: "charles@example.com",
    role: "subscriber",
    createdAt: "2026-08-20T09:15:00Z",
    charityId: "charity-veterans",
    charityName: "Veterans Forward Project",
    charityPercentage: 20,
    subscriptionStatus: "past_due",
    subscriptionPlan: "monthly",
    scoresCount: 3,
  },
  {
    id: "user-sub-004",
    fullName: "Dorothy Hodgkin",
    email: "dorothy@example.com",
    role: "subscriber",
    createdAt: "2026-09-02T11:45:00Z",
    charityId: "charity-shelter",
    charityName: "Shelter & Dignity Coalition",
    charityPercentage: 10,
    subscriptionStatus: "canceled",
    subscriptionPlan: "monthly",
    scoresCount: 5,
  },
  {
    id: "user-admin-001",
    fullName: "Platform Administrator",
    email: "admin@digitalheroes.org",
    role: "admin",
    createdAt: "2026-07-01T08:00:00Z",
    charityId: null,
    charityName: null,
    charityPercentage: 0,
    subscriptionStatus: "active",
    subscriptionPlan: "yearly",
    scoresCount: 0,
  },
];

export async function getAdminUsersList(): Promise<AdminUserListItem[]> {
  const auth = await getCurrentUserAndProfile();
  if (!auth?.user || auth.profile?.role !== "admin") {
    throw new Error("Unauthorized: Administrator access required (PRD § 03 / BR-141).");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    return OFFLINE_ADMIN_USERS;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (pError || !profiles) {
      return OFFLINE_ADMIN_USERS;
    }

    const { data: subscriptions } = await supabase.from("subscriptions").select("*");
    const { data: charities } = await supabase.from("charities").select("id, name");

    const charityMap = new Map<string, string>();
    charities?.forEach((c) => charityMap.set(c.id, c.name));
    CHARITIES.forEach((c) => {
      if (!charityMap.has(c.id)) charityMap.set(c.id, c.name);
    });

    const subMap = new Map<string, any>();
    subscriptions?.forEach((s) => subMap.set(s.user_id, s));

    return profiles.map((p: any) => {
      const sub = subMap.get(p.id);
      return {
        id: p.id,
        fullName: p.full_name || "Subscriber",
        email: p.email || "",
        role: p.role,
        createdAt: p.created_at,
        charityId: p.charity_id || null,
        charityName: p.charity_id ? charityMap.get(p.charity_id) || "Designated Cause" : null,
        charityPercentage: p.charity_percentage || 10,
        subscriptionStatus: sub?.status || "none",
        subscriptionPlan: sub?.plan || "none",
        scoresCount: 5,
      };
    });
  } catch {
    return OFFLINE_ADMIN_USERS;
  }
}
