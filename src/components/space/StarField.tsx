import { cn } from "@/lib/utils";

const MAX_STARS = 6;

// Static positions so the layout never shifts (no randomness)
const STARS = [
  { top: "12%", left: "8%", size: 10 },
  { top: "22%", left: "84%", size: 14 },
  { top: "58%", left: "93%", size: 8 },
  { top: "74%", left: "12%", size: 12 },
  { top: "8%", left: "58%", size: 8 },
  { top: "86%", left: "68%", size: 10 },
];

type Props = { count?: number; className?: string };

export function StarField({ count = 5, className }: Props) {
  const stars = STARS.slice(0, Math.min(Math.max(count, 0), MAX_STARS));

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {stars.map((star, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          width={star.size}
          height={star.size}
          fill="currentColor"
          className="absolute text-star-gold"
          style={{ top: star.top, left: star.left }}
        >
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z" />
        </svg>
      ))}
    </div>
  );
}