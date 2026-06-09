import type { VerdictKey } from "@/types/valuation";

/** Semantic color classes per verdict. Color is meaning, never decoration. */
export const VERDICT_STYLES: Record<
  VerdictKey,
  { text: string; bg: string; border: string; ring: string; dot: string }
> = {
  attractive: {
    text: "text-attractive",
    bg: "bg-attractive-soft",
    border: "border-attractive/30",
    ring: "ring-attractive/20",
    dot: "bg-attractive",
  },
  fair: {
    text: "text-fair",
    bg: "bg-fair-soft",
    border: "border-fair/30",
    ring: "ring-fair/20",
    dot: "bg-fair",
  },
  expensive: {
    text: "text-expensive",
    bg: "bg-expensive-soft",
    border: "border-expensive/30",
    ring: "ring-expensive/20",
    dot: "bg-expensive",
  },
};
