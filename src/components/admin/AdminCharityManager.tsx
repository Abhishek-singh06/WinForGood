"use client";

import React, { useState } from "react";
import { CharityRecord } from "@/lib/charities/types";
import {
  adminCreateCharityAction,
  adminUpdateCharityAction,
  adminToggleCharityActiveAction,
  adminToggleCharityFeaturedAction,
} from "@/lib/charities/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Heart,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Star,
  Power,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminCharityManagerProps {
  initialCharities: CharityRecord[];
}

export function AdminCharityManager({ initialCharities }: AdminCharityManagerProps) {
  const router = useRouter();
  const [charities, setCharities] = useState<CharityRecord[]>(initialCharities);
  const [search, setSearch] = useState("");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<CharityRecord | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [mission, setMission] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [logo, setLogo] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setName("");
    setSlug("");
    setCategory("");
    setTagline("");
    setMission("");
    setDescription("");
    setHeroImage("");
    setLogo("");
    setIsActive(true);
    setIsFeatured(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (c: CharityRecord) => {
    setSelectedCharity(c);
    setName(c.name);
    setSlug(c.slug);
    setCategory(c.category);
    setTagline(c.tagline || "");
    setMission(c.mission);
    setDescription(c.description);
    setHeroImage(c.hero_image || "");
    setLogo(c.logo || "");
    setIsActive(c.is_active);
    setIsFeatured(c.is_featured);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("tagline", tagline);
    formData.append("mission", mission);
    formData.append("description", description);
    formData.append("heroImage", heroImage);
    formData.append("logo", logo);
    formData.append("isActive", isActive ? "true" : "false");
    formData.append("isFeatured", isFeatured ? "true" : "false");

    try {
      const res = await adminCreateCharityAction(null, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to create charity.");
      } else {
        setIsCreateOpen(false);
        setSuccessMessage(`Charity "${name}" created successfully.`);
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
    if (!selectedCharity) return;

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("id", selectedCharity.id);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("tagline", tagline);
    formData.append("mission", mission);
    formData.append("description", description);
    formData.append("heroImage", heroImage);
    formData.append("logo", logo);
    formData.append("isActive", isActive ? "true" : "false");
    formData.append("isFeatured", isFeatured ? "true" : "false");

    try {
      const res = await adminUpdateCharityAction(null, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update charity.");
      } else {
        setIsEditOpen(false);
        setSuccessMessage(`Charity "${name}" updated successfully.`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (c: CharityRecord) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminToggleCharityActiveAction(c.id, !c.is_active);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update status.");
      } else {
        setSuccessMessage(`Charity "${c.name}" is now ${!c.is_active ? "ACTIVE" : "INACTIVE"}.`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error toggling active state.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeatured = async (c: CharityRecord) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminToggleCharityFeaturedAction(c.id, !c.is_featured);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update featured state.");
      } else {
        setSuccessMessage(`Charity "${c.name}" featured state updated.`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error toggling featured state.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCharities = charities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
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

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white font-mono text-[11px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search charity records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-sm bg-surface-charcoal border border-border-subtle text-white placeholder:text-text-muted text-xs font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
          />
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          size="sm"
          className="font-mono text-xs uppercase tracking-wider self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Charity
        </Button>
      </div>

      {/* Directory Table / Card List */}
      <div className="space-y-3">
        {filteredCharities.length === 0 ? (
          <Card variant="default" className="text-center py-12">
            <Heart className="w-6 h-6 text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-secondary">No charity records found matching your query.</p>
          </Card>
        ) : (
          filteredCharities.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded bg-surface-charcoal border border-border-subtle hover:border-border-silver transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-serif font-medium text-white">{c.name}</span>
                  <Badge variant={c.is_active ? "blue" : "charcoal"} className="text-[10px]">
                    {c.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                  {c.is_featured && (
                    <Badge variant="red" className="text-[10px]">
                      FEATURED
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-text-muted font-mono flex-wrap">
                  <span>Category: <strong className="text-text-silver font-normal">{c.category}</strong></span>
                  <span>•</span>
                  <span>Slug: <code className="text-blue-400">/{c.slug}</code></span>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 max-w-2xl font-sans">
                  {c.mission}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  onClick={() => handleToggleFeatured(c)}
                  variant="silver"
                  size="sm"
                  className="font-mono text-xs"
                  title={c.is_featured ? "Unfeature" : "Feature"}
                  disabled={isLoading}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      c.is_featured ? "text-blue-400 fill-blue-400" : "text-text-muted"
                    }`}
                  />
                  <span className="hidden lg:inline ml-1">
                    {c.is_featured ? "Featured" : "Feature"}
                  </span>
                </Button>

                <Button
                  onClick={() => handleToggleActive(c)}
                  variant="silver"
                  size="sm"
                  className="font-mono text-xs"
                  title={c.is_active ? "Deactivate" : "Activate"}
                  disabled={isLoading}
                >
                  <Power
                    className={`w-3.5 h-3.5 ${
                      c.is_active ? "text-emerald-400" : "text-red-400"
                    }`}
                  />
                  <span className="hidden lg:inline ml-1">
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </Button>

                <Button
                  onClick={() => handleOpenEdit(c)}
                  variant="primary"
                  size="sm"
                  className="font-mono text-xs"
                  disabled={isLoading}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Charity Record"
        description="PRD § 08 & § 11.03: Add an approved charitable cause to the platform directory."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Charity Name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                );
              }
            }}
            placeholder="e.g. Veterans Forward Project"
            required
          />

          <Input
            label="Unique URL Slug *"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. veterans-forward-project"
            required
          />

          <Input
            label="Primary Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Veteran Support & Mental Health"
            required
          />

          <Input
            label="Tagline / Short Hook"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Brief motto or mission summary"
          />

          <div>
            <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
              Mission Statement *
            </label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={2}
              required
              className="w-full p-2.5 rounded-sm bg-bg-deep border border-border-subtle text-white text-xs placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              placeholder="What is the core purpose of this organization?"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
              Full Narrative Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full p-2.5 rounded-sm bg-bg-deep border border-border-subtle text-white text-xs placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              placeholder="Detailed profile overview and background..."
            />
          </div>

          <Input
            label="Hero Image URL"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-border-silver bg-bg-deep text-blue-500"
              />
              <span>Is Active (Selectable)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border-silver bg-bg-deep text-blue-500"
              />
              <span>Is Featured (Spotlight)</span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="silver"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
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
              Create Charity
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Charity Record"
        description="Update partner charity details and active status."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Charity Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="p-2.5 rounded bg-bg-deep border border-border-subtle text-xs font-mono text-text-muted">
            Slug: <code className="text-white">/{slug}</code> (Permanent identifier)
          </div>

          <Input
            label="Primary Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />

          <div>
            <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
              Mission Statement *
            </label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={2}
              required
              className="w-full p-2.5 rounded-sm bg-bg-deep border border-border-subtle text-white text-xs placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
              Full Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full p-2.5 rounded-sm bg-bg-deep border border-border-subtle text-white text-xs placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
            />
          </div>

          <Input
            label="Hero Image URL"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-border-silver bg-bg-deep text-blue-500"
              />
              <span>Is Active (Selectable)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border-silver bg-bg-deep text-blue-500"
              />
              <span>Is Featured (Spotlight)</span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
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
    </div>
  );
}
