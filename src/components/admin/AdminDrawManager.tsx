"use client";

import React, { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { DrawRecord, DrawMode } from "@/lib/draws/types";
import {
  createDraftDrawAction,
  stageDrawSimulationAction,
  publishDrawAction,
} from "@/lib/draws/actions";
import {
  Sparkles,
  Play,
  CheckCircle,
  ShieldAlert,
  Loader2,
  Plus,
  Coins,
  HeartHandshake,
  Users,
  Repeat,
  Info,
} from "lucide-react";

interface AdminDrawManagerProps {
  initialDraws: DrawRecord[];
}

export function AdminDrawManager({ initialDraws }: AdminDrawManagerProps) {
  const [draws, setDraws] = useState<DrawRecord[]>(initialDraws);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMode, setSelectedMode] = useState<DrawMode>("random");
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null);

  function handleCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    const formData = new FormData();
    formData.set("month", selectedMonth);
    formData.set("mode", selectedMode);

    startTransition(async () => {
      const res = await createDraftDrawAction(null, formData);
      if (res.success && res.draw) {
        setDraws((prev) => [res.draw!, ...prev]);
        setShowCreateModal(false);
        setActionSuccess(`Created draft draw cycle for ${selectedMonth}.`);
      } else {
        setActionError(res.error || "Failed to create draft draw.");
      }
    });
  }

  function handleStageSimulation(drawId: string) {
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await stageDrawSimulationAction(drawId);
      if (res.success && res.draw) {
        setDraws((prev) =>
          prev.map((d) => (d.id === drawId ? res.draw! : d))
        );
        setActionSuccess("Draw simulation executed successfully with temporary PO parameters.");
      } else {
        setActionError(res.error || "Failed to stage simulation.");
      }
    });
  }

  function handleConfirmPublish() {
    if (!publishTargetId) return;

    setActionError(null);
    setActionSuccess(null);
    const targetId = publishTargetId;
    setPublishTargetId(null);

    startTransition(async () => {
      const res = await publishDrawAction(targetId);
      if (res.success && res.draw) {
        setDraws((prev) =>
          prev.map((d) => (d.id === targetId ? res.draw! : d))
        );
        setActionSuccess("Draw published successfully. Immutability trigger engaged.");
      } else {
        setActionError(res.error || "Failed to publish draw.");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Temporary Assumptions Disclaimer Banner */}
      <div className="p-4 rounded-lg bg-surface-charcoal border border-blue-900/40 space-y-2">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase">
          <Info className="w-4 h-4 shrink-0" />
          <span>Temporary Product Owner Assumptions Active (TA-001 — TA-006)</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Operating under temporary implementation parameters: <strong>30% Gross Pool</strong> (TA-001),{" "}
          <strong>Model B Dynamic Partial Tickets</strong> (TA-002), <strong>GBP Currency</strong> (TA-003),{" "}
          <strong>£10/mo & £100/yr Pricing</strong> (TA-004/005), and{" "}
          <strong>Charity Disposition for Unclaimed 3/4 Tiers</strong> (TA-006). All parameters are strictly isolated in configuration.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-medium text-white">
            Monthly Draw Operations
          </h2>
          <p className="text-xs text-text-muted">
            Configure monthly cycles, run random or algorithmic simulations, and publish immutable results.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="font-mono text-xs gap-1.5"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-3.5 h-3.5" /> New Draw Cycle
        </Button>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 rounded bg-accent-red-subtle border border-red-800 text-xs text-red-300">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 rounded bg-accent-blue-subtle border border-blue-800 text-xs text-blue-300">
          {actionSuccess}
        </div>
      )}

      {/* Statutory Match Tiers Card (§ 07) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default" className="space-y-2 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 1</span>
            <Badge variant="red">40% Share</Badge>
          </div>
          <span className="text-base font-serif text-white font-medium block">5-Number Match</span>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Jackpot rollover: <strong className="text-red-400">YES</strong>. If unclaimed, rolls over to next month.
          </p>
        </Card>

        <Card variant="default" className="space-y-2 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 2</span>
            <Badge variant="charcoal">35% Share</Badge>
          </div>
          <span className="text-base font-serif text-white font-medium block">4-Number Match</span>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Rollover: <span className="text-text-muted">NO</span>. If unclaimed, assigned to vetted charity pool (TA-006).
          </p>
        </Card>

        <Card variant="default" className="space-y-2 border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted">Tier 3</span>
            <Badge variant="charcoal">25% Share</Badge>
          </div>
          <span className="text-base font-serif text-white font-medium block">3-Number Match</span>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Rollover: <span className="text-text-muted">NO</span>. If unclaimed, assigned to vetted charity pool (TA-006).
          </p>
        </Card>
      </div>

      {/* Draws List */}
      <div className="space-y-4">
        {draws.length === 0 ? (
          <Card variant="default" className="text-center py-12 space-y-3">
            <Sparkles className="w-8 h-8 text-text-muted mx-auto" />
            <span className="text-sm font-serif text-white block">No Draw Cycles Initialized</span>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Create a new monthly draw cycle above to stage simulations and review lifecycle states.
            </p>
          </Card>
        ) : (
          draws.map((draw) => (
            <Card key={draw.id} variant="gradient" className="space-y-5 border-border-subtle">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-charcoal border border-border-subtle flex items-center justify-center font-mono text-xs text-white">
                    #{draw.draw_number}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">
                      Cycle: {new Date(draw.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">
                      Mode: {draw.draw_mode.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      draw.status === "published"
                        ? "blue"
                        : draw.status === "simulated"
                        ? "silver"
                        : "charcoal"
                    }
                  >
                    {draw.status.toUpperCase()}
                  </Badge>

                  {(draw.status === "draft" || draw.status === "simulated") && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="font-mono text-xs gap-1"
                      onClick={() => handleStageSimulation(draw.id)}
                      disabled={isPending}
                    >
                      <Play className="w-3 h-3" /> {draw.status === "simulated" ? "Re-Simulate" : "Simulate"}
                    </Button>
                  )}

                  {draw.status === "simulated" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="font-mono text-xs gap-1"
                      onClick={() => setPublishTargetId(draw.id)}
                      disabled={isPending}
                    >
                      <CheckCircle className="w-3 h-3" /> Publish Authoritative
                    </Button>
                  )}
                </div>
              </div>

              {/* Winning Numbers Lottery Balls */}
              {draw.winning_numbers && draw.winning_numbers.length > 0 && (
                <div className="p-3.5 rounded bg-surface-charcoal/80 border border-border-subtle space-y-2">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                    Winning Numbers ({draw.draw_mode} draw)
                  </span>
                  <div className="flex items-center gap-2.5">
                    {draw.winning_numbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-9 h-9 rounded-full bg-gradient-to-b from-surface-silver/20 to-surface-charcoal border border-border-silver/60 flex items-center justify-center font-mono font-bold text-white text-sm shadow-inner"
                      >
                        {String(num).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-text-muted block text-[10px] uppercase flex items-center gap-1">
                    <Users className="w-3 h-3" /> Subscribers
                  </span>
                  <span className="text-white font-medium">
                    {draw.total_subscribers_snapshot !== null ? `${draw.total_subscribers_snapshot} Active` : "Pending"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-text-muted block text-[10px] uppercase flex items-center gap-1">
                    <Coins className="w-3 h-3" /> Prize Pool
                  </span>
                  <span className="text-white font-medium">
                    {draw.total_prize_pool !== null ? `£${Number(draw.total_prize_pool).toFixed(2)}` : "Pending"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-text-muted block text-[10px] uppercase flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Rollover Out
                  </span>
                  <span className="text-white font-medium">
                    £{Number(draw.jackpot_rollover_out || 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-text-muted block text-[10px] uppercase flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3" /> Mode
                  </span>
                  <span className="text-white font-medium capitalize">
                    {draw.draw_mode}
                  </span>
                </div>
              </div>

              {/* Status Specific Notices */}
              {draw.status === "simulated" && (
                <div className="p-2.5 rounded bg-surface-charcoal border border-yellow-700/40 text-[11px] font-mono text-yellow-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
                  <span>SIMULATION STAGE — Results staged for inspection. Not visible to subscribers until published.</span>
                </div>
              )}

              {draw.status === "published" && (
                <div className="p-2.5 rounded bg-surface-charcoal border border-blue-900/50 flex items-center gap-2 text-xs font-mono text-blue-300">
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Immutable Record. Publication locked against database modifications.</span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="gradient" className="max-w-md w-full p-6 space-y-4 border-border-silver">
            <h3 className="text-lg font-serif font-medium text-white">
              Initialize Monthly Draw Cycle
            </h3>
            <p className="text-xs text-text-secondary">
              Configure cycle parameters. The draw begins in DRAFT state.
            </p>

            <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-mono text-text-muted uppercase text-[10px]">
                  Cycle Month (YYYY-MM-01)
                </label>
                <Input
                  type="date"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-text-muted uppercase text-[10px]">
                  Draw Mode (PRD § 06)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("random")}
                    className={`flex-1 p-2 rounded border font-mono text-xs ${
                      selectedMode === "random"
                        ? "bg-accent-blue-subtle text-blue-400 border-blue-600 font-bold"
                        : "bg-surface-charcoal text-text-secondary border-border-subtle"
                    }`}
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode("algorithmic")}
                    className={`flex-1 p-2 rounded border font-mono text-xs ${
                      selectedMode === "algorithmic"
                        ? "bg-accent-blue-subtle text-blue-400 border-blue-600 font-bold"
                        : "bg-surface-charcoal text-text-secondary border-border-subtle"
                    }`}
                  >
                    Algorithmic
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="silver"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Draft"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Confirmation Modal for Publishing */}
      {publishTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="gradient" className="max-w-md w-full p-6 space-y-4 border-red-900/60">
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Confirm Draw Publication</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to publish this draw? Once published:
            </p>
            <ul className="text-xs text-text-secondary list-disc pl-5 space-y-1 font-mono">
              <li>Winning numbers and prize distributions become <strong>immutable</strong>.</li>
              <li>Winner payout records will be provisioned in the ledger.</li>
              <li>Results will be made immediately visible to subscribers.</li>
            </ul>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="silver"
                size="sm"
                onClick={() => setPublishTargetId(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmPublish}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm & Lock Publication"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
