"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signUpAction } from "@/lib/auth/actions";
import { CHARITIES } from "@/lib/data/charities";
import { Shield, ArrowRight, AlertCircle, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [selectedCharityId, setSelectedCharityId] = useState(CHARITIES[0].id);
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("plan", plan);
    formData.append("charityId", selectedCharityId);
    formData.append("charityPercentage", charityPercentage.toString());

    try {
      const res = await signUpAction(null, formData);
      if (res && !res.success && res.error) {
        setErrorMessage(res.error);
      } else if (res && res.redirectTo) {
        router.push(res.redirectTo);
      }
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setErrorMessage(err.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-bg-deep">
      <Container size="narrow">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-sm bg-surface-charcoal border border-border-silver flex items-center justify-center text-white mx-auto mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <Badge variant="blue">Member Registration</Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white tracking-tight">
              Create Subscriber Account
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
              Track your Stableford rounds, support a vetted cause, and qualify for monthly draws.
            </p>
          </div>

          <Card variant="gradient" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle">
                  1. Account Credentials
                </h3>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Marcus Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="marcus@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Password (min. 8 characters)"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Membership Plan Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle">
                  2. Select Membership Plan (PRD § 04)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlan("monthly")}
                    className={`p-3.5 rounded border text-left space-y-1 transition-colors ${
                      plan === "monthly"
                        ? "bg-accent-blue-subtle text-white border-blue-500 font-bold"
                        : "bg-surface-charcoal text-text-secondary border-border-subtle"
                    }`}
                  >
                    <span className="text-xs font-mono block">Monthly Plan</span>
                    <span className="text-[11px] font-mono text-text-muted block">Flexible interval</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan("yearly")}
                    className={`p-3.5 rounded border text-left space-y-1 transition-colors ${
                      plan === "yearly"
                        ? "bg-accent-blue-subtle text-white border-blue-500 font-bold"
                        : "bg-surface-charcoal text-text-secondary border-border-subtle"
                    }`}
                  >
                    <span className="text-xs font-mono block">Yearly Plan</span>
                    <span className="text-[10px] text-red-400 font-mono block font-bold">
                      Discounted Rate (§ 04)
                    </span>
                  </button>
                </div>
              </div>

              {/* Charity Selection & 10% Floor Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted">
                    3. Select Charity & Impact (PRD § 08.1)
                  </h3>
                  <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Min. 10% Floor
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-text-secondary uppercase">
                    Select Primary Cause
                  </label>
                  <select
                    value={selectedCharityId}
                    onChange={(e) => setSelectedCharityId(e.target.value)}
                    className="w-full h-11 px-4 rounded-sm bg-surface-charcoal border border-border-subtle text-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric"
                  >
                    {CHARITIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-surface-charcoal">
                        {c.name} — ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contribution Slider with 10% Floor */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary">Your Contribution Share</span>
                    <span className="text-white font-bold">{charityPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={charityPercentage}
                    onChange={(e) => setCharityPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-surface-graphite rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>10% (PRD Minimum)</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-mono text-xs uppercase tracking-wider"
              >
                Complete Registration <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="pt-4 border-t border-border-subtle text-center">
              <p className="text-xs text-text-secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-white hover:text-blue-400 font-bold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
