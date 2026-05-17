type StarsProps = {
  rating: number;
  size?: number;
};

/**
 * Copper star row. Filled for floor(rating), outlined for the rest.
 * Mirrors prototype Stars (components.jsx).
 */
export function Stars({ rating, size = 12 }: StarsProps) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex items-center gap-[1.5px]" aria-label={`Ocena ${rating} od 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < full ? "var(--color-gold)" : "none"}
          stroke="var(--color-gold)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        >
          <path d="M12 2.5l2.9 6.3 6.9.6-5.2 4.6 1.6 6.7L12 17.3 5.8 20.7l1.6-6.7L2.2 9.4l6.9-.6L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}
