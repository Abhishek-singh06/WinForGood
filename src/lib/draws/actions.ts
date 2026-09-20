"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import type {
  DrawRecord,
  DrawActionResponse,
  DrawMode,
  DrawEntryRecord,
  DrawTierAllocationRecord,
  WinnerRecord,
  MatchTier,
  FullPrizePoolBreakdown,
} from "./types";
import { defaultScoreMapper } from "./mapper";
import { defaultEligibilityResolver } from "./eligibility";
import { getDrawStrategy } from "./engine";
import { defaultPrizePoolCalculator } from "./pool";
import { calculateMatchCount, determineMatchTier } from "./matching";

/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Production Draw Server Actions
 * PRD Reference: § 06 (Draw & Reward System), § 07 (Prize Pool Logic), § 11 (Admin)
 * =============================================================================
 */

export interface ParticipantCandidate {
  userId: string;
  scores: number[];
  plan?: "monthly" | "yearly";
}

export interface SimulationCoreInput {
  drawId: string;
  month: string;
  drawMode: DrawMode;
  participants: ParticipantCandidate[];
  jackpotRolloverInPence?: number;
  randomSeed?: string;
}

export interface SimulationCoreResult {
  winningNumbers: number[];
  entries: Array<{
    userId: string;
    numbers: number[];
    matchCount: number;
    tier: MatchTier | null;
  }>;
  breakdown: FullPrizePoolBreakdown;
}

/**
 * PURE SIMULATION CORE
 * Encapsulates 100% of the deterministic math, ticket mapping, random/algorithmic draw,
 * match calculation, prize pool distribution, rollover, and charity disposition.
 */
export async function executeDrawSimulationCore(
  input: SimulationCoreInput
): Promise<SimulationCoreResult> {
  // 1. Filter eligible participants and generate tickets
  const eligibleEntries: Array<{
    userId: string;
    numbers: number[];
    plan: "monthly" | "yearly";
  }> = [];

  for (const p of input.participants) {
    if (defaultEligibilityResolver.isEligible(p.scores.length, true)) {
      const ticket = defaultScoreMapper.mapScoresToTicket(p.scores);
      eligibleEntries.push({
        userId: p.userId,
        numbers: ticket,
        plan: p.plan || "monthly",
      });
    }
  }

  // 2. Generate winning numbers using requested strategy
  const strategy = getDrawStrategy(input.drawMode);
  let freqDist: Record<number, number> | undefined;

  if (input.drawMode === "algorithmic") {
    const allTickets = eligibleEntries.map((e) => e.numbers);
    const { AlgorithmicDrawStrategy } = await import("./engine");
    freqDist = AlgorithmicDrawStrategy.buildFrequencyDistribution(allTickets);
  }

  const winningNumbers = await strategy.generateWinningNumbers({
    drawId: input.drawId,
    month: input.month,
    mode: input.drawMode,
    randomSeed: input.randomSeed,
    frequencyDistribution: freqDist,
  });

  // 3. Count matches for each participant entry
  const winnerCounts: Record<MatchTier, number> = {
    "5_number": 0,
    "4_number": 0,
    "3_number": 0,
  };

  const processedEntries = eligibleEntries.map((e) => {
    const matchCount = calculateMatchCount(e.numbers, winningNumbers);
    const tier = determineMatchTier(matchCount);
    if (tier) {
      winnerCounts[tier]++;
    }
    return {
      userId: e.userId,
      numbers: e.numbers,
      matchCount,
      tier,
    };
  });

  // 4. Calculate prize pool breakdown with integer cents
  let monthlyCount = 0;
  let yearlyCount = 0;
  for (const e of eligibleEntries) {
    if (e.plan === "yearly") {
      yearlyCount++;
    } else {
      monthlyCount++;
    }
  }

  const breakdown = defaultPrizePoolCalculator.calculateFullBreakdown({
    subscribers: { monthly: monthlyCount, yearly: yearlyCount },
    winnerCounts,
    jackpotRolloverInPence: input.jackpotRolloverInPence || 0,
  });

  return {
    winningNumbers,
    entries: processedEntries,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// IN-MEMORY FALLBACK STORE (For offline/mock environments)
// ---------------------------------------------------------------------------
let fallbackDraws: DrawRecord[] = [];
let fallbackAllocations: DrawTierAllocationRecord[] = [];
let fallbackEntries: DrawEntryRecord[] = [];
let fallbackWinners: WinnerRecord[] = [];

/**
 * Fetches all published draws for subscriber & public visibility.
 */
export async function getPublishedDraws(): Promise<DrawRecord[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    return fallbackDraws.filter((d) => d.status === "published");
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("month", { ascending: false });

    if (error || !data) {
      return fallbackDraws.filter((d) => d.status === "published");
    }

    return data as DrawRecord[];
  } catch {
    return fallbackDraws.filter((d) => d.status === "published");
  }
}

/**
 * Fetches the latest published draw.
 */
export async function getLatestPublishedDraw(): Promise<DrawRecord | null> {
  const published = await getPublishedDraws();
  return published.length > 0 ? published[0] : null;
}

/**
 * Fetches draws for the admin control surface (all statuses).
 */
export async function getAdminDraws(): Promise<DrawRecord[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    return fallbackDraws;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .order("month", { ascending: false });

    if (error || !data) {
      return fallbackDraws;
    }

    return data as DrawRecord[];
  } catch {
    return fallbackDraws;
  }
}

