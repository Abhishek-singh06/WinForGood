# Task 03: Reporting Aggregation Engine & Server Actions

## Contexto
Implement the core aggregation logic in `src/lib/reports/service.ts` and server actions in `src/lib/reports/actions.ts`.

## Subtareas
- [x] Implement server-side aggregation for subscriber growth (current snapshot + historical registration trend by month).
- [x] Implement monthly draw history aggregation (participants, winning numbers, tier allocations, winner counts, rollover in/out, lower-tier unclaimed disposition).
- [x] Implement charity contribution aggregation with strict separation between subscription charity funds and lower-tier unclaimed funds.
- [x] Implement financial summary using integer pence subunits and temporary commercial assumptions.
- [x] Enforce server-side admin authorization (`auth.profile.role === 'admin'`).
- [x] Implement in-memory fallback fixtures for deterministic offline execution when live Supabase is not configured.
