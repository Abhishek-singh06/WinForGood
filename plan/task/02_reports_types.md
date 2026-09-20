# Task 02: Reporting Domain Types & Date Filtering Logic

## Contexto
Define the TypeScript data models and date utility helpers in `src/lib/reports/types.ts` and `src/lib/reports/date-utils.ts`.

## Subtareas
- [x] Define `DateRangeFilter` (`current_month`, `previous_month`, `last_3_months`, `last_6_months`, `last_12_months`, `all_time`) and `DateBounds` (UTC start and end timestamps).
- [x] Implement `getDateRangeBounds(filter: DateRangeFilter)` with clear UTC boundary calculations.
- [x] Define types for `SubscriberGrowthReport`, `DrawHistoryReportItem`, `CharityReportItem`, `FinancialSummaryReport`, and `AdminReportsData`.
- [x] Support integer subunit currency (`pence`) throughout financial types.
