# Task 01: System Integration & Gap Audit

## Contexto
Trace each of the 6 major user journeys through UI -> server action -> authorization -> database -> business logic -> resulting UI state. Identify broken links or disconnected surfaces.

## Subtareas
- [x] Audit Journey 1: Public visitor -> signup -> charity selection -> subscription -> dashboard.
- [x] Audit Journey 2: Subscriber -> score entry -> score editing/deletion -> rolling-five behavior -> draw participation.
- [x] Audit Journey 3: Subscriber -> upcoming draw -> published draw -> winning result -> winnings.
- [x] Audit Journey 4: Winner -> submit proof -> admin review -> approve/reject -> resubmission -> mark paid.
- [x] Audit Journey 5: Administrator -> manage users -> manage charities -> manage draws -> publish draw -> verify winners -> reporting.
- [x] Audit Journey 6: Subscription lifecycle -> active -> cancel-at-period-end -> renewal/payment success -> payment failure -> lapsed access.
- [x] Consolidate the system integration matrix and identify gaps (e.g. `/admin/users` and `/admin/subscriptions` shells).
