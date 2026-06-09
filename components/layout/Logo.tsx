import Link from "next/link";

/** Minimal lens/aperture mark + wordmark, in brand blue. */
export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" className="stroke-brand" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" className="fill-brand" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        Value<span className="text-brand">Lens</span>
      </span>
    </Link>
  );
}
