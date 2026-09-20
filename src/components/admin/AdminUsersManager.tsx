"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { AdminUserListItem } from "@/lib/auth/admin-users";
import { Users, Search, Filter, ShieldCheck, Heart, User, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface AdminUsersManagerProps {
  initialUsers: AdminUserListItem[];
}

export function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "subscriber" | "admin">("all");
  const [subFilter, setSubFilter] = useState<"all" | "active" | "past_due" | "canceled" | "none">("all");

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.charityName && u.charityName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesSub = subFilter === "all" || u.subscriptionStatus === subFilter;

      return matchesSearch && matchesRole && matchesSub;
    });
  }, [initialUsers, searchQuery, roleFilter, subFilter]);

  const subscriberCount = initialUsers.filter((u) => u.role === "subscriber").length;
  const adminCount = initialUsers.filter((u) => u.role === "admin").length;
  const activeSubCount = initialUsers.filter((u) => u.subscriptionStatus === "active").length;

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Total Accounts</span>
          <p className="text-2xl font-serif font-bold text-white">{initialUsers.length}</p>
          <span className="text-xs font-mono text-text-secondary">{subscriberCount} subscribers / {adminCount} admins</span>
        </Card>
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Active Paying Members</span>
          <p className="text-2xl font-serif font-bold text-green-400">{activeSubCount}</p>
          <span className="text-xs font-mono text-text-secondary">Current draw eligible cohort</span>
        </Card>
        <Card variant="gradient" className="p-4 space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Charity Designated</span>
          <p className="text-2xl font-serif font-bold text-blue-400">
            {initialUsers.filter((u) => u.charityId).length}
          </p>
          <span className="text-xs font-mono text-text-secondary">&ge; 10% statutory floor active</span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card variant="default" className="p-4 space-y-3 border-border-subtle">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or charity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-charcoal border border-border-subtle rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-border-silver"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-charcoal border border-border-subtle rounded px-2 py-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Role:</span>
              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-surface-charcoal text-white">All Roles</option>
                <option value="subscriber" className="bg-surface-charcoal text-white">Subscribers</option>
                <option value="admin" className="bg-surface-charcoal text-white">Admins</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-surface-charcoal border border-border-subtle rounded px-2 py-1">
              <span className="text-[10px] font-mono uppercase text-text-muted">Subscription:</span>
              <select
                value={subFilter}
                onChange={(e: any) => setSubFilter(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-surface-charcoal text-white">All Statuses</option>
                <option value="active" className="bg-surface-charcoal text-white">Active</option>
                <option value="past_due" className="bg-surface-charcoal text-white">Past Due</option>
                <option value="canceled" className="bg-surface-charcoal text-white">Canceled</option>
                <option value="none" className="bg-surface-charcoal text-white">None</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card variant="default" className="overflow-hidden border-border-subtle p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-charcoal/50 text-[10px] font-mono uppercase text-text-muted">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Charity Preference</th>
                <th className="py-3 px-4">Scores</th>
                <th className="py-3 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs font-mono">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-charcoal/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-text-silver font-bold">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-white font-medium block">{u.fullName}</span>
                          <span className="text-[11px] text-text-muted">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === "admin" ? "red" : "charcoal"}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {u.subscriptionStatus === "active" && (
                            <span className="text-green-400 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                          {u.subscriptionStatus === "past_due" && (
                            <span className="text-yellow-400 font-bold flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" /> PAST DUE
                            </span>
                          )}
                          {u.subscriptionStatus === "canceled" && (
                            <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                              <AlertTriangle className="w-3 h-3" /> CANCELED
                            </span>
                          )}
                          {u.subscriptionStatus === "none" && (
                            <span className="text-text-muted text-[11px]">—</span>
                          )}
                        </div>
                        {u.subscriptionPlan !== "none" && (
                          <span className="text-[10px] text-text-secondary uppercase block">
                            {u.subscriptionPlan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {u.charityName ? (
                        <div>
                          <span className="text-white block truncate max-w-[180px]">{u.charityName}</span>
                          <span className="text-[10px] text-blue-400 font-bold">{u.charityPercentage}% Floor Allocated</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">None Designated</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white">{u.scoresCount} / 5</span>
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
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
