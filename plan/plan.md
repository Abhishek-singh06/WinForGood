# Phase 8 — End-to-End User Journeys, System Integration & Production Hardening

## Instrucciones de bucle (ralph)

Cada iteración ejecuta **una sola** acción y termina. No encadenes tareas.

1. **Localizar la siguiente subtarea**:
   - Recorre `plan.md` de arriba a abajo y encuentra el primer `[ ]`.
   - Si la línea enlaza a un fichero `task/NN.md`, abre el fichero y repite la búsqueda recursivamente dentro de él hasta llegar a una subtarea `[ ]` hoja (sin enlace).
   - Si no encuentras ningún `[ ]` en ninguna parte → **crea `plan/stop.md`** con una nota breve ("plan completo, sin subtareas pendientes") y **para**.
2. **Ejecutar esa única subtarea**:
   - Subtarea normal: realízala y márcala `[x]`.
3. **Propagar hacia arriba**:
   - Tras marcar una subtarea, si **todas** las subtareas del `task/NN.md` están `[x]`, marca también la entrada correspondiente en `plan.md` como `[x]`.
4. **Parar**. No busques la siguiente subtarea, no encadenes iteraciones.

## Objetivo

Validate and harden the complete system across all 6 core user journeys:
1. Public visitor → signup → charity selection → subscription → dashboard
2. Subscriber → score entry → score editing/deletion → rolling-five behavior → draw participation
3. Subscriber → upcoming draw → published draw → winning result → winnings
4. Winner → submit proof → admin review → approve/reject → resubmission → mark paid
5. Administrator → manage users → manage charities → manage draws → publish draw → verify winners → reporting
6. Subscription lifecycle → active → cancel-at-period-end → renewal/payment success → payment failure → lapsed access

Close remaining integration gaps (e.g. `/admin/users` and `/admin/subscriptions` admin management views), verify RLS, state machines, idempotency, accessibility, performance, and add deterministic integration tests without fabricating cloud credentials.

## Tareas

- [x] [Task 01: System Integration & Gap Audit](task/01_system_integration_audit.md)
- [x] [Task 02: Admin User & Subscription Management Hardening](task/02_admin_surfaces_hardening.md)
- [x] [Task 03: Security, Idempotency & State Machine Hardening](task/03_security_state_hardening.md)
- [x] [Task 04: UI/UX, Accessibility & Performance Hardening](task/04_ui_a11y_perf_hardening.md)
- [x] [Task 05: Production Configuration & Boundary Audit](task/05_prod_config_audit.md)
- [x] [Task 06: End-to-End Integration Test Suite](task/06_e2e_integration_tests.md)
- [x] [Task 07: Quality Gate & Full Documentation Sync](task/07_phase8_quality_gate.md)
