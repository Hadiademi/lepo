import Link from "next/link";

/**
 * Search bar — visually matches prototype HomeScreen search.
 * Phase 1 is read-only: tapping the input goes to /iskanje (placeholder for now).
 */
export function SearchInput({
  placeholder = "Poišči frizerja, salon ali storitev…",
}: {
  placeholder?: string;
}) {
  return (
    <Link
      href="/iskanje"
      className="flex h-[52px] w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 transition-colors hover:border-[var(--color-border-strong)]"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-dim)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="flex-shrink-0"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.5-4.5" />
      </svg>
      <span className="flex-1 truncate font-body text-[14.5px] text-[var(--color-text-dim)]">
        {placeholder}
      </span>
      <span
        aria-hidden
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-[#1A1209]"
        style={{ background: "var(--color-gold)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h18M6 12h12M10 19h4" />
        </svg>
      </span>
    </Link>
  );
}
