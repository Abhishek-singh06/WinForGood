"use client";

import React, { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { WinnerDetailRecord } from "@/lib/winners/types";
import { submitWinnerProofAction, getWinnerProofSignedUrlAction } from "@/lib/winners/actions";
import { WINNER_PROOF_CONFIG, validateProofFile } from "@/lib/winners/config";
import {
  Trophy,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  ExternalLink,
  Loader2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

interface SubscriberWinningsManagerProps {
  initialWinnings: WinnerDetailRecord[];
}

export function SubscriberWinningsManager({
  initialWinnings,
}: SubscriberWinningsManagerProps) {
  const [winnings, setWinnings] = useState<WinnerDetailRecord[]>(initialWinnings);
  const [isPending, startTransition] = useTransition();
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setActionError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateProofFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });

      if (!validation.isValid) {
        setActionError(validation.error || "Invalid file format or size.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  }

  function handleUploadSubmit(winnerId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setActionError("Please select a scorecard screenshot or PDF document to upload.");
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    const formData = new FormData();
    formData.append("proof", selectedFile);

    startTransition(async () => {
      const res = await submitWinnerProofAction(winnerId, formData);
      if (res.success && res.winner) {
        setWinnings((prev) =>
          prev.map((w) =>
            w.id === winnerId
              ? {
                  ...w,
                  verification_status: "proof_submitted",
                  proof_file_url: res.winner?.proof_file_url || `/uploads/${selectedFile.name}`,
                  submitted_at: res.winner?.submitted_at || new Date().toISOString(),
                  rejection_reason: null,
                }
              : w
          )
        );
        setActionSuccess("Scorecard proof submitted successfully! Administrator verification is underway.");
        setActiveUploadId(null);
        setSelectedFile(null);
      } else {
        setActionError(res.error || "Failed to upload proof.");
      }
    });
  }

  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);

  function handleViewProof(winnerId: string) {
    setLoadingDocId(winnerId);
    startTransition(async () => {
      const res = await getWinnerProofSignedUrlAction(winnerId);
      setLoadingDocId(null);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        setActionError(res.error || "Failed to load private evidence document.");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {actionError && (
        <div className="p-3.5 rounded bg-accent-red-subtle border border-red-800 text-xs text-red-300">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-3.5 rounded bg-accent-blue-subtle border border-blue-800 text-xs text-blue-300">
          {actionSuccess}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase text-text-muted">Total Winning Draws</span>
          <span className="text-2xl font-serif font-bold text-white block">
            {winnings.length}
          </span>
          <span className="text-[11px] text-text-secondary">Across all monthly cycles</span>
        </Card>

        <Card variant="default" className="space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase text-text-muted">Verified &amp; Paid</span>
          <span className="text-2xl font-serif font-bold text-blue-400 block">
            {winnings.filter((w) => w.payout_status === "paid").length}
          </span>
          <span className="text-[11px] text-text-secondary">Disbursed directly</span>
        </Card>

        <Card variant="default" className="space-y-1 border-border-subtle">
          <span className="text-[10px] font-mono uppercase text-text-muted">Action Required</span>
          <span className="text-2xl font-serif font-bold text-yellow-400 block">
            {winnings.filter((w) => w.verification_status === "pending" || w.verification_status === "rejected").length}
          </span>
          <span className="text-[11px] text-text-secondary">Awaiting proof upload</span>
        </Card>
      </div>

      {/* Winnings List */}
      <div className="space-y-6">
        <h2 className="text-lg font-serif font-medium text-white">
          My Winning Draw History (PRD § 09)
        </h2>

        {winnings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border-subtle rounded-md bg-surface-charcoal/40 space-y-3">
            <Trophy className="w-8 h-8 text-text-muted mx-auto" />
            <h3 className="text-base font-medium text-white">No Winning Entries Recorded Yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              When your rolling scores match 3, 4, or 5 numbers in a published monthly draw, your winning card and proof upload action will appear here.
            </p>
          </div>
        ) : (
          winnings.map((winner) => (
            <Card key={winner.id} variant="gradient" className="space-y-4 border-border-subtle">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-surface-charcoal border border-border-subtle flex items-center justify-center font-mono text-xs text-blue-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-serif font-medium text-white block">
                      Cycle Draw #{winner.draw_number}
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {winner.draw_month
                        ? new Date(winner.draw_month).toLocaleDateString("en-GB", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Monthly Draw"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      winner.match_tier === "5_number"
                        ? "red"
                        : winner.match_tier === "4_number"
                        ? "blue"
                        : "charcoal"
                    }
                  >
                    {winner.match_tier.replace("_", " ").toUpperCase()}
                  </Badge>
                  <span className="text-base font-serif font-bold text-white pl-2">
                    {winner.prize_amount !== null ? `£${winner.prize_amount.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>

              {/* Status Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1 p-3 rounded bg-surface-charcoal border border-border-subtle">
                  <span className="text-text-muted block text-[10px] uppercase">
                    Verification State
                  </span>
                  <div className="flex items-center gap-2">
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
                    {winner.verification_status === "approved" && (
                      <span className="text-blue-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded bg-surface-charcoal border border-border-subtle">
                  <span className="text-text-muted block text-[10px] uppercase">
                    Payout Status
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={winner.payout_status === "paid" ? "blue" : "charcoal"}
                    >
                      {winner.payout_status.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] text-text-secondary">
                      {winner.payout_status === "paid"
                        ? "Funds released"
                        : "Pending admin verification approval"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection Notice Banner */}
              {winner.verification_status === "rejected" && (
                <div className="p-3 rounded bg-accent-red-subtle border border-red-800 text-xs text-red-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-red-400 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Evidence Rejected by Administrator</span>
                  </div>
                  <p className="text-xs">
                    Reason: <strong>{winner.rejection_reason || "Scorecard could not be validated."}</strong>
                  </p>
                  <p className="text-[11px] text-red-200">
                    Please upload an updated, clear screenshot of your official golf platform scores below to re-submit.
                  </p>
                </div>
              )}

              {/* Numbers & Match Breakdown (PRD § 06 & § 09) */}
              <div className="p-3.5 rounded bg-surface-charcoal border border-border-subtle space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-text-muted">
                      Winning Draw Numbers
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {winner.winning_numbers && winner.winning_numbers.length > 0 ? (
                        winner.winning_numbers.map((num) => (
                          <span
                            key={num}
                            className="w-7 h-7 rounded-full bg-accent-blue-subtle text-blue-300 font-mono text-xs font-bold flex items-center justify-center border border-blue-600/40"
                          >
                            {num}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono text-text-muted">Numbers pending draw publication</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-text-muted">
                        Your Ticket Numbers
                      </span>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        Matches: {
                          winner.user_numbers?.filter((n) => winner.winning_numbers?.includes(n)).length ||
                          (winner.match_tier === "5_number" ? 5 : winner.match_tier === "4_number" ? 4 : 3)
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {winner.user_numbers && winner.user_numbers.length > 0 ? (
                        winner.user_numbers.map((num) => {
                          const isMatch = winner.winning_numbers?.includes(num);
                          return (
                            <span
                              key={num}
                              className={`w-7 h-7 rounded-full font-mono text-xs font-bold flex items-center justify-center border ${
                                isMatch
                                  ? "bg-accent-gold-subtle text-yellow-300 border-yellow-500/60 shadow-sm"
                                  : "bg-surface-graphite text-text-muted border-border-subtle"
                              }`}
                              title={isMatch ? "Matched winning number!" : "Round score"}
                            >
                              {num}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs font-mono text-text-muted">5 retained round scores entered</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted Proof Inspection */}
              {winner.proof_file_url && (
                <div className="flex items-center justify-between p-3 rounded bg-surface-charcoal border border-border-subtle text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-white">Uploaded Scorecard Proof</span>
                    {winner.submitted_at && (
                      <span className="text-text-muted text-[11px]">
                        ({new Date(winner.submitted_at).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="silver"
                    size="sm"
                    onClick={() => handleViewProof(winner.id)}
                    disabled={loadingDocId === winner.id}
                    className="font-mono text-xs gap-1.5"
                  >
                    {loadingDocId === winner.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    View Evidence Document
                  </Button>
                </div>
              )}

              {/* Proof Upload Area */}
              {(winner.verification_status === "pending" ||
                winner.verification_status === "rejected") && (
                <div className="pt-2">
                  {activeUploadId === winner.id ? (
                    <form
                      onSubmit={(e) => handleUploadSubmit(winner.id, e)}
                      className="p-4 rounded bg-surface-charcoal border border-blue-600/40 space-y-4"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-white block">
                          Upload Official Golf Platform Screenshot (PRD § 09)
                        </span>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          Non-restrictive format: PNG, JPG, WebP, HEIC/HEIF, or PDF up to 20MB. Ensure your player name, round date, and Stableford points are clearly legible.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-dashed border-border-subtle rounded-md text-center bg-surface-graphite space-y-2">
                        <Upload className="w-6 h-6 text-text-muted mx-auto" />
                        <label className="cursor-pointer block">
                          <span className="text-xs font-mono text-blue-400 underline font-medium">
                            {selectedFile ? selectedFile.name : "Select Scorecard Screenshot / Document"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <span className="text-[10px] font-mono text-text-muted block">
                          Max size: {WINNER_PROOF_CONFIG.MAX_FILE_SIZE_MB}MB
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="silver"
                          size="sm"
                          onClick={() => {
                            setActiveUploadId(null);
                            setSelectedFile(null);
                          }}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={isPending || !selectedFile}
                          className="font-mono text-xs gap-1"
                        >
                          {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          Submit for Verification
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="font-mono text-xs gap-1.5"
                      onClick={() => {
                        setActiveUploadId(winner.id);
                        setSelectedFile(null);
                      }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {winner.verification_status === "rejected"
                        ? "Re-Submit Updated Proof"
                        : "Upload Scorecard Proof"}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
