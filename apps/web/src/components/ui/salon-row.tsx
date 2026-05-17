import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatPriceFrom, type SalonSummary } from "@/lib/queries";

import { Stars } from "./stars";

/**
 * Compact horizontal row used in "Frizerji v bližini" on mobile and in /iskanje.
 * Mirrors prototype BarberRow (screens-1.jsx).
 */
export function SalonRow({ salon }: { salon: SalonSummary }) {
  const price = formatPriceFrom(salon.priceFromCents);
  const isPremium = salon.tier === "premium";

  return (
    <Link
      href={`/salon/${salon.slug}`}
      className={cn(
        "group flex items-center gap-3 overflow-hidden rounded-2xl border bg-[var(--color-bg-elev)] p-3",
        isPremium
          ? "border-[rgba(194,143,92,0.34)] shadow-[0_1px_0_rgba(216,172,126,0.16)_inset,0_14px_30px_-14px_rgba(194,143,92,0.28)]"
          : "border-[var(--color-border)]",
        "transition-colors hover:border-[var(--color-border-strong)]",
      )}
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-elev-2)]">
        {salon.coverUrl ? (
          <Image
            src={salon.coverUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            style={{ filter: "saturate(0.94) contrast(1.03)" }}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3
            className="truncate font-display text-[16px] font-medium text-[var(--color-text)]"
            style={{ letterSpacing: "-0.01em" }}
          >
            {salon.name}
          </h3>
          {isPremium ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--color-gold)" aria-hidden className="flex-shrink-0">
              <path d="M3 18h18l-1.5-11-4 4-4-7-4 7-4-4L3 18z" />
            </svg>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-2 font-body text-[12px] text-[var(--color-text-dim)]">
          {salon.rating !== null ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Stars rating={salon.rating} size={10} />
                <span className="font-semibold text-[var(--color-text)]">{salon.rating.toFixed(1)}</span>
              </span>
              <span className="h-0.5 w-0.5 rounded-full bg-[var(--color-text-faint)]" />
              <span>{salon.reviewCount} ocen</span>
            </>
          ) : (
            <span>Brez ocen</span>
          )}
        </div>
        <div className="mt-1 truncate font-body text-[12px] text-[var(--color-text-dim)]">
          {salon.neighborhood ? `${salon.neighborhood}, ` : ""}
          {salon.city}
          {price ? ` · od ${price}` : ""}
        </div>
      </div>

      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-dim)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="flex-shrink-0"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