/**
 * Fetches full details for a single draw (allocations and entries count).
 */
export async function getDrawDetails(drawId: string): Promise<{
  draw: DrawRecord | null;
  tierAllocations: DrawTierAllocationRecord[];
  entryCount: number;
  winnerCount: number;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    const draw = fallbackDraws.find((d) => d.id === drawId) || null;
    const tierAllocations = fallbackAllocations.filter((a) => a.draw_id === drawId);
    const entryCount = fallbackEntries.filter((e) => e.draw_id === drawId).length;
    const winnerCount = fallbackWinners.filter((w) => w.draw_id === drawId).length;
    return { draw, tierAllocations, entryCount, winnerCount };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const [drawRes, allocRes, entriesRes, winnersRes] = await Promise.all([
      supabase.from("draws").select("*").eq("id", drawId).single(),
      supabase.from("draw_tier_allocations").select("*").eq("draw_id", drawId),
      supabase.from("draw_entries").select("id", { count: "exact", head: true }).eq("draw_id", drawId),
      supabase.from("winners").select("id", { count: "exact", head: true }).eq("draw_id", drawId),
    ]);

    return {
      draw: (drawRes.data as DrawRecord) || null,
      tierAllocations: (allocRes.data as DrawTierAllocationRecord[]) || [],
      entryCount: entriesRes.count || 0,
      winnerCount: winnersRes.count || 0,
    };
  } catch {
    return { draw: null, tierAllocations: [], entryCount: 0, winnerCount: 0 };
  }
}

/**
 * Fetches an authenticated subscriber's participating entry in a draw.
 */
export async function getUserDrawEntry(
  drawId: string,
  userId: string
): Promise<DrawEntryRecord | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    return fallbackEntries.find((e) => e.draw_id === drawId && e.user_id === userId) || null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", drawId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as DrawEntryRecord;
  } catch {
    return null;
  }
}

/**
 * Fetches an authenticated subscriber's winning record for a draw.
 */
export async function getUserWinningRecord(
  drawId: string,
  userId: string
): Promise<WinnerRecord | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    return fallbackWinners.find((w) => w.draw_id === drawId && w.user_id === userId) || null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("winners")
      .select("*")
      .eq("draw_id", drawId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as WinnerRecord;
  } catch {
    return null;
  }
}

/**
 * Admin action to create a new draft monthly draw cycle.
 */
