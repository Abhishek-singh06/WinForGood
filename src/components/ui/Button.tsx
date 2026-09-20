import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "silver" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep disabled:opacity-50 disabled:pointer-events-none rounded-sm select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-5 py-2.5 h-11 gap-2",
      lg: "text-base px-7 py-3.5 h-13 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-accent-red text-white hover:bg-accent-red-hover shadow-red font-semibold",
      secondary:
        "bg-accent-blue-subtle text-blue-400 border border-blue-500/40 hover:bg-blue-600/20 hover:border-blue-400",
      silver:
        "bg-transparent text-white border border-border-silver hover:bg-white/5 hover:border-border-strong",
      ghost:
        "bg-transparent text-text-secondary hover:text-white hover:bg-white/5",
      destructive:
        "bg-transparent text-red-400 border border-red-500/40 hover:bg-red-950/40 hover:border-red-400",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
