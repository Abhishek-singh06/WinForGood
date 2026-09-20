"use client";

/**
 * Demo Payment Simulation
 *
 * A polished payment simulation for demo/presentation mode.
 *
 * CRITICAL SAFETY RULES:
 * - This NEVER calls Stripe, processes real payments, or generates real receipts.
 * - This NEVER collects or transmits real card details.
 * - This NEVER triggers real UPI intents or bank transfers.
 * - All payment methods are clearly labeled as DEMO/SIMULATION.
 * - Success states explicitly declare "no real payment was processed."
 */

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoQR } from "./DemoQR";
import { useDemoContext } from "@/lib/demo/context";
import {
  CreditCard,
  Smartphone,
  QrCode,
  Building2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Ban,
} from "lucide-react";
import type { DemoPaymentMethod } from "@/lib/demo/data";

const METHOD_ICONS: Record<DemoPaymentMethod, React.ElementType> = {
  card: CreditCard,
  upi: Smartphone,
  qr: QrCode,
  bank_transfer: Building2,
};

// ============================================================================
// CARD PAYMENT VIEW
// ============================================================================
function CardPaymentView({ onPay, onCancel }: { onPay: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 font-mono flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Simulation only — no real card details are collected or transmitted.</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
            Card Number
          </label>
          <div className="h-11 rounded-sm bg-surface-charcoal border border-border-subtle flex items-center px-3 text-sm text-text-muted font-mono">
            4242 •••• •••• •••• (Demo)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
              Expiry
            </label>
            <div className="h-11 rounded-sm bg-surface-charcoal border border-border-subtle flex items-center px-3 text-sm text-text-muted font-mono">
              12/29 (Demo)
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
              CVV
            </label>
            <div className="h-11 rounded-sm bg-surface-charcoal border border-border-subtle flex items-center px-3 text-sm text-text-muted font-mono">
              ••• (Demo)
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="silver" size="sm" onClick={onCancel} className="font-mono text-xs flex-1">
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onPay} className="font-mono text-xs flex-1 uppercase">
          Simulate Payment
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// UPI PAYMENT VIEW
// ============================================================================
function UPIPaymentView({ onPay, onCancel }: { onPay: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 font-mono flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Simulation only — no real UPI intent or payment request will be triggered.</span>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-text-muted tracking-wider">
          UPI ID
        </label>
        <div className="h-11 rounded-sm bg-surface-charcoal border border-border-subtle flex items-center px-3 text-sm text-text-muted font-mono">
          demo@digitalheroes (Simulated)
        </div>
      </div>

      <div className="p-3 rounded bg-surface-charcoal border border-border-subtle text-xs text-text-secondary font-mono space-y-1">
        <span className="text-text-muted uppercase text-[10px] block">Payee</span>
        <span className="text-white block">Digital Heroes Demo Trust (Simulated)</span>
        <span className="text-text-muted uppercase text-[10px] block mt-2">Amount</span>
        <span className="text-white block">£10.00 (Demo)</span>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="silver" size="sm" onClick={onCancel} className="font-mono text-xs flex-1">
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onPay} className="font-mono text-xs flex-1 uppercase">
          Simulate UPI Payment
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// QR PAYMENT VIEW
// ============================================================================
function QRPaymentView({ onPay, onCancel }: { onPay: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 font-mono flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>DEMO QR — Simulation only. No payment will be processed.</span>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <DemoQR size={180} />
        <div className="text-center space-y-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Demo QR Code</p>
          <p className="text-[11px] text-text-secondary">
            This QR does not encode any real payment destination.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="silver" size="sm" onClick={onCancel} className="font-mono text-xs flex-1">
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onPay} className="font-mono text-xs flex-1 uppercase">
          Simulate QR Scan
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// BANK TRANSFER VIEW
// ============================================================================
function BankTransferView({ onPay, onCancel }: { onPay: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 font-mono flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Simulation only — these are demo bank details. Do NOT transfer real money.</span>
      </div>

      <div className="space-y-3 p-4 rounded bg-surface-charcoal border border-border-subtle">
        <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Demo Bank Transfer Instructions
        </h4>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-text-muted">Account Name:</span>
            <span className="text-white">Digital Heroes Demo (Simulated)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Sort Code:</span>
            <span className="text-white">00-00-00 (Demo)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Account No:</span>
            <span className="text-white">00000000 (Demo)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Reference:</span>
            <span className="text-white">DEMO-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between border-t border-border-subtle pt-2 mt-2">
            <span className="text-text-muted">Amount:</span>
            <span className="text-white font-bold">£10.00 (Demo)</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="silver" size="sm" onClick={onCancel} className="font-mono text-xs flex-1">
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onPay} className="font-mono text-xs flex-1 uppercase">
          Simulate Transfer Sent
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAYMENT SIMULATION COMPONENT
// ============================================================================
export function DemoPaymentSimulation({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    paymentState,
    selectedPaymentMethod,
    selectPaymentMethod,
    startPayment,
    cancelPayment,
    resetPayment,
  } = useDemoContext();

  const [showFailure, setShowFailure] = useState(false);

  const handleClose = () => {
    resetPayment();
    setShowFailure(false);
    onClose();
  };

  const handlePay = () => {
    if (showFailure) {
      // Simulate failure path
      startPayment();
      setTimeout(() => {
        // Override the auto-success from context with failure
      }, 100);
    } else {
      startPayment();
    }
  };

  const handleSimulateFailure = () => {
    setShowFailure(true);
    cancelPayment();
  };

  // Processing state
  if (paymentState === "processing") {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Processing Demo Payment" className="max-w-sm">
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-text-secondary font-mono">Processing simulated payment...</p>
          <p className="text-[11px] text-text-muted font-mono">
            No real transaction in progress.
          </p>
        </div>
      </Modal>
    );
  }

  // Success state
  if (paymentState === "success") {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Demo Payment Successful">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-14 h-14 rounded-full bg-blue-950/50 border border-blue-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-serif font-medium text-white">
              Demo Payment Successful
            </h3>
            <Badge variant="blue">£10.00 — Monthly Subscription</Badge>
          </div>
          <div className="p-3.5 rounded bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300 font-mono text-center leading-relaxed max-w-xs">
            Simulation only — no real payment was processed.
            No money has been transferred.
          </div>
          <Button
            variant="silver"
            size="sm"
            onClick={handleClose}
            className="font-mono text-xs uppercase mt-2"
          >
            Return to Demo Dashboard
          </Button>
        </div>
      </Modal>
    );
  }

  // Failure state
  if (paymentState === "failure" || paymentState === "cancelled") {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={paymentState === "failure" ? "Demo Payment Failed" : "Demo Payment Cancelled"}>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center">
            {paymentState === "failure" ? (
              <XCircle className="w-7 h-7 text-red-400" />
            ) : (
              <Ban className="w-7 h-7 text-text-muted" />
            )}
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-serif font-medium text-white">
              {paymentState === "failure" ? "Demo Payment Failed" : "Demo Payment Cancelled"}
            </h3>
            <p className="text-xs text-text-secondary max-w-xs">
              {paymentState === "failure"
                ? "This is a simulated failure state. No real payment was attempted."
                : "The demo payment was cancelled. No real payment was attempted."}
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="silver" size="sm" onClick={handleClose} className="font-mono text-xs">
              Close
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { resetPayment(); setShowFailure(false); }}
              className="font-mono text-xs"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Method selection / payment form state
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Demo Payment"
      description="Simulation only — no real payment will be processed."
    >
      {!selectedPaymentMethod ? (
        // Method selection
        <div className="space-y-4">
          <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
            Select Payment Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["card", "upi", "qr", "bank_transfer"] as DemoPaymentMethod[]).map((method) => {
              const Icon = METHOD_ICONS[method];
              const labels: Record<DemoPaymentMethod, string> = {
                card: "Card",
                upi: "UPI",
                qr: "QR Code",
                bank_transfer: "Bank Transfer",
              };
              return (
                <button
                  key={method}
                  onClick={() => selectPaymentMethod(method)}
                  className="p-4 rounded-md bg-surface-charcoal border border-border-subtle hover:border-blue-500/40 hover:bg-surface-graphite transition-all duration-200 flex flex-col items-center gap-2 group"
                >
                  <Icon className="w-5 h-5 text-text-muted group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs font-mono text-text-secondary group-hover:text-white transition-colors">
                    {labels[method]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2 border-t border-border-subtle">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSimulateFailure}
              className="font-mono text-xs flex-1"
            >
              Simulate Failure
            </Button>
            <Button
              variant="silver"
              size="sm"
              onClick={handleClose}
              className="font-mono text-xs flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // Payment form for selected method
        <div className="space-y-4">
          <button
            onClick={() => selectPaymentMethod(selectedPaymentMethod)}
            className="flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span
              onClick={(e) => {
                e.stopPropagation();
                resetPayment();
              }}
            >
              Back to methods
            </span>
          </button>

          {selectedPaymentMethod === "card" && (
            <CardPaymentView onPay={handlePay} onCancel={() => { cancelPayment(); handleClose(); }} />
          )}
          {selectedPaymentMethod === "upi" && (
            <UPIPaymentView onPay={handlePay} onCancel={() => { cancelPayment(); handleClose(); }} />
          )}
          {selectedPaymentMethod === "qr" && (
            <QRPaymentView onPay={handlePay} onCancel={() => { cancelPayment(); handleClose(); }} />
          )}
          {selectedPaymentMethod === "bank_transfer" && (
            <BankTransferView onPay={handlePay} onCancel={() => { cancelPayment(); handleClose(); }} />
          )}
        </div>
      )}
    </Modal>
  );
}
