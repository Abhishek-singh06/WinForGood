"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import type {
  WinnerRecord,
  WinnerDetailRecord,
  WinnerActionResponse,
} from "./types";
import { validateProofFile } from "./config";

/**
 * =============================================================================
 * DIGITAL HEROES — Phase 6: Winner Verification & Payout Server Actions
 * PRD Reference: § 09 (Winner Verification System), § 11.04 (Admin Winners)
 * =============================================================================
 *
 * GOVERNING RULES:
 * 1. Upload & Winner Ownership: Enforced server-side. A subscriber can only submit
 *    proof for a winning entry that belongs strictly to their user_id.
 * 2. Admin Authorization: All approve, reject, and payout mutations strictly require
 *    an authenticated user with profile.role === 'admin'.
 * 3. Payment State Transition: Payout progression (pending -> paid) is strictly
 *    prohibited unless verification_status === 'approved'.
 * 4. Rejection Reason: Mandatory non-empty string when rejecting evidence.
 */

// ---------------------------------------------------------------------------
// IN-MEMORY FALLBACK STORE (For offline / mock environments)
// ---------------------------------------------------------------------------
let fallbackWinners: WinnerDetailRecord[] = [];

export async function _resetFallbackWinners(seed?: WinnerDetailRecord[]) {
  fallbackWinners = seed ? [...seed] : [];
}

export async function _getFallbackWinners() {
  return fallbackWinners;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return Boolean(url && key && !url.includes("placeholder"));
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful in tests
  }
}

/**
 * Admin query: Fetches all winner records with associated profile and draw details.
 * Strictly requires admin role authorization.
 */
