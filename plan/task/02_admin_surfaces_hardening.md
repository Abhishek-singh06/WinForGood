# Task 02: Admin User & Subscription Management Hardening

## Contexto
Turn `/admin/users` and `/admin/subscriptions` into fully functional surfaces backed by server actions and deterministic fallbacks, and connect the `/admin` overview cards.

## Subtareas
- [x] Implement administrative user query service and server actions in `src/lib/auth/admin-users.ts` (with search, filter, and role inspection).
- [x] Build `/admin/users` UI (`src/app/admin/users/page.tsx` & `src/components/admin/AdminUsersManager.tsx`) showing users list, status, and charity designation.
- [x] Implement administrative subscription query service and server actions in `src/lib/subscriptions/admin-subscriptions.ts`.
- [x] Build `/admin/subscriptions` UI (`src/app/admin/subscriptions/page.tsx` & `src/components/admin/AdminSubscriptionsManager.tsx`) showing subscription statuses, plans, renewal dates, and status filtering.
- [x] Update `/admin/page.tsx` (Operations Command Center) to provide direct clickable links to all 5 control surfaces.
- [x] Update `/admin/layout.tsx` operational status note.