export async function createDraftDrawAction(
  prevState: any,
  formData: FormData
): Promise<DrawActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  const month = (formData.get("month") as string)?.trim();
  const mode = (formData.get("mode") as DrawMode) || "random";

  if (!month) {
    return { success: false, error: "Draw cycle month is required (YYYY-MM-01 format)." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    const newDraw: DrawRecord = {
      id: `mock-draw-${Date.now()}`,
      draw_number: fallbackDraws.length + 1,
      month,
      draw_mode: mode,
      status: "draft",
      winning_numbers: null,
      total_subscribers_snapshot: null,
      total_prize_pool: null,
      jackpot_rollover_in: 0,
      jackpot_rollover_out: 0,
      simulation_run_at: null,
      published_at: null,
      created_by: auth.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackDraws.unshift(newDraw);
    revalidatePath("/admin/draws");
    return { success: true, draw: newDraw };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("draws")
      .insert({
        month,
        draw_mode: mode,
        status: "draft",
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/draws");
    return { success: true, draw: data as DrawRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create draft draw";
    return { success: false, error: msg };
  }
}

/**
 * Admin action to stage a draw simulation.
 * Calculates tickets, winning numbers, matches, prize pool breakdown, rollover, and charity disposition.
 */
export async function stageDrawSimulationAction(
  drawId: string,
  options?: { randomSeed?: string }
): Promise<DrawActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    const draw = fallbackDraws.find((d) => d.id === drawId);
    if (!draw) return { success: false, error: "Draw not found" };
    if (draw.status !== "draft" && draw.status !== "simulated") {
      return { success: false, error: "Only draft or simulated draws can be simulated." };
    }

    // Generate mock simulation
    const mockParticipants: ParticipantCandidate[] = [
      { userId: "usr-1", scores: [36, 38, 40, 42, 44], plan: "monthly" },
      { userId: "usr-2", scores: [30, 32, 34, 36, 38], plan: "yearly" },
      { userId: "usr-3", scores: [20, 22, 24], plan: "monthly" },
    ];

    const result = await executeDrawSimulationCore({
      drawId: draw.id,
      month: draw.month,
      drawMode: draw.draw_mode,
      participants: mockParticipants,
      jackpotRolloverInPence: Math.round(draw.jackpot_rollover_in * 100),
      randomSeed: options?.randomSeed,
    });

    draw.winning_numbers = result.winningNumbers;
    draw.total_subscribers_snapshot = result.entries.length;
    draw.total_prize_pool = result.breakdown.grossNewPool / 100;
    draw.jackpot_rollover_out = result.breakdown.jackpotRolloverOut / 100;
    draw.status = "simulated";
    draw.simulation_run_at = new Date().toISOString();
    draw.updated_at = new Date().toISOString();

    // Store mock allocations
    fallbackAllocations = fallbackAllocations.filter((a) => a.draw_id !== drawId);
    for (const tierKey of ["5_number", "4_number", "3_number"] as MatchTier[]) {
      const t = result.breakdown.tierAllocations[tierKey];
      fallbackAllocations.push({
        id: `alloc-${drawId}-${tierKey}`,
        draw_id: drawId,
        tier: tierKey,
        pool_percentage: t.poolPercentage,
        allocated_amount: t.allocatedAmount / 100,
        winner_count: t.winnerCount,
        prize_per_winner: t.prizePerWinner / 100,
        unclaimed_amount: t.unclaimedAmount / 100,
        disposition: t.disposition,
        remainder_amount: t.remainderAmount / 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    revalidatePath("/admin/draws");
    return { success: true, draw };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch draw
    const { data: draw, error: fetchErr } = await supabase
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (fetchErr || !draw) {
      return { success: false, error: "Draw not found." };
    }

    if (draw.status !== "draft" && draw.status !== "simulated") {
      return {
        success: false,
        error: `Cannot simulate draw in '${draw.status}' status. Only draft draws can be simulated.`,
      };
    }

    // 2. Fetch active subscribers
    const { data: subs, error: subsErr } = await supabase
      .from("subscriptions")
      .select("user_id, plan")
      .eq("status", "active");

    if (subsErr) {
      return { success: false, error: `Failed to query active subscribers: ${subsErr.message}` };
    }

    const participants: ParticipantCandidate[] = [];

    // 3. For each active subscriber, fetch their rolling 5 latest scores
    for (const sub of subs || []) {
      const { data: scoreRows } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", sub.user_id)
        .order("score_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      const scores = (scoreRows || []).map((r) => r.score);
      participants.push({
        userId: sub.user_id,
        scores,
        plan: sub.plan === "yearly" ? "yearly" : "monthly",
      });
    }

    // 4. Run pure simulation core
    const result = await executeDrawSimulationCore({
      drawId: draw.id,
      month: draw.month,
      drawMode: draw.draw_mode,
      participants,
      jackpotRolloverInPence: Math.round(Number(draw.jackpot_rollover_in || 0) * 100),
      randomSeed: options?.randomSeed,
    });

    // 5. Transactional updates in Supabase
    // Update draw record
    const { data: updatedDraw, error: updateErr } = await supabase
      .from("draws")
      .update({
        winning_numbers: result.winningNumbers,
        total_subscribers_snapshot: result.entries.length,
        total_prize_pool: result.breakdown.grossNewPool / 100,
        jackpot_rollover_out: result.breakdown.jackpotRolloverOut / 100,
        status: "simulated",
        simulation_run_at: new Date().toISOString(),
      })
      .eq("id", drawId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: `Failed to update draw: ${updateErr.message}` };
    }

    // Clean up old entries and insert fresh snapshot
    await supabase.from("draw_entries").delete().eq("draw_id", drawId);

    if (result.entries.length > 0) {
      const entryRows = result.entries.map((e) => ({
        draw_id: drawId,
        user_id: e.userId,
        numbers: e.numbers,
        match_count: e.matchCount,
      }));
      const { error: insertEntriesErr } = await supabase
        .from("draw_entries")
        .insert(entryRows);
      if (insertEntriesErr) {
        return { success: false, error: `Failed to insert entries: ${insertEntriesErr.message}` };
      }
    }

    // Clean up old tier allocations and insert new
    await supabase.from("draw_tier_allocations").delete().eq("draw_id", drawId);

    const allocRows = (["5_number", "4_number", "3_number"] as MatchTier[]).map((tierKey) => {
      const t = result.breakdown.tierAllocations[tierKey];
      return {
        draw_id: drawId,
        tier: tierKey,
        pool_percentage: t.poolPercentage,
        allocated_amount: t.allocatedAmount / 100,
        winner_count: t.winnerCount,
        prize_per_winner: t.prizePerWinner / 100,
        unclaimed_amount: t.unclaimedAmount / 100,
        disposition: t.disposition,
        remainder_amount: t.remainderAmount / 100,
      };
    });

    const { error: insertAllocErr } = await supabase
      .from("draw_tier_allocations")
      .insert(allocRows);

    if (insertAllocErr) {
      return { success: false, error: `Failed to insert allocations: ${insertAllocErr.message}` };
    }

    revalidatePath("/admin/draws");
    return { success: true, draw: updatedDraw as DrawRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to stage simulation";
    return { success: false, error: msg };
  }
}

/**
 * Admin action to publish a simulated draw.
 * Once published, results are public and immutable.
 */
export async function publishDrawAction(
  drawId: string
): Promise<DrawActionResponse> {
  const auth = await getCurrentUserAndProfile();
  if (auth?.profile?.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin role required." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseUrl.includes("placeholder")) {
    const draw = fallbackDraws.find((d) => d.id === drawId);
    if (!draw) return { success: false, error: "Draw not found" };
    if (draw.status !== "simulated") {
      return { success: false, error: `Draw must be simulated before publishing. Current status: '${draw.status}'.` };
    }

    draw.status = "published";
    draw.published_at = new Date().toISOString();
    draw.updated_at = new Date().toISOString();

    // Create fallback winners
    for (const e of fallbackEntries.filter((ent) => ent.draw_id === drawId && (ent.match_count || 0) >= 3)) {
      const tier = determineMatchTier(e.match_count || 0);
      if (tier) {
        const alloc = fallbackAllocations.find((a) => a.draw_id === drawId && a.tier === tier);
        fallbackWinners.push({
          id: `win-${e.id}`,
          draw_id: drawId,
          user_id: e.user_id,
          match_tier: tier,
          prize_amount: alloc?.prize_per_winner || 0,
          verification_status: "pending",
          payout_status: "pending",
          proof_file_url: null,
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    revalidatePath("/admin/draws");
    revalidatePath("/dashboard/draws");
    return { success: true, draw };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: draw, error: fetchErr } = await supabase
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (fetchErr || !draw) {
      return { success: false, error: "Draw not found." };
    }

    if (draw.status !== "simulated") {
      return {
        success: false,
        error: `Draw must be simulated before publishing (PRD § 06 / BR-044). Current status: '${draw.status}'.`,
      };
    }

    // Fetch allocations for prize amounts
    const { data: allocRows } = await supabase
      .from("draw_tier_allocations")
      .select("*")
      .eq("draw_id", drawId);

    const prizePerTier: Record<MatchTier, number> = {
      "5_number": 0,
      "4_number": 0,
      "3_number": 0,
    };
    for (const a of allocRows || []) {
      prizePerTier[a.tier as MatchTier] = Number(a.prize_per_winner || 0);
    }

    // Fetch winning entries (match_count >= 3)
    const { data: winningEntries } = await supabase
      .from("draw_entries")
      .select("user_id, match_count")
      .eq("draw_id", drawId)
      .gte("match_count", 3);

    // Insert winners ledger
    if (winningEntries && winningEntries.length > 0) {
      const winnerRows = winningEntries
        .map((entry) => {
          const tier = determineMatchTier(entry.match_count);
          if (!tier) return null;
          return {
            draw_id: drawId,
            user_id: entry.user_id,
            match_tier: tier,
            prize_amount: prizePerTier[tier],
            verification_status: "pending" as const,
            payout_status: "pending" as const,
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (winnerRows.length > 0) {
        const { error: winErr } = await supabase
          .from("winners")
          .insert(winnerRows);
        if (winErr) {
          return { success: false, error: `Failed to create winners ledger: ${winErr.message}` };
        }
      }
    }

    // Transition draw to published
    const { data: updatedDraw, error } = await supabase
      .from("draws")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", drawId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/draws");
    revalidatePath("/dashboard/draws");
    return { success: true, draw: updatedDraw as DrawRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to publish draw";
    return { success: false, error: msg };
  }
}
