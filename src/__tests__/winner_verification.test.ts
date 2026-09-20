/**
 * =============================================================================
 * DIGITAL HEROES — Phase 6: Winner Verification & Payout Test Suite
 * PRD Reference: § 09 (Winner Verification System), § 11.04 (Admin Winners)
 * =============================================================================
 *
 * Exhaustive coverage of:
 * 1. File validation (generous formats, 20MB ceiling, empty / missing / oversized files)
 * 2. Winner dashboard isolation (own winner visible, non-winner empty state, cross-user isolation)
 * 3. Evidence upload & ownership enforcement (wrong winner ID, non-owner reject, unauthenticated reject)
 * 4. Verification state machine & Admin review (approve, reject with mandatory reason, audit metadata)
 * 5. Resubmission flow (rejected -> proof_submitted, reason cleared, timestamp updated)
 * 6. Payment state progression (blocked for unapproved/rejected/proof_submitted, allowed for approved)
 * 7. Evidence security & signed URL access barriers (private storage, unauthorized access blocked)
 * 8. Database migration 6 schema invariants & private storage policies
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { validateProofFile, WINNER_PROOF_CONFIG } from "../lib/winners/config";
import {
  getUserWinningsList,
  getAdminWinnersList,
  submitWinnerProofAction,
  approveWinnerVerificationAction,
  rejectWinnerVerificationAction,
  markWinnerPayoutAction,
  getWinnerProofSignedUrlAction,
  _resetFallbackWinners,
  _getFallbackWinners,
} from "../lib/winners/actions";
import type { WinnerDetailRecord } from "../lib/winners/types";
import * as authActions from "../lib/auth/actions";

const MIGRATION_6_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/20260920000006_phase6_winner_verification.sql"
);

describe("1. File Size & Format Validation [Config]", () => {
  it("enforces generous 20 MB file size limit", () => {
    expect(WINNER_PROOF_CONFIG.MAX_FILE_SIZE_MB).toBe(20);
    expect(WINNER_PROOF_CONFIG.MAX_FILE_SIZE_BYTES).toBe(20 * 1024 * 1024);
  });

  it("accepts valid screenshot images (PNG, JPEG, WebP, GIF, HEIC, TIFF, BMP)", () => {
    expect(validateProofFile({ size: 1024, type: "image/png", name: "scorecard.png" }).isValid).toBe(true);
    expect(validateProofFile({ size: 1024, type: "image/jpeg", name: "scorecard.jpg" }).isValid).toBe(true);
    expect(validateProofFile({ size: 1024, type: "image/webp", name: "scorecard.webp" }).isValid).toBe(true);
    expect(validateProofFile({ size: 1024, type: "image/heic", name: "scorecard.heic" }).isValid).toBe(true);
    expect(validateProofFile({ size: 1024, type: "image/gif", name: "scorecard.gif" }).isValid).toBe(true);
    expect(validateProofFile({ size: 1024, type: "image/bmp", name: "scorecard.bmp" }).isValid).toBe(true);
  });

  it("accepts PDF documents (non-restrictive PRD policy)", () => {
    expect(validateProofFile({ size: 5000, type: "application/pdf", name: "handicap_cert.pdf" }).isValid).toBe(true);
  });

  it("rejects empty files (0 bytes)", () => {
    const res = validateProofFile({ size: 0, type: "image/png", name: "empty.png" });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("empty");
  });

  it("rejects files exceeding 20 MB", () => {
    const res = validateProofFile({
      size: 21 * 1024 * 1024,
      type: "image/png",
      name: "massive_screenshot.png",
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("20MB");
  });

  it("rejects non-image, non-pdf formats (e.g. executables, scripts)", () => {
    const res = validateProofFile({ size: 1024, type: "application/x-msdownload", name: "virus.exe" });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Unsupported file format");
  });
});

describe("2. Winner Dashboard Isolation [getUserWinningsList]", () => {
  const winnerUserA: WinnerDetailRecord = {
    id: "win-a",
    draw_id: "draw-1",
    user_id: "user-alpha",
    match_tier: "5_number",
    prize_amount: 150.0,
    verification_status: "pending",
    payout_status: "pending",
    proof_file_url: null,
    rejection_reason: null,
    submitted_at: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    winner_name: "Alpha Player",
    winner_email: "alpha@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 40, 45],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  const winnerUserB: WinnerDetailRecord = {
    id: "win-b",
    draw_id: "draw-1",
    user_id: "user-beta",
    match_tier: "4_number",
    prize_amount: 50.0,
    verification_status: "pending",
    payout_status: "pending",
    proof_file_url: null,
    rejection_reason: null,
    submitted_at: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    winner_name: "Beta Player",
    winner_email: "beta@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 40, 42],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  beforeEach(async () => {
    await _resetFallbackWinners([
      JSON.parse(JSON.stringify(winnerUserA)),
      JSON.parse(JSON.stringify(winnerUserB)),
    ]);
    vi.restoreAllMocks();
  });

  it("returns own winnings for authenticated user", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-alpha" } as any,
      profile: { role: "subscriber", full_name: "Alpha Player", email: "alpha@example.com" } as any,
    });

    const winnings = await getUserWinningsList("user-alpha");
    expect(winnings.length).toBe(1);
    expect(winnings[0].id).toBe("win-a");
    expect(winnings[0].user_id).toBe("user-alpha");
  });

  it("returns clean empty list for non-winner subscriber", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-gamma" } as any,
      profile: { role: "subscriber", full_name: "Gamma Player", email: "gamma@example.com" } as any,
    });

    const winnings = await getUserWinningsList("user-gamma");
    expect(winnings).toEqual([]);
  });

  it("blocks user from querying another subscriber's winnings", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-alpha" } as any,
      profile: { role: "subscriber", full_name: "Alpha Player", email: "alpha@example.com" } as any,
    });

    // Alpha tries to query Beta's winnings
    const winnings = await getUserWinningsList("user-beta");
    expect(winnings).toEqual([]);
  });
});

describe("3. Evidence Upload & Ownership Enforcement [submitWinnerProofAction]", () => {
  const winnerAlpha: WinnerDetailRecord = {
    id: "win-101",
    draw_id: "draw-1",
    user_id: "user-alpha",
    match_tier: "5_number",
    prize_amount: 120.0,
    verification_status: "pending",
    payout_status: "pending",
    proof_file_url: null,
    rejection_reason: null,
    submitted_at: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    winner_name: "Tiger Woods",
    winner_email: "tiger@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 40, 45],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  beforeEach(async () => {
    await _resetFallbackWinners([JSON.parse(JSON.stringify(winnerAlpha))]);
    vi.restoreAllMocks();
  });

  it("rejects proof upload if caller is unauthenticated", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue(null);

    const formData = new FormData();
    formData.append("proof", new File(["test content"], "screenshot.png", { type: "image/png" }));

    const res = await submitWinnerProofAction("win-101", formData);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Authentication required");
  });

  it("rejects upload if proof file is missing from formData", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-alpha" } as any,
      profile: { role: "subscriber", full_name: "Tiger", email: "tiger@example.com" } as any,
    });

    const formData = new FormData();
    const res = await submitWinnerProofAction("win-101", formData);
    expect(res.success).toBe(false);
    expect(res.error).toContain("No scorecard proof file provided");
  });

  it("rejects upload for non-existent winner ID", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-alpha" } as any,
      profile: { role: "subscriber", full_name: "Tiger", email: "tiger@example.com" } as any,
    });

    const formData = new FormData();
    formData.append("proof", new File(["content"], "score.png", { type: "image/png" }));

    const res = await submitWinnerProofAction("non-existent-win", formData);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Winning record not found");
  });

  it("enforces Winner Ownership: rejects upload if user does not own the win", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-beta" } as any,
      profile: { role: "subscriber", full_name: "Rory", email: "rory@example.com" } as any,
    });

    const formData = new FormData();
    formData.append("proof", new File(["test content"], "screenshot.png", { type: "image/png" }));

    const res = await submitWinnerProofAction("win-101", formData);
    expect(res.success).toBe(false);
    expect(res.error).toContain("only submit proof for your own winning entry");
  });

  it("allows owner to upload valid image: advances status to proof_submitted", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-alpha" } as any,
      profile: { role: "subscriber", full_name: "Tiger Woods", email: "tiger@example.com" } as any,
    });

    const formData = new FormData();
    formData.append("proof", new File(["test image bytes"], "official_scorecard.png", { type: "image/png" }));

    const res = await submitWinnerProofAction("win-101", formData);
    expect(res.success).toBe(true);
    expect(res.winner?.verification_status).toBe("proof_submitted");
    expect(res.winner?.proof_file_url).toContain("official_scorecard.png");
    expect(res.winner?.submitted_at).toBeDefined();
  });

  it("allows owner to upload valid PDF evidence", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-alpha" } as any,
      profile: { role: "subscriber", full_name: "Tiger Woods", email: "tiger@example.com" } as any,
    });

    const formData = new FormData();
    formData.append("proof", new File(["pdf content"], "official_card.pdf", { type: "application/pdf" }));

    const res = await submitWinnerProofAction("win-101", formData);
    expect(res.success).toBe(true);
    expect(res.winner?.verification_status).toBe("proof_submitted");
  });
});

describe("4. Admin Authorization & Review Workflow [Admin Verification]", () => {
  const winnerSubmitted: WinnerDetailRecord = {
    id: "win-102",
    draw_id: "draw-1",
    user_id: "user-gamma",
    match_tier: "4_number",
    prize_amount: 85.0,
    verification_status: "proof_submitted",
    payout_status: "pending",
    proof_file_url: "/uploads/proofs/win-102.png",
    rejection_reason: null,
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    winner_name: "Jordan Spieth",
    winner_email: "jordan@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 40, 42],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  beforeEach(async () => {
    await _resetFallbackWinners([JSON.parse(JSON.stringify(winnerSubmitted))]);
    vi.restoreAllMocks();
  });

  it("blocks non-admin subscriber from accessing admin winners list", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-gamma" } as any,
      profile: { role: "subscriber", full_name: "Subscriber", email: "sub@example.com" } as any,
    });

    const list = await getAdminWinnersList();
    expect(list).toEqual([]);
  });

  it("rejects approval by non-admin subscribers", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-gamma" } as any,
      profile: { role: "subscriber", full_name: "Subscriber", email: "sub@example.com" } as any,
    });

    const res = await approveWinnerVerificationAction("win-102");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Admin role required");
  });

  it("admin can approve evidence: sets status to approved and records review metadata", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-master" } as any,
      profile: { role: "admin", full_name: "Admin User", email: "admin@example.com" } as any,
    });

    const res = await approveWinnerVerificationAction("win-102");
    expect(res.success).toBe(true);
    expect(res.winner?.verification_status).toBe("approved");
    expect(res.winner?.reviewed_by).toBe("admin-master");
    expect(res.winner?.reviewed_at).toBeDefined();
    expect(res.winner?.rejection_reason).toBeNull();
  });

  it("admin rejection requires mandatory non-empty reason", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-master" } as any,
      profile: { role: "admin", full_name: "Admin User", email: "admin@example.com" } as any,
    });

    // Empty rejection reason
    const resEmpty = await rejectWinnerVerificationAction("win-102", "   ");
    expect(resEmpty.success).toBe(false);
    expect(resEmpty.error).toContain("reason must be provided");

    // Valid rejection reason
    const resValid = await rejectWinnerVerificationAction(
      "win-102",
      "Player name on scorecard does not match registered subscriber name."
    );
    expect(resValid.success).toBe(true);
    expect(resValid.winner?.verification_status).toBe("rejected");
    expect(resValid.winner?.reviewed_by).toBe("admin-master");
    expect(resValid.winner?.reviewed_at).toBeDefined();
    expect(resValid.winner?.rejection_reason).toContain("Player name on scorecard does not match");
  });
});

describe("5. Resubmission Flow [Assumption A-023: Rejected -> Resubmit -> proof_submitted]", () => {
  const rejectedWinner: WinnerDetailRecord = {
    id: "win-104",
    draw_id: "draw-1",
    user_id: "user-resubmit",
    match_tier: "3_number",
    prize_amount: 30.0,
    verification_status: "rejected",
    payout_status: "pending",
    proof_file_url: "/uploads/proofs/bad_card.png",
    rejection_reason: "Scorecard blurry and unreadable.",
    submitted_at: "2026-10-01T10:00:00.000Z",
    reviewed_at: "2026-10-01T12:00:00.000Z",
    reviewed_by: "admin-reviewer",
    created_at: "2026-10-01T09:00:00.000Z",
    updated_at: "2026-10-01T12:00:00.000Z",
    winner_name: "Resubmit Player",
    winner_email: "resubmit@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 31, 32],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  beforeEach(async () => {
    await _resetFallbackWinners([JSON.parse(JSON.stringify(rejectedWinner))]);
    vi.restoreAllMocks();
  });

  it("resubmission resets status to proof_submitted, clears rejection reason, and updates timestamp", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-resubmit" } as any,
      profile: { role: "subscriber", full_name: "Resubmit Player", email: "resubmit@example.com" } as any,
    });

    const formData = new FormData();
    formData.append("proof", new File(["high quality scan"], "clean_scorecard.png", { type: "image/png" }));

    const res = await submitWinnerProofAction("win-104", formData);
    expect(res.success).toBe(true);
    expect(res.winner?.verification_status).toBe("proof_submitted");
    expect(res.winner?.rejection_reason).toBeNull(); // Cleared
    expect(res.winner?.proof_file_url).toContain("clean_scorecard.png");
    expect(res.winner?.submitted_at).not.toBe("2026-10-01T10:00:00.000Z"); // Updated
  });

  it("prevents upload if win has already been approved", async () => {
    const approvedWinner: WinnerDetailRecord = {
      ...rejectedWinner,
      id: "win-approved",
      verification_status: "approved",
      rejection_reason: null,
    };
    await _resetFallbackWinners([approvedWinner]);

    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-resubmit" } as any,
      profile: { role: "subscriber", full_name: "Resubmit Player", email: "resubmit@example.com" } as any,
    });

    const formData = new FormData();
    formData.append("proof", new File(["content"], "another.png", { type: "image/png" }));

    const res = await submitWinnerProofAction("win-approved", formData);
    expect(res.success).toBe(false);
    expect(res.error).toContain("already been verified and approved");
  });
});

describe("6. Payment State Progression: Verification Approved -> Payout Can Progress", () => {
  const winnerUnapproved: WinnerDetailRecord = {
    id: "win-103",
    draw_id: "draw-1",
    user_id: "user-delta",
    match_tier: "3_number",
    prize_amount: 25.0,
    verification_status: "proof_submitted", // Not approved yet
    payout_status: "pending",
    proof_file_url: "/uploads/proofs/win-103.png",
    rejection_reason: null,
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    winner_name: "Phil Mickelson",
    winner_email: "phil@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 32, 34],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  beforeEach(async () => {
    await _resetFallbackWinners([JSON.parse(JSON.stringify(winnerUnapproved))]);
    vi.restoreAllMocks();
  });

  it("strictly prohibits payout progression if verification_status === 'proof_submitted'", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-master" } as any,
      profile: { role: "admin", full_name: "Admin User", email: "admin@example.com" } as any,
    });

    const res = await markWinnerPayoutAction("win-103");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Payout cannot progress until verification is approved");

    const winnerInStore = (await _getFallbackWinners()).find((w) => w.id === "win-103");
    expect(winnerInStore?.payout_status).toBe("pending");
  });

  it("strictly prohibits payout progression if verification_status === 'rejected'", async () => {
    const rejected: WinnerDetailRecord = {
      ...winnerUnapproved,
      id: "win-rejected",
      verification_status: "rejected",
    };
    await _resetFallbackWinners([rejected]);

    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-master" } as any,
      profile: { role: "admin", full_name: "Admin User", email: "admin@example.com" } as any,
    });

    const res = await markWinnerPayoutAction("win-rejected");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Payout cannot progress until verification is approved");
  });

  it("prohibits non-admin from marking payout as Paid", async () => {
    const approved: WinnerDetailRecord = {
      ...winnerUnapproved,
      id: "win-approved",
      verification_status: "approved",
    };
    await _resetFallbackWinners([approved]);

    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-delta" } as any,
      profile: { role: "subscriber", full_name: "Subscriber", email: "sub@example.com" } as any,
    });

    const res = await markWinnerPayoutAction("win-approved");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Admin role required");
  });

  it("allows payout progression once verification is approved by authorized admin", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-master" } as any,
      profile: { role: "admin", full_name: "Admin User", email: "admin@example.com" } as any,
    });

    // 1. Approve evidence first
    const approveRes = await approveWinnerVerificationAction("win-103");
    expect(approveRes.success).toBe(true);

    // 2. Now progress payout
    const payoutRes = await markWinnerPayoutAction("win-103");
    expect(payoutRes.success).toBe(true);
    expect(payoutRes.winner?.payout_status).toBe("paid");
  });
});

describe("7. Private Storage & Signed URL Security [getWinnerProofSignedUrlAction]", () => {
  const winnerEvidence: WinnerDetailRecord = {
    id: "win-secret",
    draw_id: "draw-1",
    user_id: "user-owner",
    match_tier: "5_number",
    prize_amount: 100.0,
    verification_status: "proof_submitted",
    payout_status: "pending",
    proof_file_url: "storage://winner-proofs/user-owner/proof.png",
    rejection_reason: null,
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    winner_name: "Evidence Owner",
    winner_email: "owner@example.com",
    draw_number: 1,
    draw_month: "2026-10-01",
    draw_mode: "random",
    user_numbers: [10, 20, 30, 40, 45],
    winning_numbers: [10, 20, 30, 40, 45],
  };

  beforeEach(async () => {
    await _resetFallbackWinners([JSON.parse(JSON.stringify(winnerEvidence))]);
    vi.restoreAllMocks();
  });

  it("blocks unauthenticated callers from accessing evidence URL", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue(null);

    const res = await getWinnerProofSignedUrlAction("win-secret");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Authentication required");
  });

  it("blocks other subscribers from accessing another winner's evidence", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-snooper" } as any,
      profile: { role: "subscriber", full_name: "Snooper", email: "snoop@example.com" } as any,
    });

    const res = await getWinnerProofSignedUrlAction("win-secret");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Access denied");
  });

  it("allows winning owner to access their own evidence URL", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "user-owner" } as any,
      profile: { role: "subscriber", full_name: "Owner", email: "owner@example.com" } as any,
    });

    const res = await getWinnerProofSignedUrlAction("win-secret");
    expect(res.success).toBe(true);
    expect(res.url).toBe("storage://winner-proofs/user-owner/proof.png");
  });

  it("allows admin to access any winner's evidence URL", async () => {
    vi.spyOn(authActions, "getCurrentUserAndProfile").mockResolvedValue({
      user: { id: "admin-master" } as any,
      profile: { role: "admin", full_name: "Admin", email: "admin@example.com" } as any,
    });

    const res = await getWinnerProofSignedUrlAction("win-secret");
    expect(res.success).toBe(true);
    expect(res.url).toBe("storage://winner-proofs/user-owner/proof.png");
  });
});

describe("8. Database Migration 6 Schema Invariants [Static SQL]", () => {
  it("migration 000006 file exists", () => {
    expect(fs.existsSync(MIGRATION_6_PATH)).toBe(true);
  });

  it("adds submitted_at, reviewed_at, and reviewed_by audit columns", () => {
    const sql = fs.readFileSync(MIGRATION_6_PATH, "utf-8");
    expect(sql).toContain("submitted_at TIMESTAMPTZ");
    expect(sql).toContain("reviewed_at TIMESTAMPTZ");
    expect(sql).toContain("reviewed_by UUID REFERENCES auth.users(id)");
  });

  it("creates performance indexes on payout_status and audit timestamps", () => {
    const sql = fs.readFileSync(MIGRATION_6_PATH, "utf-8");
    expect(sql).toContain("idx_winners_payout_status");
    expect(sql).toContain("idx_winners_submitted_at");
    expect(sql).toContain("idx_winners_reviewed_at");
  });

  it("enforces RLS preventing winner from self-approving or modifying payout status", () => {
    const sql = fs.readFileSync(MIGRATION_6_PATH, "utf-8");
    expect(sql).toContain("winners_update_own_proof");
    expect(sql).toContain("payout_status = 'pending'");
    expect(sql).toContain("verification_status IN ('pending', 'proof_submitted')");
  });

  it("configures private storage bucket 'winner-proofs' with 20MB limit and storage RLS", () => {
    const sql = fs.readFileSync(MIGRATION_6_PATH, "utf-8");
    expect(sql).toContain("'winner-proofs'");
    expect(sql).toContain("false"); // private bucket
    expect(sql).toContain("20971520"); // 20 MB
    expect(sql).toContain("winner_upload_own_proof_files");
    expect(sql).toContain("winner_view_own_proof_files");
    expect(sql).toContain("admin_manage_winner_proof_files");
  });
});
