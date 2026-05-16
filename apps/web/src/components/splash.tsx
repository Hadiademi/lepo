/**
 * Splash — the first paint a user sees.
 * Ported from /barber-slovenia/screens-1.jsx::SplashScreen (the design source of truth).
 * Mobile-first: looks identical to the prototype on 390×844; on wider viewports the
 * gold glow expands and the lockup centers without changing the type rhythm.
 */
export default function Splash() {
  return (
    <main
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden text-[#ECE6D6]"
      style={{ background: "var(--gradient-bg-splash)" }}
    >
      {/* Ambient gold glow (top) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[18%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[40px]"
        style={{
          background: "radial-gradient(circle, rgba(194,143,92,0.4) 0%, transparent 60%)",
        }}
      />
      {/* Ambient gold glow (bottom-right) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] bottom-[8%] h-[300px] w-[300px] rounded-full blur-[40px]"
        style={{
          background: "radial-gradient(circle, rgba(194,143,92,0.25) 0%, transparent 60%)",
        }}
      />

      <section className="relative z-10 flex flex-col items-center text-center">
        {/* Atelier mark — gold gradient tile with italic "L" */}
        <div
          className="mb-8 flex h-[82px] w-[82px] items-center justify-center rounded-[14px]"
          style={{
            background: "var(--gradient-gold)",
            boxShadow: "var(--shadow-gold)",
          }}
        >
          <span
            aria-hidden
            className="font-display leading-none italic"
            style={{
              fontSize: 56,
              fontWeight: 500,
              color: "#1A1209",
              letterSpacing: "-0.04em",
              textShadow: "0 1px 0 rgba(255,230,196,0.18)",
            }}
          >
            L
          </span>
        </div>

        {/* Eyebrow */}
        <p
          className="font-body uppercase"
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "rgba(194,143,92,0.86)",
            letterSpacing: "0.34em",
            marginBottom: 10,
          }}
        >
          Atelier · Slovenija
        </p>

        {/* Wordmark — Lepo with italic gold "o" */}
        <h1
          className="font-display"
          style={{
            fontSize: 68,
            fontWeight: 400,
            letterSpacing: "-0.045em",
            margin: 0,
            lineHeight: 0.95,
          }}
        >
          Lep
          <em style={{ fontStyle: "italic", color: "#C28F5C" }}>o</em>
        </h1>

        {/* Subtitle */}
        <p
          className="font-body"
          style={{
            fontSize: 14,
            color: "rgba(236,230,214,0.6)",
            marginTop: 18,
            letterSpacing: "0.02em",
            maxWidth: 260,
            lineHeight: 1.5,
          }}
        >
          Rezerviraj termin za lepoto
          <br />
          <span style={{ color: "rgba(236,230,214,0.38)", fontSize: 12 }}>
            v vrhunskih salonih po Sloveniji
          </span>
        </p>

        {/* 3-dot pulse loader */}
        <div className="mt-24 flex items-center justify-center gap-1.5" aria-label="Nalaganje">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "#C28F5C",
              animation: "lepo-pulse 1.4s ease-in-out infinite",
            }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "rgba(194,143,92,0.5)",
              animation: "lepo-pulse 1.4s ease-in-out 0.2s infinite",
            }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "rgba(194,143,92,0.3)",
              animation: "lepo-pulse 1.4s ease-in-out 0.4s infinite",
            }}
          />
        </div>
      </section>
    </main>
  );
}
