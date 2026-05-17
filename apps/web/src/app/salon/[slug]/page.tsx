import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandMark } from "@/components/ui/brand-mark";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GoldBadge } from "@/components/ui/gold-badge";
import { SiteHeader } from "@/components/ui/site-header";
import { Stars } from "@/components/ui/stars";
import {
  formatDuration,
  formatPrice,
  formatPriceFrom,
  getSalonBySlug,
  type SalonDetail,
} from "@/lib/queries";

// On-demand ISR: first request renders + caches; subsequent get the cache for 60s.
// Avoids generateStaticParams + cookies() conflict at build time.
export const revalidate = 60;

const WEEKDAYS = [
  "Ponedeljek",
  "Torek",
  "Sreda",
  "Četrtek",
  "Petek",
  "Sobota",
  "Nedelja",
] as const;

function schemaDay(weekday: number): string {
  switch (weekday) {
    case 0:
      return "https://schema.org/Monday";
    case 1:
      return "https://schema.org/Tuesday";
    case 2:
      return "https://schema.org/Wednesday";
    case 3:
      return "https://schema.org/Thursday";
    case 4:
      return "https://schema.org/Friday";
    case 5:
      return "https://schema.org/Saturday";
    case 6:
      return "https://schema.org/Sunday";
    default:
      return "https://schema.org/Monday";
  }
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) return {};
  const location = salon.neighborhood
    ? `${salon.neighborhood}, ${salon.city}`
    : salon.city;
  return {
    title: salon.name,
    description:
      salon.description ?? `${salon.name} — ${location}. Rezerviraj termin v nekaj sekundah.`,
    openGraph: {
      type: "website",
      title: `${salon.name} · Lepo`,
      description: salon.description ?? location,
      images: salon.coverUrl ? [{ url: salon.coverUrl }] : undefined,
    },
  };
}

