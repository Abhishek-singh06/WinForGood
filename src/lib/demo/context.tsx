"use client";

/**
 * Demo Mode Context
 *
 * Provides a React context for demo mode state management.
 * All state is in-memory only — never persisted to any backend.
 *
 * SECURITY: This context has zero access to Supabase, Stripe, or any server actions.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  DEMO_USER,
  DEMO_SUBSCRIPTION,
  DEMO_SCORES,
  DEMO_SELECTED_CHARITY,
  DEMO_CHARITY_PERCENTAGE,
  DEMO_LATEST_DRAW,
  DEMO_PREVIOUS_DRAWS,
  DEMO_USER_DRAW_ENTRY,
  DEMO_WINNINGS,
  DEMO_TOTAL_WINNINGS,
  DEMO_UPCOMING_DRAW,
  type DemoPaymentState,
  type DemoPaymentMethod,
} from "./data";

interface DemoContextValue {
  // Core demo state
  isDemo: true;
  user: typeof DEMO_USER;
  subscription: typeof DEMO_SUBSCRIPTION;
  scores: typeof DEMO_SCORES;
  selectedCharity: typeof DEMO_SELECTED_CHARITY;
  charityPercentage: number;
  latestDraw: typeof DEMO_LATEST_DRAW;
  previousDraws: typeof DEMO_PREVIOUS_DRAWS;
  userDrawEntry: typeof DEMO_USER_DRAW_ENTRY;
  upcomingDraw: typeof DEMO_UPCOMING_DRAW;
  winnings: typeof DEMO_WINNINGS;
  totalWinnings: number;

  // Payment simulation state
  paymentState: DemoPaymentState;
  selectedPaymentMethod: DemoPaymentMethod | null;
  selectPaymentMethod: (method: DemoPaymentMethod) => void;
  startPayment: () => void;
  completePayment: () => void;
  failPayment: () => void;
  cancelPayment: () => void;
  resetPayment: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemoContext must be used within a DemoProvider");
  }
  return ctx;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [paymentState, setPaymentState] = useState<DemoPaymentState>("idle");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<DemoPaymentMethod | null>(null);

  const selectPaymentMethod = useCallback((method: DemoPaymentMethod) => {
    setSelectedPaymentMethod(method);
    setPaymentState("selecting");
  }, []);

  const startPayment = useCallback(() => {
    setPaymentState("processing");
    // Simulate processing delay (1.5s), then auto-succeed
    setTimeout(() => {
      setPaymentState("success");
    }, 1500);
  }, []);

  const completePayment = useCallback(() => {
    setPaymentState("success");
  }, []);

  const failPayment = useCallback(() => {
    setPaymentState("failure");
  }, []);

  const cancelPayment = useCallback(() => {
    setPaymentState("cancelled");
  }, []);

  const resetPayment = useCallback(() => {
    setPaymentState("idle");
    setSelectedPaymentMethod(null);
  }, []);

  const value: DemoContextValue = {
    isDemo: true,
    user: DEMO_USER,
    subscription: DEMO_SUBSCRIPTION,
    scores: DEMO_SCORES,
    selectedCharity: DEMO_SELECTED_CHARITY,
    charityPercentage: DEMO_CHARITY_PERCENTAGE,
    latestDraw: DEMO_LATEST_DRAW,
    previousDraws: DEMO_PREVIOUS_DRAWS,
    userDrawEntry: DEMO_USER_DRAW_ENTRY,
    upcomingDraw: DEMO_UPCOMING_DRAW,
    winnings: DEMO_WINNINGS,
    totalWinnings: DEMO_TOTAL_WINNINGS,

    paymentState,
    selectedPaymentMethod,
    selectPaymentMethod,
    startPayment,
    completePayment,
    failPayment,
    cancelPayment,
    resetPayment,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}
