"use client";

import React, { useState } from "react";
import { useDemoContext } from "@/lib/demo/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoPaymentSimulation } from "@/components/demo/DemoPaymentSimulation";
import { User, Mail, Shield, Calendar, CreditCard, Sparkles } from "lucide-react";

export default function DemoAccountPage() {
  const { user, subscription } = useDemoContext();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <Badge variant="blue">Account Settings</Badge>
          <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
            Subscriber Profile (Demo)
          </h1>
          <p className="text-xs text-text-secondary">
            Manage personal identity, verified metadata, and test subscription operations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsPaymentOpen(true)}
          className="font-mono text-xs uppercase"
        >
          <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Launch Demo Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identity card */}
        <Card variant="gradient" className="space-y-6">
          <h2 className="text-lg font-serif font-medium text-white border-b border-border-subtle pb-3">
            Identity &amp; Credentials
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" /> Full Name
              </span>
              <span className="text-sm font-sans font-medium text-white block">
                {user.full_name}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Account Email
              </span>
              <span className="text-sm font-sans text-text-silver block">
                {user.email}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> System Role
              </span>
              <Badge variant="charcoal">{user.role}</Badge>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Member Since
              </span>
              <span className="text-sm font-sans text-text-silver block">
                15 March 2025
              </span>
            </div>
          </div>
        </Card>

        {/* Subscription details card */}
        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-lg font-serif font-medium text-white">
              Active Plan (Demo)
            </h2>
            <Badge variant="blue">{subscription.plan}</Badge>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Pricing</span>
              <span className="text-white font-bold">£10.00 / month</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Status</span>
              <span className="text-green-400 font-bold uppercase">Active</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Next Billing</span>
              <span className="text-white">01 October 2026</span>
            </div>
            <div className="flex justify-between py-1 border-t border-border-subtle pt-2">
              <span className="text-text-muted">Payment Method</span>
              <span className="text-text-silver">Simulated Card (•••• 4242)</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPaymentOpen(true)}
              className="w-full font-mono text-xs uppercase"
            >
              Test Payment Sheet Simulation
            </Button>
          </div>
        </Card>
      </div>

      <DemoPaymentSimulation
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}
