"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { CHARITIES, type Charity } from "@/lib/data/charities";
import { Heart, Calendar, ArrowRight, CheckCircle } from "lucide-react";

export function CharitySpotlightSection() {
  const featuredCharities = CHARITIES.filter((c) => c.isFeatured);
  const [selectedCharityForDonation, setSelectedCharityForDonation] = useState<Charity | null>(null);
  const [donationAmount, setDonationAmount] = useState("50");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDirectDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 border-b border-border-subtle bg-bg-deep">
      <Container size="wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-4">
            <Badge variant="blue" className="flex items-center gap-1.5 w-fit">
              <Heart className="w-3 h-3 text-red-500" /> Charitable Purpose
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white tracking-tight">
              Causes at the Heart of{" "}
              <span className="italic text-text-silver">Every Round.</span>
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Charitable giving isn&apos;t an afterthought or a hidden setting. Every membership directs
              funds to verified nonprofit partners tackling youth education, water security, and veteran recovery.
            </p>
          </div>
          <Link href="/charities">
            <Button variant="silver" size="md" className="font-mono text-xs uppercase tracking-wider shrink-0">
              View All Causes <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Charities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCharities.map((charity) => (
            <Card
              key={charity.id}
              variant="gradient"
              className="flex flex-col justify-between p-0 overflow-hidden group hover:border-border-silver transition-colors"
            >
              {/* Media Image */}
              <div className="relative h-48 w-full bg-surface-graphite overflow-hidden">
                <Image
                  src={charity.heroImage}
                  alt={charity.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-charcoal via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3">
                  <Badge variant="charcoal">{charity.category}</Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-medium text-white group-hover:text-text-silver transition-colors">
                    {charity.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary line-clamp-3 leading-relaxed">
                    {charity.mission}
                  </p>
                </div>

                {/* Impact Stat Strip */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle text-center">
                  {charity.impactMetrics.map((metric, i) => (
                    <div key={i} className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-white block">
                        {metric.value}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted block leading-tight">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Upcoming Golf Event */}
                {charity.events.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono text-text-secondary bg-surface-graphite/40 p-2.5 rounded border border-border-subtle">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{charity.events[0].title}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <Link href={`/signup?charity=${charity.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full font-mono text-xs uppercase">
                      Select Cause
                    </Button>
                  </Link>
                  <Button
                    variant="silver"
                    size="sm"
                    onClick={() => {
                      setSelectedCharityForDonation(charity);
                      setIsSubmitted(false);
                    }}
                    className="font-mono text-xs uppercase"
                  >
                    Donate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>

      {/* Independent Direct Donation Modal (PRD § 08.1) */}
      <Modal
        isOpen={!!selectedCharityForDonation}
        onClose={() => setSelectedCharityForDonation(null)}
        title={selectedCharityForDonation ? `Direct Donation to ${selectedCharityForDonation.name}` : "Direct Donation"}
        description="Independent donation option, not tied to gameplay (PRD § 08.1). 100% of funds support this organization."
      >
        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-serif font-medium text-white">Thank You for Your Support</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Your direct donation intent has been registered. Full payment provider integration will be active in production.
            </p>
            <Button variant="silver" size="sm" onClick={() => setSelectedCharityForDonation(null)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDirectDonation} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase mb-2">
                Select Donation Amount
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
                        : "bg-surface-graphite text-white border-border-subtle hover:border-border-silver"
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
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCharityForDonation(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Proceed to Secure Donation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
