import { BottomNav } from "@/components/ui/bottom-nav";
import { BrandMark } from "@/components/ui/brand-mark";
import { CategoryPills } from "@/components/ui/category-pills";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PremiumCard } from "@/components/ui/premium-card";
import { SalonCard } from "@/components/ui/salon-card";
import { SalonRow } from "@/components/ui/salon-row";
import { SearchInput } from "@/components/ui/search-input";
import { SiteHeader } from "@/components/ui/site-header";
import { listSalons } from "@/lib/queries";

export const revalidate = 300;

export default async function HomePage() {
  const salons = await listSalons();
  const premium = salons.filter((s) => s.tier === "premium");
  const standard = salons.filter((s) => s.tier !== "premium");

  const today = new Date();
  const issueLabel = today
    .toLocaleDateString("sl-SI", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <>
      <SiteHeader activeHref="/" />

      <main className="min-h-[100svh] bg-[var(--color-bg)] pb-28 text-[var(--color-text)] lg:pb-20">
        {/* ── Mobile inline header (location + greeting + bell) ── */}
        <section className="px-5 pt-8 lg:hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-body text-[12px] font-medium text-[var(--color-text-dim)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Ljubljana, Slovenija
              </div>
              <h1
                className="mt-1.5 font-display text-[30px] font-normal leading-[1.05] text-[var(--color-text)]"
                style={{ letterSpacing: "-0.03em" }}
              >
                Pozdravljen
                <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>!</em>
              </h1>
            </div>
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elev)]"
              aria-label="Obvestila"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
              </svg>
              <span
                aria-hidden
                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[var(--color-bg-elev)]"
                style={{ background: "var(--color-error)" }}
              />
            </button>
          </div>

          <div className="mt-5">
            <SearchInput placeholder="Poišči frizerja..." />
          </div>

          <div className="mt-4">
            <CategoryPills />
          </div>
        </section>

        {/* ── Desktop masthead — print-issue catalog header ───────────────
            One elegant title line, dated issue strip, and a tight
            functional band (search + filter chips). No marketing splash. */}
        <section className="mx-auto hidden w-full max-w-[1760px] px-8 pt-10 lg:block">
          {/* Issue strip */}
          <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-2.5">
            <Eyebrow tone="dim">Atelier · Slovenija · Ljubljana</Eyebrow>
            <span
              className="font-body text-[10.5px] font-medium uppercase text-[var(--color-text-faint)]"
              style={{ letterSpacing: "0.22em" }}
            >
              No. {today.getFullYear()} · {issueLabel}
            </span>
          </div>

          {/* Masthead — title left, action band right */}
          <div className="mt-10 grid grid-cols-12 items-end gap-10">
            <header className="col-span-12 xl:col-span-7">
              <Eyebrow tone="accent">Rezerviraj termin za lepoto</Eyebrow>
              <h1
                className="mt-3 font-display font-normal text-[var(--color-text)]"
                style={{
                  fontSize: "clamp(40px, 4.4vw, 60px)",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.02,
                }}
              >
                Saloni za{" "}
                <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>lepoto</em>
                ,
                <br />
                izbrani z roko.
              </h1>
              <p
                className="mt-4 max-w-[56ch] font-body text-[14.5px] leading-[1.55] text-[var(--color-text-dim)]"
                style={{ textWrap: "pretty" }}
              >
                {salons.length} vrhunskih frizerskih in kozmetičnih salonov po Sloveniji.
                Rezerviraj termin v nekaj sekundah — brez klicev, brez čakanja.
              </p>
            </header>

            <aside className="col-span-12 flex flex-col gap-3 xl:col-span-5">
              <SearchInput />
              <div className="flex items-center justify-between gap-4">
                <CategoryPills variant="inline" />
              </div>
            </aside>
          </div>
        </section>

        {/* ── TOP saloni (premium tier) ─────────────────────────────────── */}
        {premium.length > 0 ? (
          <section className="mt-12 lg:mt-16">
            <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8">
              <SectionHeader
                issueNo="01"
                eyebrow="Izbrano"
                title="TOP"
                titleAccent="saloni"
                action="Prikaži vse"
              />
            </div>
            <div className="mx-auto mt-6 w-full max-w-[1760px] overflow-x-auto px-5 pb-2 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ol className="flex min-w-max gap-4 lg:gap-5">
                {premium.map((s, i) => (
                  <li key={s.id}>
                    <PremiumCard salon={s} rank={i + 1} priority={i < 2} />
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {/* ── Saloni v bližini (standard tier) ───────────────────────────
            Mobile: vertical compact rows (prototype-parity).
            Desktop: grid of vertical cards. */}
        {standard.length > 0 ? (
          <section className="mt-12 lg:mt-20">
            <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8">
              <SectionHeader
                issueNo="02"
                eyebrow="V bližini"
                title="Saloni"
                titleAccent="v Ljubljani"
                action={`Vseh ${standard.length} salonov`}
              />
            </div>

            {/* Mobile: rows */}
            <div className="mx-auto mt-6 flex w-full max-w-[1760px] flex-col gap-3 px-5 sm:hidden">
              {standard.map((s) => (
                <SalonRow key={s.id} salon={s} />
              ))}
            </div>

            {/* Tablet+: grid */}
            <ul className="mx-auto mt-6 hidden w-full max-w-[1760px] grid-cols-2 gap-5 px-5 sm:grid sm:px-8 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {standard.map((s, i) => (
                <li key={s.id}>
                  <SalonCard salon={s} priority={i < 3} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Footer (colophon) ──────────────────────────────────────────
            Print-style colophon. Keeps the magazine metaphor consistent. */}
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
                © {today.getFullYear()} Lepo · Ljubljana · Vsi saloni so neodvisno preverjeni.
              </p>
            </div>
          </div>
        </footer>
      </main>

      <BottomNav activeHref="/" />
    </>
  );
}

function SectionHeader({
  issueNo,
  eyebrow,
  title,
  titleAccent,
  action,
}: {
  issueNo?: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  action?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          {issueNo ? (
            <span
              className="font-display text-[15px] italic leading-none text-[var(--color-gold)]"
              style={{ letterSpacing: "-0.01em" }}
              aria-hidden
            >
              № {issueNo}
            </span>
          ) : null}
          <Eyebrow tone={issueNo ? "dim" : "accent"}>{eyebrow}</Eyebrow>
        </div>
        {action ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 font-body text-[12.5px] font-medium text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
          >
            {action}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ) : null}
      </div>
      <h2
        className="mt-2 font-display text-[24px] font-normal leading-[1.05] sm:text-[30px] lg:text-[36px]"
        style={{ letterSpacing: "-0.03em" }}
      >
        {title}
        {titleAccent ? (
          <>
            {" "}
            <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>
              {titleAccent}
            </em>
          </>
        ) : null}
      </h2>
      <div
        aria-hidden
        className="mt-4 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-gold) 0%, rgba(194,143,92,0.32) 40%, var(--color-border) 80%, transparent 100%)",
        }}
      />
    </div>
  );
}
