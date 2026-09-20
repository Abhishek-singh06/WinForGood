"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CharityRecord } from "@/lib/charities/types";
import { Search, Heart, Calendar, ArrowRight, CheckCircle, Star, Ban } from "lucide-react";

interface CharityDirectoryProps {
  initialCharities: CharityRecord[];
}

export function CharityDirectory({ initialCharities }: CharityDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [donationCharity, setDonationCharity] = useState<CharityRecord | null>(null);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationAmount, setDonationAmount] = useState("50");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(initialCharities.map((c) => c.category)))];
  }, [initialCharities]);

  const filteredCharities = useMemo(() => {
    return initialCharities.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.mission.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialCharities, searchQuery, selectedCategory]);

  return (
    <div className="py-16 sm:py-24 bg-bg-deep space-y-16">
      {/* Header */}
      <Container size="wide">
        <div className="max-w-3xl space-y-4">
          <Badge variant="blue">Partner Directory</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-white tracking-tight">
            Vetted Causes That Drive Impact.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Every Digital Heroes subscriber selects a partner charity to receive at least 10% of their
            membership fees. Explore our partners, discover upcoming golf days, or make a direct donation.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search causes, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-sm bg-surface-charcoal border border-border-subtle text-white placeholder:text-text-muted text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                  selectedCategory === cat
                    ? "bg-accent-blue-subtle text-blue-400 border border-blue-500 font-bold"
                    : "bg-surface-charcoal text-text-secondary border border-border-subtle hover:border-border-silver"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* Directory Grid */}
      <Container size="wide">
        {filteredCharities.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-subtle rounded p-8 space-y-3">
            <Heart className="w-8 h-8 text-text-muted mx-auto" />
            <h3 className="text-lg font-medium text-white">No charities found</h3>
            <p className="text-xs text-text-secondary">
              Try adjusting your search terms or clearing the selected category filter.
            </p>
            <Button
              variant="silver"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharities.map((charity) => (
              <Card
                key={charity.id}
                variant="gradient"
                className={`flex flex-col justify-between p-0 overflow-hidden group hover:border-border-silver transition-colors ${
                  !charity.is_active ? "opacity-75 border-border-subtle/50" : ""
                }`}
              >
                {/* Media Image */}
                <div className="relative h-48 w-full bg-surface-graphite overflow-hidden">
                  {charity.hero_image ? (
                    <Image
                      src={charity.hero_image}
                      alt={charity.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-charcoal text-text-muted font-mono text-xs">
                      No image available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-charcoal via-transparent to-transparent opacity-80" />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="charcoal">{charity.category}</Badge>
                    {charity.is_featured && (
                      <Badge variant="red" className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </Badge>
                    )}
                    {!charity.is_active && (
                      <Badge variant="charcoal" className="border-red-500/50 text-red-400">
                        <Ban className="w-2.5 h-2.5 mr-1" /> Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Link href={`/charities/${charity.slug}`}>
                      <h3 className="text-xl font-serif font-medium text-white hover:text-text-silver transition-colors">
                        {charity.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-3 leading-relaxed">
                      {charity.mission}
                    </p>
                  </div>

                  {/* Impact Stats */}
                  {charity.impact_metrics && charity.impact_metrics.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle text-center">
                      {charity.impact_metrics.slice(0, 3).map((m, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-xs font-mono font-bold text-white block">
                            {m.value}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted block leading-tight">
                            {m.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming Event */}
                  {charity.events && charity.events.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-mono text-text-secondary bg-surface-graphite/40 p-2.5 rounded border border-border-subtle">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{charity.events[0].title}</span>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="pt-2 flex items-center gap-3">
                    <Link href={`/charities/${charity.slug}`} className="flex-1">
                      <Button variant="silver" size="sm" className="w-full font-mono text-xs uppercase">
                        View Profile
                      </Button>
                    </Link>
                    {charity.is_active ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setDonationCharity(charity);
                          setDonationSuccess(false);
                        }}
                        className="font-mono text-xs uppercase"
                      >
                        Donate
                      </Button>
                    ) : (
                      <span className="text-[10px] font-mono text-text-muted uppercase px-2">
                        Archived
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* Direct Donation Modal */}
      <Modal
        isOpen={!!donationCharity}
        onClose={() => setDonationCharity(null)}
        title={donationCharity ? `Direct Donation to ${donationCharity.name}` : "Direct Donation"}
        description="Independent donation option, not tied to gameplay (PRD § 08.1)."
      >
        {donationSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-10 h-10 text-blue-400 mx-auto" />
            <h4 className="text-lg font-serif font-medium text-white">Thank You for Your Donation</h4>
            <p className="text-xs text-text-secondary">
              Your charitable intent has been recorded. Full transaction settlement will take place through our PCI-compliant payment gateway in Phase 4.
            </p>
            <Button variant="silver" size="sm" onClick={() => setDonationCharity(null)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase mb-2">
                Select Amount ($)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["25", "50", "100", "250"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 text-xs font-mono rounded border transition-colors ${
                      donationAmount === amt
                        ? "bg-accent-blue-subtle text-blue-400 border-blue-500 font-bold"
                        : "bg-surface-graphite text-white border-border-subtle"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <Input
                label="Custom Amount ($)"
                type="number"
                min="5"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setDonationCharity(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setDonationSuccess(true)}>
                Confirm Donation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
