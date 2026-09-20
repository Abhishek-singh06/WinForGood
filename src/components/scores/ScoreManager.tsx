"use client";

import React, { useState } from "react";
import { GolfScore } from "@/lib/scores/types";
import { addScoreAction, editScoreAction, deleteScoreAction } from "@/lib/scores/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  ListOrdered,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ScoreManagerProps {
  initialScores: GolfScore[];
}

export function ScoreManager({ initialScores }: ScoreManagerProps) {
  const router = useRouter();
  const [scores, setScores] = useState<GolfScore[]>(initialScores);

  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<GolfScore | null>(null);

  // Form input fields
  const [scoreInput, setScoreInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Metrics
  const count = scores.length;
  const average = count > 0 ? (scores.reduce((sum, s) => sum + s.score, 0) / count).toFixed(1) : "-";
  const highest = count > 0 ? Math.max(...scores.map((s) => s.score)) : "-";

  const handleOpenAdd = () => {
    setScoreInput("");
    setDateInput(new Date().toISOString().split("T")[0]);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (score: GolfScore) => {
    setSelectedScore(score);
    setScoreInput(score.score.toString());
    setDateInput(score.score_date);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (score: GolfScore) => {
    setSelectedScore(score);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("score", scoreInput);
    formData.append("scoreDate", dateInput);

    try {
      const res = await addScoreAction(null, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to record score.");
      } else {
        setIsAddOpen(false);
        setSuccessMessage("Score successfully recorded. Rolling-five retention updated.");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedScore) return;

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("scoreId", selectedScore.id);
    formData.append("score", scoreInput);
    formData.append("scoreDate", dateInput);

    try {
      const res = await editScoreAction(null, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update score.");
      } else {
        setIsEditOpen(false);
        setSuccessMessage("Score updated. Rolling-five retention re-evaluated.");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedScore) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await deleteScoreAction(selectedScore.id);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete score.");
      } else {
        setIsDeleteOpen(false);
        setSuccessMessage("Score record removed.");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Feedback */}
      {successMessage && (
        <div className="p-3.5 rounded bg-surface-charcoal border border-blue-500/40 text-xs text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-text-muted hover:text-white font-mono text-[11px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="gradient" className="space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Retained Rounds</span>
            <ListOrdered className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-serif font-medium text-white flex items-baseline gap-2">
            <span>{count}</span>
            <span className="text-xs font-sans text-text-secondary font-normal">/ 5 maximum</span>
          </div>
          <p className="text-[11px] text-text-muted font-mono">
            {count < 5 ? `${5 - count} round slots remaining` : "Full rolling active pool"}
          </p>
        </Card>

        <Card variant="gradient" className="space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Average Points</span>
            <TrendingUp className="w-4 h-4 text-text-silver" />
          </div>
          <div className="text-2xl font-serif font-medium text-white">
            {average} <span className="text-xs font-sans text-text-secondary font-normal">pts</span>
          </div>
          <p className="text-[11px] text-text-muted font-mono">Stableford 1–45 scale</p>
        </Card>

        <Card variant="gradient" className="space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Peak Round</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-serif font-medium text-white">
            {highest} <span className="text-xs font-sans text-text-secondary font-normal">pts</span>
          </div>
          <p className="text-[11px] text-text-muted font-mono">Best active card</p>
        </Card>
      </div>

      {/* Rules & Open Decision Callout */}
      <div className="p-4 rounded bg-surface-charcoal border border-border-silver/40 space-y-2">
        <div className="flex items-center gap-2 text-white text-xs font-mono font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>PRD § 05 Rolling-Five Specification</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Only your <strong>latest 5 golf scores</strong> are retained at any time, determined strictly by{" "}
          <strong className="text-white">round date</strong> (newest to oldest). Adding a 6th round
          automatically prunes the oldest round from your pool. Exactly one score is permitted per date.
        </p>
        {count < 5 && (
          <div className="pt-2 border-t border-border-subtle flex items-start gap-2 text-[11px] text-text-muted font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>STATUS: OPEN DECISION</strong> — The PRD does not specify whether fewer than 5 scores
              confers draw eligibility. The system records your actual {count} {count === 1 ? "round" : "rounds"} without assumptions.
            </span>
          </div>
        )}
      </div>

      {/* Actions & List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-serif font-medium text-white">Recorded Scorecards</h2>
          <p className="text-xs text-text-secondary">
            Displayed in reverse chronological order (newest round first).
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="sm"
          className="font-mono text-xs uppercase tracking-wider self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Record Round
        </Button>
      </div>

      {/* Score List / Empty State */}
      {scores.length === 0 ? (
        <Card variant="gradient" className="text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-full bg-surface-graphite border border-border-silver/40 flex items-center justify-center text-blue-400 mx-auto">
            <ListOrdered className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-medium text-white">No Scores Recorded Yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              Enter your official 18-hole Stableford point totals (1 to 45). Your newest 5 rounds will
              form your active profile pool.
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            variant="silver"
            size="sm"
            className="font-mono text-xs uppercase"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Score
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {scores.map((s, idx) => (
            <div
              key={s.id}
              className="p-4 rounded-md bg-surface-charcoal border border-border-subtle hover:border-border-silver transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-bg-deep border border-border-silver flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] text-text-muted uppercase">Rank</span>
                  <span className="text-xs font-bold text-blue-400">#{idx + 1}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold text-white tracking-tight">
                      {s.score}
                    </span>
                    <span className="text-xs font-mono text-text-secondary uppercase">
                      Stableford Points
                    </span>
                    {idx === 0 && (
                      <Badge variant="blue" className="text-[10px]">
                        Latest Round
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                    <Calendar className="w-3.5 h-3.5 text-text-silver" />
                    <span>{s.score_date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  onClick={() => handleOpenEdit(s)}
                  variant="silver"
                  size="sm"
                  className="font-mono text-xs"
                  aria-label={`Edit score of ${s.score} from ${s.score_date}`}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1 text-text-silver" /> Edit
                </Button>

                <Button
                  onClick={() => handleOpenDelete(s)}
                  variant="destructive"
                  size="sm"
                  className="font-mono text-xs"
                  aria-label={`Delete score of ${s.score} from ${s.score_date}`}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Score Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Stableford Round"
        description="PRD § 05: Enter your points (1–45) and official round date."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Stableford Points (1–45)"
            type="number"
            min="1"
            max="45"
            placeholder="e.g. 36"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            required
          />

          <Input
            label="Round Date"
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            required
          />

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="silver"
              size="sm"
              onClick={() => setIsAddOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="font-mono text-xs uppercase"
            >
              Record Score
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Score Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Scorecard"
        description="Modifying the date will re-evaluate the chronological rolling five."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Stableford Points (1–45)"
            type="number"
            min="1"
            max="45"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            required
          />

          <Input
            label="Round Date"
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            required
          />

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="silver"
              size="sm"
              onClick={() => setIsEditOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="font-mono text-xs uppercase"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Scorecard"
        description="Are you sure you wish to delete this score? This action cannot be undone."
      >
        <div className="space-y-4">
          {selectedScore && (
            <div className="p-3.5 rounded bg-bg-deep border border-border-subtle font-mono text-xs space-y-1">
              <div className="text-white font-bold">
                Points: <span className="text-blue-400">{selectedScore.score}</span>
              </div>
              <div className="text-text-muted">Date: {selectedScore.score_date}</div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="silver"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isLoading}
              className="font-mono text-xs uppercase"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
