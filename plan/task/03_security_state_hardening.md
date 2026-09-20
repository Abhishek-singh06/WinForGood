# Task 03: Security, Idempotency & State Machine Hardening

## Contexto
Audit RLS policies, server actions, state machine transitions, and idempotency guarantees.

## Subtareas
- [x] Verify RLS across all 8 tables (`profiles`, `scores`, `charities`, `subscriptions`, `draws`, `draw_tier_allocations`, `draw_entries`, `winners`).
- [x] Audit state machines (Subscriptions, Draws, Winners) and ensure impossible transitions are rejected.
- [x] Verify idempotency on critical actions (Stripe webhooks, draw simulation/publish, winner payouts).
- [x] Harden error handling and verify that no server secrets or stack traces leak to clients.
