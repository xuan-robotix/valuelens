"use client";

import { useId, useState } from "react";

/**
 * Lightweight tooltip. Shows on hover and focus (desktop) and on tap (mobile,
 * via click toggle). One sentence of plain English — used to define every
 * jargon term so beginners aren't left guessing.
 */
export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="What is this?"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-lg border border-border bg-fg px-3 py-2 text-xs leading-snug text-bg shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
