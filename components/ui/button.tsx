import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

// Flat, like the rest of the site — the landing page carries its hierarchy on
// colour and rules, not elevation, so buttons carry no shadow either.
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.98]",
  accent:
    "bg-accent text-on-accent hover:bg-accent-hover active:scale-[0.98] font-semibold",
  outline:
    "border border-rule bg-card text-foreground hover:bg-muted active:scale-[0.98]",
  ghost: "text-foreground hover:bg-muted active:scale-[0.98]",
  destructive:
    "bg-destructive text-on-destructive hover:brightness-110 active:scale-[0.98]",
};

/**
 * Two CTA heights, not three. `lg` (52px) is the primary action anywhere on the
 * site — it matches the clay pill in the hero so the booking flow doesn't
 * change scale mid-journey. `md` (44px) is the touch-target minimum for
 * secondary controls; `sm` is only for controls nested inside a larger
 * tappable row.
 */
const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-7 text-[15px] gap-2.5",
};

/**
 * The button look as a bare class string.
 *
 * Exported because the landing page's CTAs are `next/link` anchors, not
 * `<button>`s, and they used to hand-roll their own pill — which is how the
 * site ended up with two button shapes and three heights. Anything that renders
 * as a link composes this instead of redefining it.
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200",
    "touch-manipulation cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

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
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}
