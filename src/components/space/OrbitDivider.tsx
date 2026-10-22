import { cn } from "@/lib/utils";

type Props = { className?: string };

export function OrbitDivider({ className }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      fill="none"
      className={cn("h-6 w-full text-line", className)}
    >
      <ellipse
        cx="200"
        cy="12"
        rx="196"
        ry="8"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="304" cy="18.5" r="2.5" fill="currentColor" className="text-star-gold" />
    </svg>
  );
}