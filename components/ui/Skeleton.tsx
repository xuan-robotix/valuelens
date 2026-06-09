import { cn } from "@/utils/cn";

/** Shimmering placeholder block used while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-2",
        "after:absolute after:inset-0 after:-translate-x-full",
        "after:bg-gradient-to-r after:from-transparent after:via-black/5 after:to-transparent",
        "after:[animation:vl-shimmer_1.5s_infinite] dark:after:via-white/10",
        className,
      )}
    />
  );
}
