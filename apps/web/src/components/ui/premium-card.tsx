import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatPriceFrom, type SalonSummary } from "@/lib/queries";

import { GoldBadge } from "./gold-badge";
import { Stars } from "./stars";

type PremiumCardProps = {
  salon: SalonSummary;
  rank: number;
  priority?: boolean;
  className?: string;
};

/**
 * Editorial full-bleed card for the TOP horizontal scroll on Home.
 * 232×308 on mobile; on desktop it stretches a touch wider but the type stays calm.
 * Mirrors prototype PremiumCard (screens-1.jsx).
 */
export function PremiumCard({ salon, rank, priority = false, className }: PremiumCardProps) {
  const isPremium = salon.tier === "premium";
  const price = formatPriceFrom(salon.priceFromCents);

  return (
    <Link
      href={`/salon/${salon.slug}`}
      className={cn(
        "group relative block w-[232px] flex-shrink-0 overflow-hidden rounded-[18px] border lg:w-[280px] xl:w-[320px]",
        "[aspect-ratio:232/308]",
        isPremium
          ? "border-[rgba(194,143,92,0.34)] shadow-[0_1px_0_rgba(216,172,126,0.16)_inset,0_14px_30px_-14px_rgba(194,143,92,0.28)]"
          : "border-[var(--color-border)]",
        className,
      )}
    >
      {salon.coverUrl ? (
        <Image
          src={salon.coverUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) 280px, 232px"
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{ filter: "saturate(0.94) contrast(1.03)" }}
        />
      ) : null}

      {/* Vignette + bottom gradient for text legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,20,17,0.55) 0%, rgba(14,20,17,0.15) 22%, rgba(14,20,17,0.0) 42%, rgba(14,20,17,0.62) 78%, rgba(8,16,13,0.96) 100%)",
        }}
      />

      {/* Rank chip — editorial № */}
      <div
        className="absolute left-3 top-3 inline-flex items-center gap-[5px] rounded-[4px] border border-[rgba(194,143,92,0.3)] bg-[rgba(14,20,17,0.62)] px-[10px] py-[5px] font-body text-[10px] font-bold uppercase text-[var(--color-gold)] backdrop-blur"
        style={{ letterSpacing: "0.20em" }}
      >
        <span
          aria-hidden
          className="font-display italic"
          style={{ fontSize: 11, letterSpacing: 0, opacity: 0.65 }}
        >
          №
        </span>
        {String(rank).padStart(2, "0")}
      </div>

      {isPremium ? (
        <div className="absolute right-3 top-3">
          <GoldBadge />
        </div>
      ) : null}

      {/* Bottom text block */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-[14px] pb-[14px] lg:gap-2.5 lg:px-[18px] lg:pb-[18px]">
        {salon.neighborhood ? (
          <span
            className="font-body text-[10px] font-semibold uppercase text-[rgba(236,230,214,0.7)]"
            style={{ letterSpacing: "0.18em" }}
          >
            {salon.neighborhood}
          </span>
        ) : null}
        <div
          className="font-display text-[19px] font-medium leading-[1.1] text-[#F2EEDE] lg:text-[22px] xl:text-[24px]"
          style={{
            letterSpacing: "-0.02em",
            textShadow: "0 1px 12px rgba(0,0,0,0.45)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {salon.name}
        </div>
        <div className="flex items-center justify-between border-t border-[rgba(236,230,214,0.18)] pt-2">
          <div className="flex items-center gap-1 font-body text-[11.5px] text-[#ECE6D6]">
            {salon.rating !== null ? (
              <>
                <Stars rating={salon.rating} size={11} />
                <span className="ml-[3px] font-semibold">{salon.rating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-[rgba(236,230,214,0.6)]">Brez ocen</span>
            )}
          </div>
          {price ? (
            <div className="font-body text-[11px] text-[rgba(236,230,214,0.72)]">
              od <span className="font-semibold text-[#F2EEDE]">{price}</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
