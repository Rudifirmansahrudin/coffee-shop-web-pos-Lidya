import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Only the complete PNGs are used. "planet" is an inline SVG (the PNG was cropped).
const IMAGES = {
  rocket: { src: "/ornaments/rocket.png", w: 120, h: 180 },
  comet: { src: "/ornaments/comet.png", w: 240, h: 215 },
  "ufo-dome": { src: "/ornaments/ufo-dome.png", w: 205, h: 175 },
} as const;

export type OrnamentName = "planet" | keyof typeof IMAGES;

type Props = {
  name: OrnamentName;
  /** Rendered width in px (height follows the aspect ratio) */
  width?: number;
  /** Position it with className, e.g. "right-4 top-6". Parent must be `relative`. */
  className?: string;
  /** Slow floating motion, dark mode only */
  float?: boolean;
  /** Float speed variant: 1 = 7s, 2 = 9s, 3 = 11s (desync several ornaments) */
  speed?: 1 | 2 | 3;
  /** Base tilt in degrees */
  rotate?: number;
};

// Banded planet with a tilted ring. No spots, so it never reads as a germ at small sizes.
function PlanetArt({ width, rotate, className }: { width: number; rotate: number; className: string }) {
  return (
    <svg
      viewBox="0 0 160 100"
      aria-hidden="true"
      focusable="false"
      style={{ width, aspectRatio: "8 / 5", "--r": `${rotate}deg` } as CSSProperties}
      className={className}
    >
      <defs>
        <clipPath id="planet-body-clip">
          <circle cx="80" cy="50" r="27" />
        </clipPath>
      </defs>
      <g transform="rotate(-18 80 50)">
        {/* back half of the ring (hidden behind the planet body) */}
        <path
          d="M8 50 A72 15 0 0 1 152 50"
          fill="none"
          className="stroke-star-gold"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* planet body: solid matcha with darker bands, readable on cream and on dark */}
        <circle cx="80" cy="50" r="27" className="fill-matcha" />
        <g clipPath="url(#planet-body-clip)">
          <rect x="50" y="36" width="60" height="7" className="fill-navy-bg" opacity="0.35" />
          <rect x="50" y="50" width="60" height="5" className="fill-navy-bg" opacity="0.2" />
          <rect x="50" y="62" width="60" height="9" className="fill-navy-bg" opacity="0.35" />
        </g>
        <circle cx="80" cy="50" r="27" fill="none" className="stroke-ink" strokeWidth="3" />
        {/* front half of the ring (crosses in front of the planet) */}
        <path
          d="M8 50 A72 15 0 0 0 152 50"
          fill="none"
          className="stroke-star-gold"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// Decorative only. Full opacity in both themes; a soft shadow keeps pale art visible on cream.
export function Ornament({
  name,
  width = 120,
  className,
  float = true,
  speed = 1,
  rotate = 0,
}: Props) {
  const classes = cn(
    "pointer-events-none absolute select-none drop-shadow-[0_2px_5px_rgba(15,27,61,0.45)] dark:drop-shadow-none",
    float && "orn-float",
    float && speed === 2 && "orn-s2",
    float && speed === 3 && "orn-s3",
    className
  );

  if (name === "planet") {
    return <PlanetArt width={width} rotate={rotate} className={classes} />;
  }

  const item = IMAGES[name];

  return (
    <Image
      src={item.src}
      alt=""
      aria-hidden="true"
      width={item.w}
      height={item.h}
      sizes={`${width}px`}
      style={{ width, height: "auto", "--r": `${rotate}deg` } as CSSProperties}
      className={classes}
    />
  );
}