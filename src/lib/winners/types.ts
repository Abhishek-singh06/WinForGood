/**
 * =============================================================================
 * DIGITAL HEROES — Phase 6: Winner Verification & Payout Types
 * PRD Reference: § 09 (Winner Verification System), § 11.04 (Admin Winners)
 * =============================================================================
 */

import { MatchTier, WinnerVerificationStatus, WinnerPayoutStatus, DrawMode } from "@/lib/draws/types";

export type { MatchTier, WinnerVerificationStatus, WinnerPayoutStatus, DrawMode };

/**
 * Core database record representing a row in public.winners with audit fields.
 */
export interface WinnerRecord {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: MatchTier;
  prize_amount: number | null;
  verification_status: WinnerVerificationStatus;
  payout_status: WinnerPayoutStatus;
  proof_file_url: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended view record joining winner, profile, draw, and participant ticket.
 * Required for administrative review studio and subscriber winnings ledger.
 */
export interface WinnerDetailRecord extends WinnerRecord {
  winner_name: string;
  winner_email: string;
  draw_number: number;
  draw_month: string;
  draw_mode: DrawMode;
  user_numbers: number[];
  winning_numbers: number[];
  reviewer_email?: string | null;
}

/**
 * Server action response wrappers
 */
export interface WinnerActionResponse {
  success: boolean;
  error?: string;
  winner?: WinnerRecord;
}

export interface ProofUploadResult {
  success: boolean;
  error?: string;
  fileUrl?: string;
}
