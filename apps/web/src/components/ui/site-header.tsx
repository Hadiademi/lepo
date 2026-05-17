import Link from "next/link";

import { BrandMark } from "./brand-mark";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "Domov" },
  { href: "/iskanje", label: "Iskanje" },
  { href: "/zemljevid", label: "Zemljevid" },
  { href: "/rezervacije", label: "Rezervacije" },
];

/**
 * Desktop-only top navigation (replaces the mobile bottom tab bar on lg+).
 * Mobile has its own header inline on the home page (greeting + bell).
 */
export function SiteHeader({ activeHref = "/" }: { activeHref?: string }) {
  return (
    <header className="sticky top-0 z-20 hidden border-b border-[var(--color-border)] backdrop-blur lg:block">
      <div
        className="mx-auto flex h-16 w-full max-w-[1760px] items-center justify-between gap-8 px-8"
        style={{ background: "rgba(14,20,17,0.78)" }}
      >
        <Link href="/" className="flex items-center gap-3" aria-label="Lepo — domov">
          <BrandMark size={32} />
          <span
            className="font-display text-[20px] font-medium leading-none text-[var(--color-text)]"
            style={{ letterSpacing: "-0.03em" }}
          >
            Lep
            <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>o</em>
          </span>
        </Link>

        <nav aria-label="Glavna navigacija" className="flex items-center gap-1">
          {NAV.map((n) => {
            const active = activeHref === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="relative rounded-full px-4 py-2 font-body text-[13.5px] transition-colors"
                style={{
                  color: active ? "var(--color-gold)" : "var(--color-text-dim)",
                  background: active ? "var(--color-gold-soft)" : "transparent",
                  fontWeight: active ? 600 : 500,
                }}
                aria-current={active ? "page" : undefined}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3.5 py-2 font-body text-[12px] text-[var(--color-text-dim)]"
            aria-label="Trenutna lokacija"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            Ljubljana
          </span>
          <Link
            href="/prijava"
            className="rounded-full bg-[var(--color-text)] px-4 py-2 font-body text-[13px] font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
          >
            Prijava
          </Link>
        </div>
      </div>
    </header>
  );
}
