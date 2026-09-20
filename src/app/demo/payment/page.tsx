"use client";

import React, { useState } from "react";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoPaymentSimulation } from "@/components/demo/DemoPaymentSimulation";
import { CreditCard, ShieldCheck, QrCode, Smartphone, Building2, AlertTriangle } from "lucide-react";

export default function DemoPaymentHubPage() {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Payment Simulator</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Demo Payment Experience
          </h1>
          <p className="text-xs text-text-secondary">
            Test and evaluate the checkout simulation interface across multiple payment methods.
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded bg-blue-950/20 border border-blue-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-text-secondary">
          <span className="font-bold text-white font-mono uppercase tracking-wider block">
            Safe Environment Verification
          </span>
          <p className="leading-relaxed">
            This module provides a strictly client-side simulation. No live Stripe endpoints, bank accounts, or external payment gateways are invoked. All card numbers, QR codes, and UPI identifiers are non-functional mock data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods Overview */}
        <Card variant="gradient" className="space-y-4">
          <h2 className="text-lg font-serif font-medium text-white border-b border-border-subtle pb-3">
            Supported Simulation Channels
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded bg-surface-charcoal border border-border-subtle">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-mono font-bold text-white block">Credit / Debit Card</span>
                <span className="text-[11px] text-text-secondary">Mock card entry with preset credentials</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded bg-surface-charcoal border border-border-subtle">
              <QrCode className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-mono font-bold text-white block">Algorithmic Demo QR</span>
                <span className="text-[11px] text-text-secondary">Dynamic procedural vector pattern with watermark</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded bg-surface-charcoal border border-border-subtle">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-mono font-bold text-white block">Unified Payments (UPI)</span>
                <span className="text-[11px] text-text-secondary">Simulated instant mobile handle validation</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded bg-surface-charcoal border border-border-subtle">
              <Building2 className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-mono font-bold text-white block">Direct Bank Transfer</span>
                <span className="text-[11px] text-text-secondary">Simulated manual wire instructions and reference</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Trigger Card */}
        <Card variant="default" className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <Badge variant="red">Interactive Demo</Badge>
            <h2 className="text-2xl font-serif font-medium text-white">
              Launch Checkout Simulation
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Open the complete payment modal to step through method selection, processing states, failure recovery, and success screens.
            </p>
            <div className="p-3 rounded bg-surface-charcoal border border-border-subtle space-y-1 font-mono text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Product:</span>
                <span className="text-white">Monthly Subscription</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Simulated Charge:</span>
                <span className="text-white font-bold">£10.00 GBP</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsSimulationOpen(true)}
            className="w-full font-mono text-xs uppercase tracking-wider"
          >
            Launch Payment Modal
          </Button>
        </Card>
      </div>

      <DemoPaymentSimulation
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />
    </div>
  );
}
