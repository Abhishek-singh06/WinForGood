"use client";

import React, { useState, useTransition } from "react";
import type { AdminReportsData, DateRangeFilter } from "@/lib/reports/types";
import { getAdminReportsAction } from "@/lib/reports/actions";
import { ReportDateFilter } from "./ReportDateFilter";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { SubscriberGrowthView } from "./SubscriberGrowthView";
import { DrawHistoryReportView } from "./DrawHistoryReportView";
import { CharityReportView } from "./CharityReportView";
import { FinancialSummaryView } from "./FinancialSummaryView";
import { exportDrawHistoryToCSV, exportFinancialSummaryToCSV } from "@/lib/reports/export";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Download,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  BarChart3,
} from "lucide-react";

interface AdminReportsManagerProps {
  initialData: AdminReportsData;
}

export function AdminReportsManager({ initialData }: AdminReportsManagerProps) {
  const [data, setData] = useState<AdminReportsData>(initialData);
  const [filter, setFilter] = useState<DateRangeFilter>(initialData.range);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleFilterChange(newFilter: DateRangeFilter) {
    setFilter(newFilter);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await getAdminReportsAction(newFilter);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMsg(res.error || "Failed to update reporting analytics.");
      }
    });
  }

  function handleRefresh() {
    handleFilterChange(filter);
  }

  return (
    <div className="space-y-8">
      {/* Top Controls: Date Filter & Actions */}
      <div className="space-y-4">
        <ReportDateFilter
          selectedFilter={filter}
          bounds={data.bounds}
          onFilterChange={handleFilterChange}
          disabled={isPending}
        />

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">
              Report Generated:
            </span>
            <span className="text-xs font-mono text-white">
              {new Date(data.generatedAt).toLocaleString()}
            </span>
            {isPending && (
              <span className="flex items-center gap-1 text-blue-400 text-xs font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Aggregating...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="silver"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="font-mono text-xs gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>

            <Button
              variant="silver"
              size="sm"
              onClick={() => exportDrawHistoryToCSV(data.drawHistory)}
              disabled={isPending || data.drawHistory.length === 0}
              className="font-mono text-xs gap-1.5"
            >
              <Download className="w-3 h-3" />
              Export Draws CSV
            </Button>

            <Button
              variant="silver"
              size="sm"
              onClick={() => exportFinancialSummaryToCSV(data.financials, data.bounds)}
              disabled={isPending}
              className="font-mono text-xs gap-1.5"
            >
              <FileSpreadsheet className="w-3 h-3" />
              Export Financials CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-3.5 rounded bg-accent-red-subtle border border-red-800 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <ReportSummaryCards summary={data.summaryCards} />

      {/* Section 1: Subscriber Growth */}
      <SubscriberGrowthView growth={data.subscriberGrowth} />

      {/* Section 2: Monthly Draw History */}
      <DrawHistoryReportView draws={data.drawHistory} />

      {/* Section 3: Charity Reporting */}
      <CharityReportView charities={data.charities} />

      {/* Section 4: Financial Summary */}
      <FinancialSummaryView financials={data.financials} />
    </div>
  );
}
