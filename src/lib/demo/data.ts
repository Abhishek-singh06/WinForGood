/**
 * Demo Mode — Isolated Mock Data Layer
 *
 * IMPORTANT: This file contains FICTIONAL demo data only.
 * It does NOT connect to Supabase, Stripe, or any real backend service.
 * All data is deterministic and clearly marked as demo/sample data.
 *
 * This data layer is used exclusively by the /demo/* route group.
 */

// ============================================================================
// DEMO USER PROFILE
// ============================================================================

export const DEMO_USER = {
  id: "demo-user-00000000-0000-0000-0000-000000000000",
  email: "alex.fairway@demo.digitalheroes.example",
  full_name: "Alex Fairway",
  role: "subscriber" as const,
  created_at: "2025-03-15T10:30:00Z",
} as const;

// ============================================================================
// DEMO SUBSCRIPTION STATE
// ============================================================================

export const DEMO_SUBSCRIPTION = {
  id: "demo-sub-001",
  plan: "Monthly" as const,
  status: "active" as const,
  statusLabel: "Active Monthly Subscription",
  hasAccess: true,
  inGracePeriod: false,
  current_period_start: "2026-09-01T00:00:00Z",
  current_period_end: "2026-10-01T00:00:00Z",
  cancel_at_period_end: false,
  amount: 10.0,
  currency: "GBP",
} as const;

// ============================================================================
// DEMO STABLEFORD SCORES (Rolling 5)
// ============================================================================

export const DEMO_SCORES = [
  { id: "demo-score-1", score: 38, score_date: "2026-09-14", created_at: "2026-09-14T15:00:00Z" },
  { id: "demo-score-2", score: 32, score_date: "2026-09-07", created_at: "2026-09-07T14:30:00Z" },
  { id: "demo-score-3", score: 41, score_date: "2026-08-31", created_at: "2026-08-31T16:00:00Z" },
  { id: "demo-score-4", score: 35, score_date: "2026-08-24", created_at: "2026-08-24T12:00:00Z" },
  { id: "demo-score-5", score: 29, score_date: "2026-08-17", created_at: "2026-08-17T11:30:00Z" },
] as const;

// Derived ticket numbers from demo scores (preserves duplicates per Decision #1)
export const DEMO_TICKET_NUMBERS = DEMO_SCORES.map((s) => s.score);

// ============================================================================
// DEMO CHARITY
// ============================================================================

export const DEMO_SELECTED_CHARITY = {
  id: "demo-charity-001",
  name: "Greenfield Youth Foundation",
  slug: "greenfield-youth-foundation",
  category: "Youth Development & Education",
  mission:
    "Empowering disadvantaged young people through sport, mentorship, and educational scholarships across the United Kingdom.",
  is_active: true,
  created_at: "2024-01-10T00:00:00Z",
  image_url: null,
} as const;

export const DEMO_CHARITY_PERCENTAGE = 15;

export const DEMO_CHARITIES = [
  DEMO_SELECTED_CHARITY,
  {
    id: "demo-charity-002",
    name: "Veterans on Course",
    slug: "veterans-on-course",
    category: "Veteran Support & Rehabilitation",
    mission:
      "Supporting military veterans through golf-based rehabilitation programmes, community reintegration, and mental health services.",
    is_active: true,
    created_at: "2024-02-20T00:00:00Z",
    image_url: null,
  },
  {
    id: "demo-charity-003",
    name: "Accessible Greens Trust",
    slug: "accessible-greens-trust",
    category: "Disability & Inclusion",
    mission:
      "Making golf and outdoor recreation accessible to people with physical disabilities through adaptive equipment and inclusive coaching.",
    is_active: true,
    created_at: "2024-03-05T00:00:00Z",
    image_url: null,
  },
] as const;

// ============================================================================
// DEMO DRAW DATA
// ============================================================================

export const DEMO_UPCOMING_DRAW = {
  id: "demo-draw-upcoming",
  draw_number: 12,
  month: "2026-10-01",
  status: "scheduled" as const,
  winning_numbers: null,
  total_pool: 4850.0,
  total_entries: 485,
} as const;

export const DEMO_LATEST_DRAW = {
  id: "demo-draw-latest",
  draw_number: 11,
  month: "2026-09-01",
  status: "published" as const,
  winning_numbers: [12, 29, 35, 38, 41] as number[],
  total_pool: 4620.0,
  total_entries: 462,
  published_at: "2026-09-15T12:00:00Z",
} as const;

export const DEMO_PREVIOUS_DRAWS = [
  DEMO_LATEST_DRAW,
  {
    id: "demo-draw-10",
    draw_number: 10,
    month: "2026-08-01",
    status: "published" as const,
    winning_numbers: [8, 19, 27, 33, 42] as number[],
    total_pool: 4380.0,
    total_entries: 438,
    published_at: "2026-08-15T12:00:00Z",
  },
  {
    id: "demo-draw-09",
    draw_number: 9,
    month: "2026-07-01",
    status: "published" as const,
    winning_numbers: [5, 14, 22, 36, 44] as number[],
    total_pool: 4150.0,
    total_entries: 415,
    published_at: "2026-07-15T12:00:00Z",
  },
] as const;

// Demo user's entry in the latest draw — 3 matches (29, 35, 38)
export const DEMO_USER_DRAW_ENTRY = {
  draw_id: DEMO_LATEST_DRAW.id,
  numbers: [38, 32, 41, 35, 29] as number[],
  match_count: 3,
  matched_numbers: [29, 35, 38] as number[],
} as const;

// ============================================================================
// DEMO WINNINGS
// ============================================================================

export const DEMO_WINNINGS = [
  {
    id: "demo-win-001",
    draw_id: DEMO_LATEST_DRAW.id,
    draw_number: 11,
    draw_month: "2026-09-01",
    match_tier: "3_number" as const,
    match_count: 3,
    prize_amount: 288.75,
    verification_status: "approved" as const,
    payout_status: "paid" as const,
    proof_url: null,
    submitted_at: "2026-09-16T10:00:00Z",
    reviewed_at: "2026-09-17T14:00:00Z",
    paid_at: "2026-09-18T09:00:00Z",
  },
  {
    id: "demo-win-002",
    draw_id: "demo-draw-07",
    draw_number: 7,
    draw_month: "2026-05-01",
    match_tier: "4_number" as const,
    match_count: 4,
    prize_amount: 567.0,
    verification_status: "approved" as const,
    payout_status: "paid" as const,
    proof_url: null,
    submitted_at: "2026-05-16T11:00:00Z",
    reviewed_at: "2026-05-17T15:00:00Z",
    paid_at: "2026-05-19T10:00:00Z",
  },
] as const;

export const DEMO_TOTAL_WINNINGS = DEMO_WINNINGS.reduce((sum, w) => sum + w.prize_amount, 0);

// ============================================================================
// DEMO PAYMENT METHODS (for payment simulation)
// ============================================================================

export type DemoPaymentMethod = "card" | "upi" | "qr" | "bank_transfer";

export type DemoPaymentState =
  | "idle"
  | "selecting"
  | "processing"
  | "success"
  | "failure"
  | "cancelled";

export const DEMO_PAYMENT_METHODS: Array<{
  id: DemoPaymentMethod;
  label: string;
  description: string;
}> = [
  { id: "card", label: "Credit / Debit Card", description: "Simulated card payment" },
  { id: "upi", label: "UPI", description: "Simulated UPI transfer" },
  { id: "qr", label: "QR Code", description: "Simulated QR code scan payment" },
  { id: "bank_transfer", label: "Bank Transfer", description: "Simulated bank transfer instructions" },
];
