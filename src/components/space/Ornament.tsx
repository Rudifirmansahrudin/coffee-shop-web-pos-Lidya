import Image from "next/image";
import { cn } from "@/lib/utils";

const ORNAMENTS = {
  astronaut: { src: "/ornaments/astronaut.png", w: 370, h: 270 },
  rocket: { src: "/ornaments/rocket.png", w: 120, h: 180 },
  comet: { src: "/ornaments/comet.png", w: 240, h: 215 },
  planet: { src: "/ornaments/planet-ring.png", w: 258, h: 155 },
  "ufo-dome": { src: "/ornaments/ufo-dome.png", w: 205, h: 175 },
  "ufo-ship": { src: "/ornaments/ufo-ship.png", w: 190, h: 120 },
} as const;

export type OrnamentName = keyof typeof ORNAMENTS;

type Props = {
  name: OrnamentName;
  /** Rendered width in px (height follows the image ratio) */
  width?: number;
  /** Position it with className, e.g. "right-4 top-6". Parent must be `relative`. */
  className?: string;
  /** Slow floating motion, dark mode only */
  float?: boolean;
};

// Decorative only: light mode = faint silhouette watermark, dark mode = full art
export function Ornament({ name, width = 120, className, float = true }: Props) {
  const item = ORNAMENTS[name];

  return (
    <Image
      src={item.src}
      alt=""
      aria-hidden="true"
      width={item.w}
      height={item.h}
      sizes={`${width}px`}
      style={{ width, height: "auto" }}
      className={cn(
        "pointer-events-none absolute select-none brightness-0 opacity-10 dark:brightness-100 dark:opacity-90",
        float && "motion-safe:dark:animate-float",
        className
      )}
    />
  );
}