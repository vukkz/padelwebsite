import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.98] shadow-sm",
  accent:
    "bg-accent text-on-accent hover:bg-accent-hover active:scale-[0.98] shadow-sm font-semibold",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]",
  ghost: "text-foreground hover:bg-muted active:scale-[0.98]",
  destructive:
    "bg-destructive text-on-destructive hover:brightness-110 active:scale-[0.98]",
};

// Heights meet the 44px touch-target minimum from md up; sm is only for
// secondary controls that sit inside a larger tappable row.
const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-[15px] gap-2",
  lg: "h-14 px-6 text-lg gap-2.5",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
        "touch-manipulation cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
