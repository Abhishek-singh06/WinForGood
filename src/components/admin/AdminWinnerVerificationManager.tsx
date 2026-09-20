"use client";

import React, { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { WinnerDetailRecord } from "@/lib/winners/types";
import {
  approveWinnerVerificationAction,
  rejectWinnerVerificationAction,
  markWinnerPayoutAction,
  getWinnerProofSignedUrlAction,
} from "@/lib/winners/actions";
import {
  Trophy,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Eye,
  AlertTriangle,
  Loader2,
  DollarSign,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";

interface AdminWinnerVerificationManagerProps {
  initialWinners: WinnerDetailRecord[];
}

export function AdminWinnerVerificationManager({
  initialWinners,
}: AdminWinnerVerificationManagerProps) {
  const [winners, setWinners] = useState<WinnerDetailRecord[]>(initialWinners);
  const [isPending, startTransition] = useTransition();
  const [selectedWinner, setSelectedWinner] = useState<WinnerDetailRecord | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  function openReview(winner: WinnerDetailRecord) {
    setSelectedWinner(winner);
    setRejectionReason(winner.rejection_reason || "");
    setActionError(null);
    setActionSuccess(null);
    setReviewModalOpen(true);
  }

  function handleApprove(winnerId: string) {
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await approveWinnerVerificationAction(winnerId);
      if (res.success && res.winner) {
        setWinners((prev) =>
          prev.map((w) =>
            w.id === winnerId
              ? {
                  ...w,
                  verification_status: "approved",
                  rejection_reason: null,
                  reviewed_at: res.winner?.reviewed_at || new Date().toISOString(),
                }
              : w
          )
        );
        setActionSuccess("Winner evidence approved successfully. Payout may now progress.");
        setReviewModalOpen(false);
      } else {
        setActionError(res.error || "Failed to approve verification.");
      }
    });
  }

  function handleReject(winnerId: string) {
    if (!rejectionReason.trim()) {
      setActionError("A clear rejection reason must be provided.");
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await rejectWinnerVerificationAction(winnerId, rejectionReason);
      if (res.success && res.winner) {
        setWinners((prev) =>
          prev.map((w) =>
            w.id === winnerId
              ? {
                  ...w,
                  verification_status: "rejected",
                  rejection_reason: rejectionReason,
                  reviewed_at: res.winner?.reviewed_at || new Date().toISOString(),
                }
              : w
          )
        );
        setActionSuccess("Winner evidence rejected with reason recorded.");
        setReviewModalOpen(false);
      } else {
        setActionError(res.error || "Failed to reject verification.");
      }
    });
  }

  function handlePayout(winnerId: string) {
    if (!confirm("Confirm marking prize payout as COMPLETED for this verified winner?")) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await markWinnerPayoutAction(winnerId);
      if (res.success && res.winner) {
        setWinners((prev) =>
          prev.map((w) =>
            w.id === winnerId
              ? { ...w, payout_status: "paid", updated_at: new Date().toISOString() }
              : w
          )
        );
        setActionSuccess("Payout recorded as completed.");
      } else {
        setActionError(res.error || "Failed to progress payout.");
      }
    });
  }

  const [loadingDoc, setLoadingDoc] = useState(false);

  function handleViewDocument(winnerId: string) {
    setLoadingDoc(true);
    startTransition(async () => {
      const res = await getWinnerProofSignedUrlAction(winnerId);
      setLoadingDoc(false);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        setActionError(res.error || "Failed to generate signed access to evidence document.");
      }
    });
  }

  const filteredWinners = winners.filter((w) => {
    if (filterStatus !== "all") {
      if (filterStatus === "pending_review" && w.verification_status !== "proof_submitted") {
        return false;
      }
      if (filterStatus === "approved" && w.verification_status !== "approved") {
        return false;
      }
      if (filterStatus === "rejected" && w.verification_status !== "rejected") {
        return false;
      }
      if (filterStatus === "paid" && w.payout_status !== "paid") {
        return false;
      }
      if (filterStatus === "pending_proof" && w.verification_status !== "pending") {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.winner_name.toLowerCase().includes(q) ||
        w.winner_email.toLowerCase().includes(q) ||
        String(w.draw_number).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
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

      {/* Control Surface Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-surface-charcoal border border-border-subtle text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <Input
            placeholder="Search by winner name, email, or draw..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-surface-graphite"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          {[
            { id: "all", label: "All" },
            { id: "pending_review", label: "Needs Review" },
            { id: "pending_proof", label: "Awaiting Proof" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "paid", label: "Paid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-2.5 py-1 rounded font-mono text-[11px] whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? "bg-accent-blue-subtle text-blue-400 font-bold border border-blue-600/60"
                  : "bg-surface-graphite text-text-secondary hover:text-white border border-border-subtle"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Winners Ledger Table */}
      <Card variant="gradient" className="p-0 overflow-hidden border-border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-charcoal/90 text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
              <tr>
                <th className="p-4">Winner</th>
                <th className="p-4">Draw Cycle</th>
                <th className="p-4">Tier &amp; Prize</th>
                <th className="p-4">Evidence</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Payout State</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-text-secondary">
              {filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted">
                    No winner records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredWinners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-surface-charcoal/40 transition-colors">
                    {/* Winner details */}
                    <td className="p-4">
                      <div className="font-sans font-medium text-white block">
                        {winner.winner_name}
                      </div>
                      <span className="text-[11px] text-text-muted block">
                        {winner.winner_email}
                      </span>
                    </td>

                    {/* Draw details */}
                    <td className="p-4">
                      <span className="text-white font-medium block">
                        Draw #{winner.draw_number}
                      </span>
                      <span className="text-[11px] text-text-muted block">
                        {winner.draw_month
                          ? new Date(winner.draw_month).toLocaleDateString("en-GB", {
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </td>

                    {/* Tier & Prize */}
                    <td className="p-4">
                      <Badge
                        variant={
                          winner.match_tier === "5_number"
                            ? "red"
                            : winner.match_tier === "4_number"
                            ? "blue"
                            : "charcoal"
                        }
                      >
                        {winner.match_tier.replace("_", " ")}
                      </Badge>
                      <span className="text-white font-bold block pt-1">
                        {winner.prize_amount !== null ? `£${winner.prize_amount.toFixed(2)}` : "—"}
                      </span>
                    </td>

                    {/* Submitted Evidence */}
                    <td className="p-4">
                      {winner.proof_file_url ? (
                        <div className="space-y-1">
                          <button
                            onClick={() => openReview(winner)}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold underline"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> Inspect Proof
                          </button>
                          {winner.submitted_at && (
                            <span className="text-[10px] text-text-muted block">
                              Uploaded: {new Date(winner.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-muted text-[11px] italic">
                          Not uploaded yet
                        </span>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="p-4">
                      <Badge
                        variant={
                          winner.verification_status === "approved"
                            ? "blue"
                            : winner.verification_status === "proof_submitted"
                            ? "silver"
                            : winner.verification_status === "rejected"
                            ? "red"
                            : "charcoal"
                        }
                      >
                        {winner.verification_status.toUpperCase()}
                      </Badge>

                      {winner.verification_status === "rejected" && winner.rejection_reason && (
                        <span className="text-[10px] text-red-400 block pt-1 line-clamp-1" title={winner.rejection_reason}>
                          Reason: {winner.rejection_reason}
                        </span>
                      )}
                      {winner.reviewed_at && (
                        <span className="text-[10px] text-text-muted block pt-0.5">
                          Reviewed: {new Date(winner.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    {/* Payout Status */}
                    <td className="p-4">
                      <Badge
                        variant={winner.payout_status === "paid" ? "blue" : "charcoal"}
                      >
                        {winner.payout_status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      {winner.proof_file_url && (
                        <Button
                          variant="silver"
                          size="sm"
                          className="font-mono text-[11px] h-7 px-2"
                          onClick={() => openReview(winner)}
                        >
                          Review
                        </Button>
                      )}

                      {winner.payout_status !== "paid" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-mono text-[11px] h-7 px-2"
                          disabled={winner.verification_status !== "approved" || isPending}
                          title={
                            winner.verification_status !== "approved"
                              ? "Payout cannot progress until verification is approved"
                              : "Mark prize as paid"
                          }
                          onClick={() => handlePayout(winner.id)}
                        >
                          {winner.verification_status !== "approved" ? "Locked" : "Mark Paid"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review & Verification Studio Modal */}
      {reviewModalOpen && selectedWinner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <Card
            variant="gradient"
            className="max-w-2xl w-full p-6 space-y-5 border-border-silver max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block">
                  Winner Evidence Review Studio
                </span>
                <h3 className="text-lg font-serif font-medium text-white">
                  {selectedWinner.winner_name} — Draw #{selectedWinner.draw_number}
                </h3>
              </div>
              <Badge variant="blue">{selectedWinner.match_tier.replace("_", " ")}</Badge>
            </div>

            {/* Evidence Preview Container */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-text-muted uppercase block">
                Submitted Scorecard Evidence:
              </span>
              <div className="p-4 rounded bg-surface-charcoal border border-border-subtle flex flex-col items-center justify-center min-h-[160px] space-y-2">
                <FileCheck className="w-10 h-10 text-blue-400" />
                <span className="text-xs font-mono text-white font-medium">
                  {selectedWinner.proof_file_url?.split("/").pop()}
                </span>
                <span className="text-[10px] text-text-muted">
                  Submission Timestamp: {selectedWinner.submitted_at ? new Date(selectedWinner.submitted_at).toLocaleString() : "Not recorded"}
                </span>
                {selectedWinner.proof_file_url && (
                  <Button
                    type="button"
                    variant="silver"
                    size="sm"
                    onClick={() => handleViewDocument(selectedWinner.id)}
                    disabled={loadingDoc || isPending}
                    className="font-mono text-xs gap-1.5 mt-1"
                  >
                    {loadingDoc ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    Open Private Evidence Document
                  </Button>
                )}
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div className="space-y-1">
              <label className="font-mono text-text-muted uppercase text-[10px] block">
                Rejection Reason (Mandatory if rejecting submission):
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State clearly why this scorecard proof was rejected (e.g. illegible round date, score mismatch, wrong golf course)..."
                className="w-full rounded bg-surface-graphite border border-border-subtle p-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border-subtle">
              <Button
                variant="silver"
                size="sm"
                onClick={() => setReviewModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-accent-red-subtle border-red-800 text-red-300 hover:bg-red-950 font-mono text-xs gap-1"
                  onClick={() => handleReject(selectedWinner.id)}
                  disabled={isPending}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Evidence
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="font-mono text-xs gap-1"
                  onClick={() => handleApprove(selectedWinner.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve Evidence
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
