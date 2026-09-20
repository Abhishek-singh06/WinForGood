"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GolfScore, ScoreActionResponse } from "./types";
import { validateStablefordScore, validateScoreDate } from "./validation";

/**
 * Retrieves the authenticated user's scores from the database.
 * Returned in descending order of score_date (latest date first).
 */
export async function getUserScores(): Promise<GolfScore[]> {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

  if (isPlaceholder) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !data) {
      return [];
    }

    return data as GolfScore[];
  } catch {
    return [];
  }
}

/**
 * Submits a new golf score for the authenticated user.
 * Atomic database trigger enforces rolling 5 retention by score_date DESC.
 */
export async function addScoreAction(
  prevState: any,
  formData: FormData
): Promise<ScoreActionResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required to record scores." };
  }

  const scoreValidation = validateStablefordScore(formData.get("score"));
  if (!scoreValidation.valid || scoreValidation.value === undefined) {
    return { success: false, error: scoreValidation.error };
  }

  const dateValidation = validateScoreDate(formData.get("scoreDate"));
  if (!dateValidation.valid || !dateValidation.value) {
    return { success: false, error: dateValidation.error };
  }

  const { data, error } = await supabase
    .from("scores")
    .insert({
      user_id: user.id,
      score: scoreValidation.value,
      score_date: dateValidation.value,
    })
    .select()
    .single();

  if (error) {
    // Unique violation error code in PostgreSQL is 23505
    if (error.code === "23505" || error.message?.includes("uq_user_score_date") || error.message?.includes("unique")) {
      return {
        success: false,
        error: `You already have a recorded score for ${dateValidation.value}. Only one score per date is permitted.`,
      };
    }
    return { success: false, error: error.message || "Failed to record score." };
  }

  revalidatePath("/dashboard/scores");
  return { success: true, score: data as GolfScore };
}

/**
 * Edits an existing score.
 * Updates score value or date, preserving the one-score-per-date constraint
 * and triggering the rolling-five re-evaluation.
 */
export async function editScoreAction(
  prevState: any,
  formData: FormData
): Promise<ScoreActionResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const scoreId = formData.get("scoreId") as string;
  if (!scoreId) {
    return { success: false, error: "Score identifier is missing." };
  }

  const scoreValidation = validateStablefordScore(formData.get("score"));
  if (!scoreValidation.valid || scoreValidation.value === undefined) {
    return { success: false, error: scoreValidation.error };
  }

  const dateValidation = validateScoreDate(formData.get("scoreDate"));
  if (!dateValidation.valid || !dateValidation.value) {
    return { success: false, error: dateValidation.error };
  }

  const { data, error } = await supabase
    .from("scores")
    .update({
      score: scoreValidation.value,
      score_date: dateValidation.value,
    })
    .eq("id", scoreId)
    .eq("user_id", user.id) // Enforce user isolation
    .select()
    .single();

  if (error) {
    if (error.code === "23505" || error.message?.includes("uq_user_score_date") || error.message?.includes("unique")) {
      return {
        success: false,
        error: `Another score already exists for ${dateValidation.value}. Only one score per date is permitted.`,
      };
    }
    return { success: false, error: error.message || "Failed to update score." };
  }

  revalidatePath("/dashboard/scores");
  return { success: true, score: data as GolfScore };
}

/**
 * Deletes an existing score.
 */
export async function deleteScoreAction(scoreId: string): Promise<ScoreActionResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  if (!scoreId) {
    return { success: false, error: "Score identifier is missing." };
  }

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", scoreId)
    .eq("user_id", user.id); // Strict ownership check

  if (error) {
    return { success: false, error: error.message || "Failed to delete score." };
  }

  revalidatePath("/dashboard/scores");
  return { success: true };
}