export async function getAdminWinnersList(): Promise<WinnerDetailRecord[]> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return fallbackWinners;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: winners, error } = await supabase
      .from("winners")
      .select(`
        *,
        draws:draw_id (draw_number, month, draw_mode, winning_numbers),
        profiles:user_id (full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error || !winners) {
      return fallbackWinners;
    }

    // Also fetch associated draw entries for subscriber numbers
    const { data: entries } = await supabase
      .from("draw_entries")
      .select("draw_id, user_id, numbers");

    const entryMap = new Map(
      (entries || []).map((e: any) => [`${e.draw_id}_${e.user_id}`, e.numbers])
    );

    return winners.map((w: any) => ({
      id: w.id,
      draw_id: w.draw_id,
      user_id: w.user_id,
      match_tier: w.match_tier,
      prize_amount: w.prize_amount ? Number(w.prize_amount) : null,
      verification_status: w.verification_status,
      payout_status: w.payout_status,
      proof_file_url: w.proof_file_url,
      rejection_reason: w.rejection_reason,
      submitted_at: w.submitted_at,
      reviewed_at: w.reviewed_at,
      reviewed_by: w.reviewed_by,
      created_at: w.created_at,
      updated_at: w.updated_at,
      winner_name: w.profiles?.full_name || "Unknown Subscriber",
      winner_email: w.profiles?.email || "No Email",
      draw_number: w.draws?.draw_number || 0,
      draw_month: w.draws?.month || "",
      draw_mode: w.draws?.draw_mode || "random",
      winning_numbers: w.draws?.winning_numbers || [],
      user_numbers: entryMap.get(`${w.draw_id}_${w.user_id}`) || [],
    }));
  } catch {
    return fallbackWinners;
  }
}

/**
 * Subscriber query: Fetches winning entries belonging to the authenticated subscriber.
 */
export async function getUserWinningsList(
  targetUserId: string
): Promise<WinnerDetailRecord[]> {
  const auth = await getCurrentUserAndProfile();
  // Authorization check: User can only query their own winnings unless they are admin
  if (!auth || (auth.user.id !== targetUserId && auth.profile?.role !== "admin")) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return fallbackWinners.filter((w) => w.user_id === targetUserId);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: winners, error } = await supabase
      .from("winners")
      .select(`
        *,
        draws:draw_id (draw_number, month, draw_mode, winning_numbers),
        profiles:user_id (full_name, email)
      `)
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error || !winners) {
      return fallbackWinners.filter((w) => w.user_id === targetUserId);
    }

    // Fetch user draw entries to attach user ticket numbers
    const { data: entries } = await supabase
      .from("draw_entries")
      .select("draw_id, user_id, numbers")
      .eq("user_id", targetUserId);

    const entryMap = new Map((entries || []).map((e: any) => [e.draw_id, e.numbers]));

    return winners.map((w: any) => ({
      id: w.id,
      draw_id: w.draw_id,
      user_id: w.user_id,
      match_tier: w.match_tier,
      prize_amount: w.prize_amount ? Number(w.prize_amount) : null,
      verification_status: w.verification_status,
      payout_status: w.payout_status,
      proof_file_url: w.proof_file_url,
      rejection_reason: w.rejection_reason,
      submitted_at: w.submitted_at,
      reviewed_at: w.reviewed_at,
      reviewed_by: w.reviewed_by,
      created_at: w.created_at,
      updated_at: w.updated_at,
      winner_name: w.profiles?.full_name || auth.profile?.full_name || "Winner",
      winner_email: w.profiles?.email || auth.profile?.email || "",
      draw_number: w.draws?.draw_number || 0,
      draw_month: w.draws?.month || "",
      draw_mode: w.draws?.draw_mode || "random",
      winning_numbers: w.draws?.winning_numbers || [],
      user_numbers: entryMap.get(w.draw_id) || [],
    }));
  } catch {
    return fallbackWinners.filter((w) => w.user_id === targetUserId);
  }
}

/**
 * Subscriber Action: Uploads scorecard screenshot proof for verification.
 * Enforces Winner Ownership: Authenticated subscriber must own the win.
 */
export async function submitWinnerProofAction(
  winnerId: string,
  formData: FormData
): Promise<WinnerActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (!auth) {
    return { success: false, error: "Authentication required." };
  }

  const file = formData.get("proof") as File | null;
  if (!file || !(file instanceof File)) {
    return { success: false, error: "No scorecard proof file provided." };
  }

  // Validate format and size (20MB limit, generous format acceptance)
  const validation = validateProofFile({
    size: file.size,
    type: file.type,
    name: file.name,
  });

  if (!validation.isValid) {
    return { success: false, error: validation.error || "Invalid proof file." };
  }

  if (!isSupabaseConfigured()) {
    const winner = fallbackWinners.find((w) => w.id === winnerId);
    if (!winner) {
      return { success: false, error: "Winning record not found." };
    }

    // Winner ownership validation
    if (winner.user_id !== auth.user.id) {
      return {
        success: false,
        error: "Unauthorized. You can only submit proof for your own winning entry.",
      };
    }

    if (winner.verification_status === "approved") {
      return {
        success: false,
        error: "This winning entry has already been verified and approved.",
      };
    }

    // Convert file to mock proof URL
    const mockUrl = `/uploads/proofs/${winnerId}-${Date.now()}-${file.name}`;
    winner.proof_file_url = mockUrl;
    winner.verification_status = "proof_submitted";
    winner.submitted_at = new Date().toISOString();
    winner.rejection_reason = null; // Clear previous rejection reason upon resubmission
    winner.updated_at = new Date().toISOString();

    safeRevalidate("/dashboard/winnings");
    safeRevalidate("/admin/winners");
    return { success: true, winner };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 2. Fetch winning record to verify existence and ownership
    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (fetchErr || !winner) {
      return { success: false, error: "Winning record not found." };
    }

    // 3. Strict Winner Ownership Enforcement
    if (winner.user_id !== auth.user.id) {
      return {
        success: false,
        error: "Unauthorized. You can only submit proof for your own winning entry.",
      };
    }

    if (winner.verification_status === "approved") {
      return {
        success: false,
        error: "This winning entry has already been verified and approved.",
      };
    }

    // 4. Construct proof file storage URL and upload to private bucket
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const storagePath = `${auth.user.id}/${winnerId}-${Date.now()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from("winner-proofs")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      return { success: false, error: `Proof upload failed: ${uploadErr.message}` };
    }

    const proofUrl = `storage://winner-proofs/${storagePath}`;

    // 5. Update winner record to proof_submitted, clear rejection reason, record submitted_at
    const { data: updated, error: updateErr } = await supabase
      .from("winners")
      .update({
        proof_file_url: proofUrl,
        verification_status: "proof_submitted",
        submitted_at: new Date().toISOString(),
        rejection_reason: null, // Clear any previous rejection reason upon resubmission
        updated_at: new Date().toISOString(),
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    safeRevalidate("/dashboard/winnings");
    safeRevalidate("/admin/winners");
    return { success: true, winner: updated as WinnerRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload proof";
    return { success: false, error: msg };
  }
}

/**
 * Securely generate a time-limited signed URL for viewing private winner proof evidence.
 * Accessible ONLY by the winner who owns the entry, or an administrator.
 */
export async function getWinnerProofSignedUrlAction(
  winnerId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const auth = await getCurrentUserAndProfile();
  if (!auth) {
    return { success: false, error: "Authentication required to access verification evidence." };
  }

  if (!isSupabaseConfigured()) {
    const winner = fallbackWinners.find((w) => w.id === winnerId);
    if (!winner) {
      return { success: false, error: "Winning entry not found." };
    }
    const isOwner = auth.user.id === winner.user_id;
    const isAdmin = auth.profile?.role === "admin";
    if (!isOwner && !isAdmin) {
      return { success: false, error: "Access denied. You do not have permission to view this evidence." };
    }
    return { success: true, url: winner.proof_file_url || undefined };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("id, user_id, proof_file_url")
      .eq("id", winnerId)
      .single();

    if (fetchErr || !winner) {
      return { success: false, error: "Winning entry not found." };
    }

    const isOwner = auth.user.id === winner.user_id;
    const isAdmin = auth.profile?.role === "admin";
    if (!isOwner && !isAdmin) {
      return { success: false, error: "Access denied. You do not have permission to view this evidence." };
    }

    if (!winner.proof_file_url) {
      return { success: false, error: "No proof has been uploaded for this entry." };
    }

    const path = winner.proof_file_url.replace(/^storage:\/\/winner-proofs\//, "");
    const { data: signed, error: signErr } = await supabase.storage
      .from("winner-proofs")
      .createSignedUrl(path, 3600);

    if (signErr || !signed) {
      return { success: false, error: signErr?.message || "Failed to generate signed URL." };
    }

    return { success: true, url: signed.signedUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve evidence URL";
    return { success: false, error: msg };
  }
}

/**
 * Admin Action: Approves submitted winner proof evidence.
 * Strictly requires admin role authorization.
 */
export async function approveWinnerVerificationAction(
  winnerId: string
): Promise<WinnerActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  if (!isSupabaseConfigured()) {
    const winner = fallbackWinners.find((w) => w.id === winnerId);
    if (!winner) {
      return { success: false, error: "Winning record not found." };
    }

    if (winner.payout_status === "paid") {
      return { success: false, error: "Cannot modify verification of already paid entry." };
    }

    winner.verification_status = "approved";
    winner.rejection_reason = null;
    winner.reviewed_at = new Date().toISOString();
    winner.reviewed_by = auth.user.id;
    winner.updated_at = new Date().toISOString();

    safeRevalidate("/admin/winners");
    safeRevalidate("/dashboard/winnings");
    return { success: true, winner };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (fetchErr || !winner) {
      return { success: false, error: "Winning record not found." };
    }

    if (winner.payout_status === "paid") {
      return { success: false, error: "Cannot modify verification of already paid entry." };
    }

    const { data: updated, error } = await supabase
      .from("winners")
      .update({
        verification_status: "approved",
        rejection_reason: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    safeRevalidate("/admin/winners");
    safeRevalidate("/dashboard/winnings");
    return { success: true, winner: updated as WinnerRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to approve verification";
    return { success: false, error: msg };
  }
}

/**
 * Admin Action: Rejects submitted winner proof evidence with mandatory reason.
 * Strictly requires admin role authorization.
 */
export async function rejectWinnerVerificationAction(
  winnerId: string,
  reason: string
): Promise<WinnerActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  const cleanReason = reason?.trim();
  if (!cleanReason) {
    return { success: false, error: "A clear rejection reason must be provided." };
  }

  if (!isSupabaseConfigured()) {
    const winner = fallbackWinners.find((w) => w.id === winnerId);
    if (!winner) {
      return { success: false, error: "Winning record not found." };
    }

    if (winner.payout_status === "paid") {
      return { success: false, error: "Cannot reject an already paid entry." };
    }

    winner.verification_status = "rejected";
    winner.rejection_reason = cleanReason;
    winner.reviewed_at = new Date().toISOString();
    winner.reviewed_by = auth.user.id;
    winner.updated_at = new Date().toISOString();

    safeRevalidate("/admin/winners");
    safeRevalidate("/dashboard/winnings");
    return { success: true, winner };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (fetchErr || !winner) {
      return { success: false, error: "Winning record not found." };
    }

    if (winner.payout_status === "paid") {
      return { success: false, error: "Cannot reject an already paid entry." };
    }

    const { data: updated, error } = await supabase
      .from("winners")
      .update({
        verification_status: "rejected",
        rejection_reason: cleanReason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    safeRevalidate("/admin/winners");
    safeRevalidate("/dashboard/winnings");
    return { success: true, winner: updated as WinnerRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reject verification";
    return { success: false, error: msg };
  }
}

/**
 * Admin Action: Progresses winner payout status from pending -> paid.
 * CRITICAL RULE: Payout can ONLY progress if verification_status === 'approved'.
 */
export async function markWinnerPayoutAction(
  winnerId: string
): Promise<WinnerActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  if (!isSupabaseConfigured()) {
    const winner = fallbackWinners.find((w) => w.id === winnerId);
    if (!winner) {
      return { success: false, error: "Winning record not found." };
    }

    // Enforce Verification Approved -> Payout Can Progress
    if (winner.verification_status !== "approved") {
      return {
        success: false,
        error: `Payout cannot progress until verification is approved. Current status: '${winner.verification_status}'.`,
      };
    }

    winner.payout_status = "paid";
    winner.updated_at = new Date().toISOString();

    safeRevalidate("/admin/winners");
    safeRevalidate("/dashboard/winnings");
    return { success: true, winner };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (fetchErr || !winner) {
      return { success: false, error: "Winning record not found." };
    }

    // Enforce Verification Approved -> Payout Can Progress
    if (winner.verification_status !== "approved") {
      return {
        success: false,
        error: `Payout cannot progress until verification is approved. Current status: '${winner.verification_status}'.`,
      };
    }

    const { data: updated, error } = await supabase
      .from("winners")
      .update({
        payout_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/winners");
    revalidatePath("/dashboard/winnings");
    return { success: true, winner: updated as WinnerRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to progress payout";
    return { success: false, error: msg };
  }
}
