import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

/** Surface card: the atomic container of the dashboard. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
