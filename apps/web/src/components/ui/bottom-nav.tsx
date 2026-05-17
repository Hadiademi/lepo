import Link from "next/link";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "Domov",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z" />
      </svg>
    ),
  },
  {
    href: "/iskanje",
    label: "Iskanje",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.5-4.5" />
      </svg>
    ),
  },
  {
    href: "/zemljevid",
    label: "Zemljevid",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2L3 5v17l6-3 6 3 6-3V2l-6 3-6-3z" />
        <path d="M9 2v17M15 5v17" />
      </svg>
    ),
  },
  {
    href: "/rezervacije",
    label: "Rezervacije",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

/**
 * Sticky bottom tab bar on mobile. Mirrors prototype TabBar (app.jsx).
 * Hidden on lg+ where the desktop top nav takes over.
 *
 * activeHref — pass the current pathname so the active tab lights up.
 * For Phase 1 the home page passes "/"; other pages 404 right now.
 */
export function BottomNav({ activeHref = "/" }: { activeHref?: string }) {
  return (
    <nav
      aria-label="Glavna navigacija"
      className="fixed inset-x-0 bottom-0 z-30 px-3 pb-5 pt-2 lg:hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(14,20,17,0) 0%, rgba(14,20,17,0.94) 30%, rgba(14,20,17,1) 100%)",
      }}
    >
      <div
        className="mx-auto flex h-16 max-w-md items-center justify-around rounded-[22px] border border-[var(--color-border)] px-1"
        style={{
          background: "rgba(24,33,29,0.88)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow:
            "0 12px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {TABS.map((t) => {
          const active = activeHref === t.href || (t.href === "/" && activeHref === "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex h-full flex-1 flex-col items-center justify-center gap-[3px]"
              aria-current={active ? "page" : undefined}
            >
              <span
                className="flex h-7 w-9 items-center justify-center rounded-[10px] transition-colors"
                style={{
                  background: active ? "var(--color-gold-soft)" : "transparent",
                  color: active ? "var(--color-gold)" : "var(--color-text-dim)",
                }}
              >
                {t.icon}
              </span>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: active ? "var(--color-gold)" : "var(--color-text-dim)",
                  letterSpacing: "-0.01em",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
