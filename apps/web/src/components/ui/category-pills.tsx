import Link from "next/link";

type Category = {
  slug: string;
  label: string;
  icon: React.ReactNode;
};

const CATS: Category[] = [
  {
    slug: "strizenje",
    label: "Striženje",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M8.1 8.1L20 20M14 14.5L20 4M8.1 15.9L13 11" />
      </svg>
    ),
  },
  {
    slug: "barvanje",
    label: "Barvanje",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5c-3 4-6 7.5-6 11a6 6 0 0012 0c0-3.5-3-7-6-11z" />
      </svg>
    ),
  },
  {
    slug: "nohti",
    label: "Nohti",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
        <path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
      </svg>
    ),
  },
  {
    slug: "lepota",
    label: "Lepota",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V8M12 8c-3 0-5-2-5-5 3 0 5 2 5 5zM12 8c3 0 5-2 5-5-3 0-5 2-5 5zM12 14c-3 0-5-2-5-5M12 14c3 0 5-2 5-5" />
      </svg>
    ),
  },
];

type CategoryPillsProps = {
  /**
   * "grid"   → mobile: 4 columns, icon on top of label (prototype-style buttons)
   * "inline" → desktop: horizontal row of compact pills (icon + label side-by-side)
   */
  variant?: "grid" | "inline";
};

/**
 * Four category quick-buttons.
 *  - grid   → prototype HomeScreen 4-column row, used on mobile
 *  - inline → compact filter chips, used on desktop catalog header
 */
export function CategoryPills({ variant = "grid" }: CategoryPillsProps) {
  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {CATS.map((c) => (
          <Link
            key={c.slug}
            href={`/iskanje?cat=${c.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3.5 py-2 font-body text-[13px] font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-border-strong)]"
          >
            <span className="text-[var(--color-gold)]">{c.icon}</span>
            {c.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {CATS.map((c) => (
        <Link
          key={c.slug}
          href={`/iskanje?cat=${c.slug}`}
          className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] py-3.5 transition-colors hover:border-[var(--color-border-strong)]"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--color-gold)]"
            style={{ background: "var(--color-gold-soft)" }}
          >
            {c.icon}
          </span>
          <span className="font-body text-[11px] font-medium text-[var(--color-text)]">
            {c.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
