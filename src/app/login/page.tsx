"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInAction } from "@/lib/auth/actions";
import { Shield, ArrowRight, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const confirmed = searchParams.get("confirmed");
  const next = searchParams.get("next");
  const urlError = searchParams.get("error");
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (next) {
      formData.append("next", next);
    }

    try {
      const res = await signInAction(null, formData);
      if (res && !res.success && res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      // If Next.js redirect threw (standard Next redirect behavior), let it proceed
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setErrorMessage(err.message || "An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-20 sm:py-28 bg-bg-deep">
      <Container size="narrow">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-sm bg-surface-charcoal border border-border-silver flex items-center justify-center text-white mx-auto mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <Badge variant="blue">Authentication Gate</Badge>
            <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
              Sign In to Digital Heroes
            </h1>
            <p className="text-xs text-text-secondary">
              Enter your credentials to access your performance dashboard and draws.
            </p>
          </div>

          {(registered || confirmed === "pending" || confirmed === "verified") && (
            <div className="p-4 rounded bg-surface-charcoal border border-green-500/40 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-text-silver leading-relaxed font-medium">
                Account created successfully. You can now log in.
              </p>
            </div>
          )}

          {urlError && !errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded bg-accent-red-subtle/30 border border-red-500/40 text-xs text-red-300 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                {urlError === "verification_failed"
                  ? "Email verification link is invalid, expired, or has already been used. Please try signing in or register again."
                  : urlError}
              </span>
            </div>
          )}

          {next && (
            <div className="p-3 rounded bg-surface-charcoal border border-border-subtle text-xs font-mono text-text-secondary">
              Sign in required to access: <code className="text-white">{next}</code>
            </div>
          )}

          {/* Login Card */}
          <Card variant="gradient" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="golfer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

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
                size="md"
                isLoading={isLoading}
                className="w-full font-mono text-xs uppercase tracking-wider"
              >
                Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </form>

            <div className="pt-4 border-t border-border-subtle text-center space-y-4">
              <p className="text-xs text-text-secondary">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/signup"
                  className="text-white hover:text-blue-400 font-bold transition-colors"
                >
                  Register & Join the Draw
                </Link>
              </p>

              {/* Demo Mode Entry Point */}
              <div className="pt-2 border-t border-border-subtle/60 flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  Reviewer Presentation
                </span>
                <Link href="/demo" className="w-full">
                  <Button
                    type="button"
                    variant="silver"
                    size="md"
                    className="w-full font-mono text-xs uppercase tracking-wider border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white group"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                    Try Demo Mode (Instant Access)
                  </Button>
                </Link>
                <span className="text-[10px] text-text-muted font-mono">
                  Explore full subscriber portal with safe simulated data
                </span>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-28 bg-bg-deep flex items-center justify-center">
          <div className="text-text-secondary text-sm font-mono animate-pulse">
            Loading authentication gateway...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
