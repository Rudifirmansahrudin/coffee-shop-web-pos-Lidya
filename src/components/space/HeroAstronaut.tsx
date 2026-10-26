import Image from "next/image";
import { cn } from "@/lib/utils";
import { Ornament } from "@/components/space/Ornament";

type HeroAstronautProps = {
  className?: string;
  withOrnaments?: boolean;
};

// Hero illustration: transparent PNG of the astronaut holding a coffee cup.
// The outer box is wider than the astronaut so the ornaments float around it with a gap.
// Light mode: only the planet (readable on cream). Comet and rocket are pale art, dark mode only.
export function HeroAstronaut({ className, withOrnaments = true }: HeroAstronautProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[320px] md:max-w-[360px] lg:max-w-[420px]", className)}>
      {withOrnaments && (
        <>
          {/* Comet: top left (dark mode, md and up) */}
          <Ornament
            name="comet"
            width={70}
            speed={3}
            rotate={-8}
            className="hidden dark:md:block md:left-6 md:-top-6 lg:left-8"
          />
          {/* Planet: top right (both modes) */}
          <Ornament
            name="planet"
            width={100}
            speed={1}
            className="right-0 top-2 lg:-right-4 lg:w-auto"
          />
          {/* Rocket: bottom left (dark mode only) */}
          <Ornament
            name="rocket"
            width={46}
            speed={2}
            rotate={15}
            className="left-2 bottom-10 hidden dark:block lg:left-0"
          />
        </>
      )}
      <div className="mx-auto w-full max-w-[200px] md:max-w-[240px] lg:max-w-[290px]">
        <Image
          src="/ornaments/astro-hero.png"
          alt="Astronot lucu memegang segelas kopi"
          width={640}
          height={841}
          priority
          sizes="(min-width: 1024px) 290px, (min-width: 768px) 240px, 200px"
          className="h-auto w-full select-none"
        />
      </div>
    </div>
  );
}