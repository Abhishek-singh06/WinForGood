"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { CharityRecord, CharityActionResponse } from "./types";
import { CHARITIES } from "@/lib/data/charities";
import { validateCharityContributionPercentage } from "./validation";

/**
 * Fallback converter for static charities when running offline
 */
function getFallbackCharities(): CharityRecord[] {
  return CHARITIES.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category,
    tagline: c.tagline,
    mission: c.mission,
    description: c.description,
    hero_image: c.heroImage,
    logo: c.logo,
    is_featured: c.isFeatured,
    is_active: true,
    events: c.events,
    impact_metrics: c.impactMetrics,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Queries charities with optional search, category filtering, and active filtering.
 */
export async function getCharities(options?: {
  search?: string;
  category?: string;
  activeOnly?: boolean;
}): Promise<CharityRecord[]> {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

  let records: CharityRecord[] = [];

  if (isPlaceholder) {
    records = getFallbackCharities();
    if (options?.activeOnly) {
      records = records.filter((c) => c.is_active);
    }
    if (options?.category && options.category !== "all") {
      records = records.filter((c) => c.category === options.category);
    }
  } else {
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase.from("charities").select("*");

      if (options?.activeOnly) {
        query = query.eq("is_active", true);
      }

      if (options?.category && options.category !== "all") {
        query = query.eq("category", options.category);
      }

      query = query.order("is_featured", { ascending: false }).order("name", { ascending: true });

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        records = getFallbackCharities();
      } else {
        records = data as CharityRecord[];
      }
    } catch {
      records = getFallbackCharities();
    }
  }

  if (options?.search && options.search.trim() !== "") {
    const term = options.search.toLowerCase().trim();
    records = records.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.mission.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }

  return records;
}

/**
 * Fetches single charity by unique slug.
 */
export async function getCharityBySlug(slug: string): Promise<CharityRecord | null> {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

  if (isPlaceholder) {
    const fallback = getFallbackCharities().find((c) => c.slug === slug);
    return fallback || null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return data as CharityRecord;
    }
  } catch {
    // Fallback to static data
  }

  const fallback = getFallbackCharities().find((c) => c.slug === slug);
  return fallback || null;
}

/**
 * Updates a subscriber's selected charity and contribution percentage.
 * Verifies that the chosen charity exists and is currently active.
 */
export async function updateUserCharitySelectionAction(
  prevState: any,
  formData: FormData
): Promise<CharityActionResponse> {
  const authData = await getCurrentUserAndProfile();
  if (!authData?.user) {
    return { success: false, error: "Authentication required." };
  }

  const charityId = formData.get("charityId") as string;
  const percentageInput = formData.get("charityPercentage");

  if (!charityId) {
    return { success: false, error: "Please select an approved charity." };
  }

  const percentageValidation = validateCharityContributionPercentage(percentageInput);
  if (!percentageValidation.valid || percentageValidation.value === undefined) {
    return { success: false, error: percentageValidation.error };
  }

  const supabase = await createServerSupabaseClient();

  // Validate charity exists and is active
  const { data: charity, error: charityError } = await supabase
    .from("charities")
    .select("id, is_active, name")
    .eq("id", charityId)
    .single();

  if (charityError || !charity) {
    return { success: false, error: "Selected charity could not be found." };
  }

  if (!charity.is_active) {
    return {
      success: false,
      error: "The selected charity is currently inactive and cannot receive new allocations.",
    };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      charity_id: charity.id,
      charity_percentage: percentageValidation.value,
    })
    .eq("id", authData.user.id);

  if (updateError) {
    return { success: false, error: updateError.message || "Failed to update charity selection." };
  }

  revalidatePath("/dashboard/charity");
  return { success: true };
}

/**
 * Admin action: Creates a new charity in the directory.
 * Server authorization verified.
 */
export async function adminCreateCharityAction(
  prevState: any,
  formData: FormData
): Promise<CharityActionResponse> {
  const authData = await getCurrentUserAndProfile();
  if (authData?.profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admin authorization required (BR-141)." };
  }

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const category = (formData.get("category") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const mission = (formData.get("mission") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const heroImage = (formData.get("heroImage") as string)?.trim();
  const logo = (formData.get("logo") as string)?.trim();
  const isFeatured = formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") !== "false";

  if (!name || !slug || !category || !mission || !description) {
    return { success: false, error: "Please provide Name, Slug, Category, Mission, and Description." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("charities")
    .insert({
      name,
      slug,
      category,
      tagline: tagline || null,
      mission,
      description,
      hero_image: heroImage || null,
      logo: logo || null,
      is_featured: isFeatured,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" || error.message?.includes("slug")) {
      return { success: false, error: `A charity with slug "${slug}" already exists.` };
    }
    return { success: false, error: error.message || "Failed to create charity record." };
  }

  revalidatePath("/charities");
  revalidatePath("/admin/charities");
  return { success: true, charity: data as CharityRecord };
}

/**
 * Admin action: Updates an existing charity.
 */
export async function adminUpdateCharityAction(
  prevState: any,
  formData: FormData
): Promise<CharityActionResponse> {
  const authData = await getCurrentUserAndProfile();
  if (authData?.profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admin authorization required." };
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const mission = (formData.get("mission") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const heroImage = (formData.get("heroImage") as string)?.trim();
  const logo = (formData.get("logo") as string)?.trim();
  const isFeatured = formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";

  if (!id || !name || !category || !mission || !description) {
    return { success: false, error: "Required fields cannot be empty." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("charities")
    .update({
      name,
      category,
      tagline: tagline || null,
      mission,
      description,
      hero_image: heroImage || null,
      logo: logo || null,
      is_featured: isFeatured,
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || "Failed to update charity." };
  }

  revalidatePath("/charities");
  revalidatePath("/admin/charities");
  return { success: true, charity: data as CharityRecord };
}

/**
 * Admin action: Toggles active/inactive state of a charity.
 */
export async function adminToggleCharityActiveAction(
  charityId: string,
  isActive: boolean
): Promise<CharityActionResponse> {
  const authData = await getCurrentUserAndProfile();
  if (authData?.profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admin authorization required." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("charities")
    .update({ is_active: isActive })
    .eq("id", charityId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || "Failed to toggle charity status." };
  }

  revalidatePath("/charities");
  revalidatePath("/admin/charities");
  return { success: true, charity: data as CharityRecord };
}

/**
 * Admin action: Toggles featured state of a charity.
 */
export async function adminToggleCharityFeaturedAction(
  charityId: string,
  isFeatured: boolean
): Promise<CharityActionResponse> {
  const authData = await getCurrentUserAndProfile();
  if (authData?.profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admin authorization required." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("charities")
    .update({ is_featured: isFeatured })
    .eq("id", charityId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || "Failed to toggle featured status." };
  }

  revalidatePath("/charities");
  revalidatePath("/admin/charities");
  return { success: true, charity: data as CharityRecord };
}
