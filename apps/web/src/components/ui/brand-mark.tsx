import { cn } from "@/lib/cn";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

/**
 * The atelier mark — gold gradient tile with italic Fraunces "L".
 * Use sizes 28-48 in headers, 82 for the splash.
 */
export function BrandMark({ size = 36, className }: BrandMarkProps) {
  return (
    <div
      className={cn("flex flex-shrink-0 items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, Math.round(size * 0.17)),
        background: "var(--gradient-gold)",
        boxShadow:
          "0 8px 22px -10px rgba(194,143,92,0.55), 0 1px 0 rgba(255,230,196,0.4) inset, 0 -1px 0 rgba(26,18,9,0.2) inset, 0 0 0 1px rgba(194,143,92,0.22)",
      }}
      aria-label="Lepo"
    >
      <span
        aria-hidden
        className="font-display italic leading-none"
        style={{
          fontSize: Math.round(size * 0.68),
          fontWeight: 500,
          color: "#1A1209",
          letterSpacing: "-0.04em",
          textShadow: "0 1px 0 rgba(255,230,196,0.18)",
        }}
      >
        L
      </span>
    </div>
  );
}
