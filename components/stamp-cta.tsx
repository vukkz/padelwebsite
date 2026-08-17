import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The site's primary action.
 *
 * A flat terracotta rectangle with letterspaced caps — no radius, no shadow,
 * no ornament. The previous build's struck-rubber-stamp belonged to the
 * packaging world and read as playful; this club's own material is restrained,
 * and at this level of brand the confident move is a plain block of the one
 * accent colour, sized generously and given room.
 *
 * `tone="cream"` is for use over photography, where terracotta on a sunlit
 * image loses its authority and cream does not.
 */
export function ActionLink({
  href,
  children,
  className,
  id,
  tone = "terracotta",
  size = "lg",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "terracotta" | "cream" | "green";
  size?: "md" | "lg";
}) {
  const tones = {
    terracotta:
      "bg-terracotta text-white hover:bg-terracotta-deep focus-visible:ring-terracotta",
    /*
      Cream sits on photography, so hover cannot be "slightly whiter" — that
      reads as nothing against a bright frame. Flipping the whole plate to the
      court's terracotta is the one accent this palette has, and it makes the
      primary action the only thing on the screen that changes colour.
    */
    cream:
      "bg-cream text-ink hover:bg-terracotta hover:text-white focus-visible:ring-cream",
    green: "bg-green text-cream hover:bg-green-deep focus-visible:ring-green",
  };

  return (
    <Link
      id={id}
      href={href}
      className={cn(
        "inline-flex items-center justify-center text-center font-semibold uppercase transition-colors",
        "tracking-[0.08em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
        size === "lg" ? "min-h-14 px-9 text-[13px]" : "min-h-12 px-7 text-[12px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </Link>
  );
}
