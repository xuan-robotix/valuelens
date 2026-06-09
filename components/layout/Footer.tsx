/** Footer with the permanent, non-fine-print honesty disclaimer. */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted">
        <p className="font-medium text-fg">Not financial advice.</p>
        <p className="mt-1 max-w-2xl">
          ValueLens scores public fundamentals only — it doesn&apos;t account for
          guidance, management, moat, or macro conditions. It&apos;s a starting
          point for your own research, not a recommendation to buy or sell.
        </p>
        <p className="mt-3 text-xs">
          © {new Date().getFullYear()} ValueLens · A lens, not a crystal ball.
        </p>
      </div>
    </footer>
  );
}