export default async function SalonPage({ params }: PageProps) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const location = salon.neighborhood
    ? `${salon.neighborhood}, ${salon.city}`
    : salon.city;

  return (
    <>
      <SiteHeader activeHref="/iskanje" />

      <JsonLd salon={salon} />

      <main className="min-h-[100svh] bg-[var(--color-bg)] pb-32 text-[var(--color-text)] lg:pb-24">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative">
          <div className="relative h-[480px] w-full overflow-hidden bg-[var(--color-bg-elev-2)] sm:h-[540px] lg:h-[600px]">
            {salon.coverUrl ? (
              <Image
                src={salon.coverUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ filter: "saturate(0.94) contrast(1.03)" }}
              />
            ) : null}
            {/* Top + bottom vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(14,20,17,0.55) 0%, rgba(14,20,17,0.10) 18%, rgba(14,20,17,0.0) 40%, rgba(14,20,17,0.65) 78%, rgba(8,16,13,0.96) 100%)",
              }}
            />

            {/* Top bar — back button (mobile + desktop) */}
            <div className="absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[1760px] items-center justify-between px-5 pt-5 sm:px-8 lg:hidden">
              <Link
                href="/"
                aria-label="Nazaj"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[rgba(14,20,17,0.55)] text-[#F2EEDE] backdrop-blur"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
              </Link>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Deli"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[rgba(14,20,17,0.55)] text-[#F2EEDE] backdrop-blur"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="18" cy="18" r="3" />
                    <path d="M8.5 10.5l7-3M8.5 13.5l7 3" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Shrani"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[rgba(14,20,17,0.55)] text-[#F2EEDE] backdrop-blur"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-4.5-7-11a4 4 0 017-2.5A4 4 0 0119 10c0 6.5-7 11-7 11z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop title overlay on hero (left-aligned) */}
            <div className="absolute inset-x-0 bottom-0 z-10 mx-auto hidden w-full max-w-[1760px] px-8 pb-10 lg:block">
              <div className="max-w-[820px]">
                {salon.tier === "premium" ? (
                  <div className="mb-3">
                    <GoldBadge />
                  </div>
                ) : null}
                <Eyebrow tone="accent">{location}</Eyebrow>
                <h1
                  className="mt-3 font-display font-normal leading-[0.98] text-[#F2EEDE]"
                  style={{
                    fontSize: "clamp(48px, 5.4vw, 76px)",
                    letterSpacing: "-0.035em",
                    textShadow: "0 2px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  {salon.name}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 font-body text-[14px] text-[rgba(236,230,214,0.85)]">
                  {salon.rating !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Stars rating={salon.rating} size={13} />
                      <span className="font-semibold text-[#F2EEDE]">
                        {salon.rating.toFixed(1)}
                      </span>
                      <span className="text-[rgba(236,230,214,0.6)]">·</span>
                      <span>{salon.reviewCount} ocen</span>
                    </span>
                  ) : (
                    <span className="text-[rgba(236,230,214,0.6)]">Brez ocen</span>
                  )}
                  {salon.priceFromCents !== null ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[rgba(236,230,214,0.6)]">Storitve od</span>
                      <span className="font-semibold text-[#F2EEDE]">
                        {formatPriceFrom(salon.priceFromCents)}
                      </span>
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {salon.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile title card — overlaps hero bottom */}
          <div className="relative z-10 mx-auto -mt-12 w-full max-w-[1760px] px-5 lg:hidden">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
              {salon.tier === "premium" ? (
                <div className="mb-3">
                  <GoldBadge />
                </div>
              ) : null}
              <h1
                className="font-display text-[28px] font-medium leading-[1.05] text-[var(--color-text)]"
                style={{ letterSpacing: "-0.02em" }}
              >
                {salon.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 font-body text-[12.5px] text-[var(--color-text-dim)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                {location}
              </p>
              <div className="mt-4 flex items-stretch gap-5 text-[12px] text-[var(--color-text-dim)]">
                <Stat label={`${salon.reviewCount} ocen`}>
                  {salon.rating !== null ? (
                    <span className="inline-flex items-center gap-1">
                      <Stars rating={salon.rating} size={12} />
                      <span className="ml-1 font-semibold text-[var(--color-text)]">
                        {salon.rating.toFixed(1)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[var(--color-text-faint)]">Brez ocen</span>
                  )}
                </Stat>
                <Divider />
                <Stat label="Storitev">
                  <span className="font-semibold text-[var(--color-text)]">
                    {salon.services.length}
                  </span>
                </Stat>
                <Divider />
                <Stat label="Od">
                  <span className="font-semibold text-[var(--color-text)]">
                    {formatPriceFrom(salon.priceFromCents) ?? "—"}
                  </span>
                </Stat>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content (2-col on desktop, single on mobile) ──────────── */}
        <section className="mx-auto mt-10 w-full max-w-[1760px] px-5 sm:px-8 lg:mt-16">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* Main column */}
            <div className="col-span-12 space-y-12 lg:col-span-8 lg:space-y-16">
              {salon.description ? (
                <SectionBlock issueNo="01" eyebrow="Predstavitev" title="Opis">
                  <p
                    className="max-w-[68ch] font-body text-[15px] leading-[1.6] text-[var(--color-text-dim)] lg:text-[16px]"
                    style={{ textWrap: "pretty" }}
                  >
                    {salon.description}
                  </p>
                </SectionBlock>
              ) : null}

              {salon.services.length > 0 ? (
                <SectionBlock
                  issueNo="02"
                  eyebrow={`${salon.services.length} storitev`}
                  title="Storitve"
                >
                  <ul className="mt-2 flex flex-col gap-3">
                    {salon.services.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-start justify-between gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4 transition-colors hover:border-[var(--color-border-strong)] sm:p-5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-3">
                            <h3
                              className="font-display text-[17px] font-medium text-[var(--color-text)] sm:text-[18px]"
                              style={{ letterSpacing: "-0.015em" }}
                            >
                              {s.name}
                            </h3>
                            <span className="font-body text-[11.5px] text-[var(--color-text-dim)]">
                              · {formatDuration(s.durationMin)}
                            </span>
                          </div>
                          {s.description ? (
                            <p className="mt-1.5 max-w-[58ch] font-body text-[13px] leading-[1.5] text-[var(--color-text-dim)]">
                              {s.description}
                            </p>
                          ) : null}
                        </div>
                        <div
                          className="flex-shrink-0 font-display text-[20px] font-medium leading-none text-[var(--color-text)] sm:text-[22px]"
                          style={{ letterSpacing: "-0.02em" }}
                        >
                          {formatPrice(s.priceCents)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </SectionBlock>
              ) : null}

              {salon.staff.length > 0 ? (
                <SectionBlock
                  issueNo="03"
                  eyebrow={`${salon.staff.length} ljudi`}
                  title="Ekipa"
                >
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {salon.staff.map((m) => (
                      <li
                        key={m.userId}
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-elev-2)]">
                            {m.avatarUrl ? (
                              <Image
                                src={m.avatarUrl}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="font-display text-[15px] font-medium text-[var(--color-text)]"
                              style={{ letterSpacing: "-0.01em" }}
                            >
                              {m.displayName}
                            </div>
                            <div className="font-body text-[11px] uppercase text-[var(--color-text-faint)]" style={{ letterSpacing: "0.18em" }}>
                              {m.role === "owner" ? "Lastnik" : "Stilist"}
                            </div>
                          </div>
                        </div>
                        {m.bio ? (
                          <p className="mt-3 font-body text-[12.5px] leading-[1.5] text-[var(--color-text-dim)]">
                            {m.bio}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </SectionBlock>
              ) : null}

              {salon.reviews.length > 0 ? (
                <SectionBlock
                  issueNo="04"
                  eyebrow={`${salon.reviewCount} ocen`}
                  title="Ocene"
                >
                  <ul className="flex flex-col gap-3">
                    {salon.reviews.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className="font-display text-[15px] font-medium text-[var(--color-text)]"
                            style={{ letterSpacing: "-0.01em" }}
                          >
                            {r.reviewerName}
                          </div>
                          <Stars rating={r.rating} size={12} />
                        </div>
                        <p
                          className="mt-2 font-body text-[14px] leading-[1.55] text-[var(--color-text-dim)]"
                          style={{ textWrap: "pretty" }}
                        >
                          {r.body}
                        </p>
                        <p className="mt-3 font-body text-[11px] uppercase text-[var(--color-text-faint)]" style={{ letterSpacing: "0.18em" }}>
                          {formatRelative(r.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </SectionBlock>
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="space-y-4 lg:sticky lg:top-24">
                {/* CTA card */}
                <div className="hidden rounded-2xl border border-[rgba(194,143,92,0.34)] bg-[var(--color-bg-elev)] p-5 shadow-[0_1px_0_rgba(216,172,126,0.16)_inset,0_22px_44px_-16px_rgba(194,143,92,0.24)] lg:block">
                  <Eyebrow tone="accent">Rezerviraj</Eyebrow>
                  <h2
                    className="mt-3 font-display text-[24px] font-normal leading-[1.1]"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Termin v <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>nekaj sekundah</em>
                  </h2>
                  <p className="mt-3 font-body text-[13px] leading-[1.55] text-[var(--color-text-dim)]">
                    Izberi storitev in čas, ki ti ustreza. Brez klicev, brez čakanja.
                  </p>
                  <BookingButton slug={salon.slug} className="mt-5" />
                  <p
                    className="mt-3 font-body text-[10.5px] uppercase text-[var(--color-text-faint)]"
                    style={{ letterSpacing: "0.18em" }}
                  >
                    Rezervacije so v pripravi
                  </p>
                </div>

                {/* Hours */}
                {salon.weeklyHours.length > 0 ? (
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5">
                    <Eyebrow tone="dim">Delovni čas</Eyebrow>
                    <ul className="mt-3 flex flex-col gap-2 font-body text-[13.5px]">
                      {WEEKDAYS.map((label, idx) => {
                        const h = salon.weeklyHours.find((x) => x.weekday === idx);
                        return (
                          <li
                            key={label}
                            className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0"
                          >
                            <span className="text-[var(--color-text)]">{label}</span>
                            <span className="font-medium text-[var(--color-text-dim)]">
                              {h
                                ? `${h.startsAt.slice(0, 5)} – ${h.endsAt.slice(0, 5)}`
                                : "Zaprto"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {/* Contact */}
                {(salon.phoneE164 || salon.email) ? (
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5">
                    <Eyebrow tone="dim">Kontakt</Eyebrow>
                    <ul className="mt-3 flex flex-col gap-2 font-body text-[13.5px]">
                      <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0">
                        <span className="text-[var(--color-text-dim)]">Naslov</span>
                        <span className="text-right text-[var(--color-text)]">
                          {salon.address}
                        </span>
                      </li>
                      {salon.phoneE164 ? (
                        <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0">
                          <span className="text-[var(--color-text-dim)]">Telefon</span>
                          <a
                            href={`tel:${salon.phoneE164}`}
                            className="text-[var(--color-text)] hover:text-[var(--color-gold)]"
                          >
                            {salon.phoneE164}
                          </a>
                        </li>
                      ) : null}
                      {salon.email ? (
                        <li className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0">
                          <span className="text-[var(--color-text-dim)]">E-pošta</span>
                          <a
                            href={`mailto:${salon.email}`}
                            className="text-[var(--color-text)] hover:text-[var(--color-gold)]"
                          >
                            {salon.email}
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="mx-auto mt-24 w-full max-w-[1760px] px-5 sm:px-8 lg:mt-32">
          <div className="border-t border-[var(--color-border)] pt-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <BrandMark size={28} />
                <div className="flex flex-col leading-tight">
                  <span
                    className="font-display text-[15px] font-medium text-[var(--color-text)]"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Lep
                    <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>o</em>
                  </span>
                  <Eyebrow tone="dim">Atelier · Slovenija</Eyebrow>
                </div>
              </div>
              <p className="font-body text-[11.5px] text-[var(--color-text-faint)]">
                © {new Date().getFullYear()} Lepo · Ljubljana · Vsi saloni so neodvisno preverjeni.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Mobile sticky CTA ─────────────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 px-5 pb-5 pt-3 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,20,17,0) 0%, rgba(14,20,17,0.94) 30%, rgba(14,20,17,1) 100%)",
        }}
      >
        <BookingButton slug={salon.slug} />
        <p
          className="mt-2 text-center font-body text-[10.5px] uppercase text-[var(--color-text-faint)]"
          style={{ letterSpacing: "0.18em" }}
        >
          Rezervacije so v pripravi
        </p>
      </div>
    </>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] text-[var(--color-text)]">{children}</span>
      <span className="text-[11px] text-[var(--color-text-dim)]">{label}</span>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="w-px bg-[var(--color-border)]" />;
}

function BookingButton({ slug, className }: { slug: string; className?: string }) {
  return (
    <Link
      href={`/rezervacija/${slug}`}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full font-body text-[14.5px] font-semibold transition-opacity hover:opacity-90 ${className ?? ""}`}
      style={{
        background: "var(--gradient-gold)",
        color: "#1A1209",
        boxShadow:
          "0 14px 30px -12px rgba(194,143,92,0.45), 0 1px 0 rgba(255,235,200,0.30) inset, 0 -1px 0 rgba(26,18,9,0.18) inset",
      }}
    >
      Rezerviraj termin
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

function SectionBlock({
  issueNo,
  eyebrow,
  title,
  children,
}: {
  issueNo: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span
          className="font-display text-[15px] italic leading-none text-[var(--color-gold)]"
          style={{ letterSpacing: "-0.01em" }}
          aria-hidden
        >
          № {issueNo}
        </span>
        <Eyebrow tone="dim">{eyebrow}</Eyebrow>
      </div>
      <h2
        className="mt-2 font-display text-[24px] font-normal leading-[1.05] sm:text-[28px] lg:text-[32px]"
        style={{ letterSpacing: "-0.03em" }}
      >
        {title}
      </h2>
      <div
        aria-hidden
        className="mt-4 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-gold) 0%, rgba(194,143,92,0.32) 40%, var(--color-border) 80%, transparent 100%)",
        }}
      />
      <div className="mt-6">{children}</div>
    </section>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / (24 * 60 * 60 * 1000));
  if (days < 1) return "Danes";
  if (days < 7) return `Pred ${days === 1 ? "1 dnem" : `${days} dnevi`}`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `Pred ${w === 1 ? "1 tednom" : `${w} tedni`}`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `Pred ${m === 1 ? "1 mesecem" : `${m} meseci`}`;
  }
  const y = Math.floor(days / 365);
  return `Pred ${y === 1 ? "1 letom" : `${y} leti`}`;
}

function JsonLd({ salon }: { salon: SalonDetail }) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: salon.name,
    image: salon.coverUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: (salon.address.split(",")[0] ?? salon.address).trim(),
      addressLocality: salon.city,
      addressCountry: "SI",
    },
    telephone: salon.phoneE164 ?? undefined,
    email: salon.email ?? undefined,
    priceRange: salon.priceFromCents ? `od ${formatPrice(salon.priceFromCents)}` : undefined,
    aggregateRating:
      salon.rating !== null && salon.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: salon.rating,
            reviewCount: salon.reviewCount,
            bestRating: 5,
          }
        : undefined,
    openingHoursSpecification: salon.weeklyHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schemaDay(h.weekday),
      opens: h.startsAt.slice(0, 5),
      closes: h.endsAt.slice(0, 5),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
