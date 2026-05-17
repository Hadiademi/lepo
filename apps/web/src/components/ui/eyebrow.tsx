import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  tone?: "accent" | "dim";
  className?: string;
};

/**
 * Editorial small-caps label. Used above section titles and on chips.
 * Mirrors prototype Eyebrow (components.jsx): 10px / 600 / 0.18em tracking.
 */
export function Eyebrow({ children, tone = "dim", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-block font-body text-[10px] font-semibold uppercase",
        tone === "accent" ? "text-[var(--color-gold)]" : "text-[var(--color-text-dim)]",
        className,
      )}
      style={{ letterSpacing: "0.18em" }}
    >
      {children}
    </span>
  );
}
