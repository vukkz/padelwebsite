import { Ban, Check, Clock, Lock } from "lucide-react";
import type { SlotStatus } from "@/lib/types";

/**
 * One place defining how each slot state looks and reads.
 *
 * Colour never carries the meaning on its own — a player with red-green colour
 * blindness must still be able to tell a free slot from a taken one. What
 * carries it here is the *price*: a bookable slot shows one, an unavailable
 * slot shows a word instead. Both are visible without colour.
 *
 * So `showLabel` marks the unavailable states only. Badging every free cell
 * "✓ Slobodno" as well means an open day renders eighteen identical green
 * stickers and the prices — the thing people are actually reading — disappear
 * into them. Screen readers are unaffected: each button's aria-label still
 * announces court, time, state and price in full.
 */
export const SLOT_STATE = {
  free: {
    label: "Slobodno",
    icon: Check,
    showLabel: false,
    // Clay is the accent everywhere else on the site, so the affordance for
    // "you can tap this" matches the hero CTA rather than inventing a colour.
    className:
      "border-rule bg-card text-foreground hover:border-clay-500 hover:bg-clay-100/50 cursor-pointer active:scale-[0.99]",
    iconClassName: "text-success",
  },
  taken: {
    label: "Zauzeto",
    icon: Ban,
    showLabel: true,
    className: "border-rule/70 bg-muted text-muted-foreground cursor-not-allowed",
    iconClassName: "text-muted-foreground",
  },
  blocked: {
    label: "Stalni termin",
    icon: Lock,
    showLabel: true,
    className: "border-rule/70 bg-muted text-muted-foreground cursor-not-allowed",
    iconClassName: "text-muted-foreground",
  },
  past: {
    label: "Prošlo",
    icon: Clock,
    showLabel: false,
    className: "border-transparent bg-muted/40 text-muted-foreground/50 cursor-not-allowed",
    iconClassName: "text-muted-foreground/50",
  },
} satisfies Record<
  SlotStatus,
  {
    label: string;
    icon: typeof Check;
    showLabel: boolean;
    className: string;
    iconClassName: string;
  }
>;
