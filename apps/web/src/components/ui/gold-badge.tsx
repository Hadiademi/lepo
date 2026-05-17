/**
 * Premium chip. Refined editorial: dot + word, no gradient.
 * Mirrors prototype GoldBadge (components.jsx).
 */
export function GoldBadge({ label = "Premium" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[4px] border border-[rgba(194,143,92,0.42)] bg-[rgba(194,143,92,0.10)] px-2 py-[3px] font-body text-[9.5px] font-bold uppercase leading-none text-[var(--color-gold)] backdrop-blur"
      style={{ letterSpacing: "0.16em" }}
    >
      <span
        aria-hidden
        className="inline-block h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[var(--color-gold)]"
        style={{ boxShadow: "0 0 6px rgba(194,143,92,0.65)" }}
      />
      {label}
    </span>
  );
}
