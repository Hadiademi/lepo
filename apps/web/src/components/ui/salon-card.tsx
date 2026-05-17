import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatPriceFrom, type SalonSummary } from "@/lib/queries";

import { GoldBadge } from "./gold-badge";
import { Stars } from "./stars";

type SalonCardProps = {
  salon: SalonSummary;
  priority?: boolean;
  className?: string;
};

/**
 * Standard salon card — full-width photo on top, editorial title block below.
 * Used in the "all salons" grid on the home page.
 */
export function SalonCard({ salon, priority = false, className }: SalonCardProps) {
  const price = formatPriceFrom(salon.priceFromCents);
  const isPremium = salon.tier === "premium";

  return (
    <Link
      href={`/salon/${salon.slug}`}
      className={cn(
        "group block overflow-hidden rounded-[18px] border bg-[var(--color-bg-elev)] transition-shadow",
        isPremium
          ? "border-[rgba(194,143,92,0.34)] shadow-[0_1px_0_rgba(216,172,126,0.16)_inset,0_14px_30px_-14px_rgba(194,143,92,0.28)]"
          : "border-[var(--color-border)]",
        "hover:shadow-[0_22px_44px_-16px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--color-bg-elev-2)]">
        {salon.coverUrl ? (
          <Image
            src={salon.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={{ filter: "saturate(0.94) contrast(1.03)" }}
          />
        ) : null}
        {/* warm duotone overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(194,143,92,0.07) 0%, transparent 38%, rgba(14,20,17,0.18) 100%)",
          }}
        />
        {isPremium ? (
          <div className="absolute right-3 top-3">
            <GoldBadge />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="font-display text-[18px] font-medium text-[var(--color-text)]"
            style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            {salon.name}
          </h3>
          {price ? (
            <span
              className={cn(
                "font-display text-[16px] font-medium leading-none",
                isPremium ? "text-[var(--color-gold)]" : "text-[var(--color-text)]",
              )}
              style={{ letterSpacing: "-0.02em" }}
            >
              od {price}
            </span>
          ) : null}
        </div>

        <p className="font-body text-[12px] text-[var(--color-text-dim)]">
          {salon.neighborhood ? `${salon.neighborhood} · ` : ""}
          {salon.city}
        </p>

        <div className="mt-1 flex items-center gap-2 font-body text-[12px] text-[var(--color-text-dim)]">
          {salon.rating !== null ? (
            <>
              <Stars rating={salon.rating} size={11} />
              <span className="font-semibold text-[var(--color-text)]">{salon.rating.toFixed(1)}</span>
              <span className="text-[var(--color-text-faint)]">·</span>
              <span>{salon.reviewCount} ocen</span>
            </>
          ) : (
            <span className="text-[var(--color-text-faint)]">Brez ocen</span>
          )}
        </div>
      </div>
    </Link>
  );
}
