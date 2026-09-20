import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "silver" | "blue" | "red" | "outline" | "charcoal";
}

export function Badge({
  className,
  variant = "silver",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase";

  const variantStyles = {
    silver: "bg-white/10 text-text-silver border border-white/15",
    blue: "bg-accent-blue-subtle text-blue-400 border border-blue-500/30",
    red: "bg-accent-red-subtle text-red-400 border border-red-500/30",
    outline: "bg-transparent text-text-secondary border border-border-silver",
    charcoal: "bg-surface-graphite text-white border border-border-subtle",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
}
