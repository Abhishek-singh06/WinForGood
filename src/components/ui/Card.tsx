import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "outline" | "interactive";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const baseStyles = "rounded-md p-6 relative overflow-hidden transition-all duration-200";

    const variantStyles = {
      default: "bg-surface-charcoal border border-border-subtle",
      gradient: "charcoal-card-gradient border border-border-subtle shadow-panel",
      outline: "bg-transparent border border-border-silver",
      interactive:
        "charcoal-card-gradient border border-border-subtle hover:border-border-silver hover:-translate-y-1 shadow-panel cursor-pointer",
    };

    return (
      <div ref={ref} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
