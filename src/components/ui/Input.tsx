import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono font-medium uppercase tracking-wider text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full h-11 px-4 rounded-sm bg-surface-charcoal border text-white placeholder:text-text-muted text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric focus-visible:border-transparent disabled:opacity-50 disabled:pointer-events-none",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-border-subtle hover:border-border-silver",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-sans">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted font-sans">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
