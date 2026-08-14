import { Ban, Check, Clock, Lock } from "lucide-react";
import type { SlotStatus } from "@/lib/types";

/**
 * One place defining how each slot state looks and reads.
 *
 * Every state carries a text label and an icon in addition to colour — a player
 * with red-green colour blindness must still be able to tell a free slot from a
 * taken one, so colour never carries the meaning on its own.
 */
export const SLOT_STATE = {
  free: {
    label: "Slobodno",
    icon: Check,
    className:
      "border-primary/25 bg-card text-foreground hover:border-primary hover:bg-green-50 hover:shadow-md cursor-pointer active:scale-[0.99]",
    iconClassName: "text-success",
  },
  taken: {
    label: "Zauzeto",
    icon: Ban,
    className: "border-border bg-muted text-muted-foreground cursor-not-allowed",
    iconClassName: "text-muted-foreground",
  },
  blocked: {
    label: "Stalni termin",
    icon: Lock,
    className: "border-border bg-muted text-muted-foreground cursor-not-allowed",
    iconClassName: "text-muted-foreground",
  },
  past: {
    label: "Prošlo",
    icon: Clock,
    className: "border-border/60 bg-muted/50 text-muted-foreground/70 cursor-not-allowed",
    iconClassName: "text-muted-foreground/60",
  },
} satisfies Record<
  SlotStatus,
  { label: string; icon: typeof Check; className: string; iconClassName: string }
>;
