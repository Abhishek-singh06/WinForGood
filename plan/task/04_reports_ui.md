# Task 04: Admin Reporting Dashboard UI (`/admin/reports`)

## Contexto
Implement the UI components in `src/components/admin/reports/` and wire `/admin/reports/page.tsx`.

## Subtareas
- [x] Create `ReportDateFilter` component with 6 range tabs.
- [x] Create `ReportSummaryCards` component (Total Subscribers, Active Subscribers, Total Prize Pool, Paid Winnings).
- [x] Create `SubscriberGrowthView` with trend chart/bars and tabular monthly breakdown.
- [x] Create `DrawHistoryReportView` with detailed draw table, ball pills, allocations, and winner counts.
- [x] Create `CharityReportView` displaying vetted charities and distinct columns for subscription vs unclaimed prize contributions.
- [x] Create `FinancialSummaryView` with integer-subunit currency formatting, explicit GBP, and temporary assumption badges.
- [x] Create `AdminReportsManager` orchestrating all views, handling loading, empty, and error states.
- [x] Update `src/app/admin/reports/page.tsx` with server-side admin check.
