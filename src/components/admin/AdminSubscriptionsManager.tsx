"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AdminSubscriptionItem } from "@/lib/subscriptions/admin-subscriptions";
import { CreditCard, Search, CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

interface AdminSubscriptionsManagerProps {
  initialSubscriptions: AdminSubscriptionItem[];
}

export function AdminSubscriptionsManager({ initialSubscriptions }: AdminSubscriptionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const filteredSubscriptions = useMemo(() => {
    return initialSubscriptions.filter((s) => {
      const matchesSearch =
        s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.stripeSubscriptionId && s.stripeSubscriptionId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesPlan = planFilter === "all" || s.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [initialSubscriptions, searchQuery, statusFilter, planFilter]);

  const activeCount = initialSubscriptions.filter((s) => s.status === "active").length;
  const monthlyCount = initialSubscriptions.filter((s) => s.plan === "monthly").length;
  const yearlyCount = initialSubscriptions.filter((s) => s.plan === "yearly").length;
  const pastDueCount = initialSubscriptions.filter((s) => s.status === "past_due").length;

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Total Subscriptions</span>
          <p className="text-2xl font-serif font-bold text-white">{initialSubscriptions.length}</p>
          <span className="text-xs font-mono text-text-secondary">{monthlyCount} monthly / {yearlyCount} yearly</span>
        </Card>
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Active In Good Standing</span>
          <p className="text-2xl font-serif font-bold text-green-400">{activeCount}</p>
          <span className="text-xs font-mono text-text-secondary">Current draw eligible</span>
        </Card>
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Past Due Grace</span>
          <p className="text-2xl font-serif font-bold text-yellow-400">{pastDueCount}</p>
          <span className="text-xs font-mono text-text-secondary">7-day grace period active</span>
        </Card>
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Canceled / Lapsed</span>
          <p className="text-2xl font-serif font-bold text-red-400">
            {initialSubscriptions.filter((s) => s.status === "canceled").length}
          </p>
          <span className="text-xs font-mono text-text-secondary">Access removed</span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card variant="default" className="p-4 space-y-3 border-border-subtle">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search by subscriber name, email, or Stripe ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-charcoal border border-border-subtle rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-border-silver"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-charcoal border border-border-subtle rounded px-2 py-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-surface-charcoal text-white">All Statuses</option>
                <option value="active" className="bg-surface-charcoal text-white">Active</option>
                <option value="past_due" className="bg-surface-charcoal text-white">Past Due</option>
                <option value="canceled" className="bg-surface-charcoal text-white">Canceled</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-surface-charcoal border border-border-subtle rounded px-2 py-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Plan:</span>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-surface-charcoal text-white">All Plans</option>
                <option value="monthly" className="bg-surface-charcoal text-white">Monthly (£10)</option>
                <option value="yearly" className="bg-surface-charcoal text-white">Yearly (£100)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card variant="default" className="overflow-hidden border-border-subtle p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-charcoal/50 text-[10px] font-mono uppercase text-text-muted">
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Renewal / Expiry</th>
                <th className="py-3 px-4">Stripe Reference</th>
                <th className="py-3 px-4 text-right">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs font-mono">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No subscriptions matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-charcoal/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-white font-medium block">{s.userName}</span>
                        <span className="text-[11px] text-text-muted">{s.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="charcoal" className="uppercase text-[10px]">
                        {s.plan === "yearly" ? "Yearly (£100)" : "Monthly (£10)"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {s.status === "active" && (
                          <span className="text-green-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                        {s.status === "past_due" && (
                          <span className="text-yellow-400 font-bold flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3" /> PAST DUE
                          </span>
                        )}
                        {s.status === "canceled" && (
                          <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3 h-3" /> CANCELED
                          </span>
                        )}
                        {s.cancelAtPeriodEnd && (
                          <span className="text-[10px] text-yellow-500 block">
                            (Will cancel at period end)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-[11px]">
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                      {s.stripeSubscriptionId || "offline_fixture"}
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
