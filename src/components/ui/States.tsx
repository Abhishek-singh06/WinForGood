import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function LoadingState({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center space-y-3",
        className
      )}
    >
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-xs font-mono uppercase tracking-widest text-text-secondary">
        {message}
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-md border border-dashed border-border-subtle bg-surface-charcoal/40 space-y-3",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-surface-graphite flex items-center justify-center text-text-muted">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-base font-medium text-white">{title}</h4>
      <p className="text-xs text-text-secondary max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button variant="silver" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-md border border-red-500/30 bg-accent-red-subtle/20 space-y-3",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-950/80 flex items-center justify-center text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-medium text-white">{title}</h4>
      <p className="text-xs text-red-300 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="silver" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  );
}
