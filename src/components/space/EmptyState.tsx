import Link from "next/link";
import { AstronautHero } from "@/components/space/AstronautHero";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-10 text-center",
        className
      )}
    >
      <AstronautHero className="h-32 w-auto max-w-none" />
      <h2 className="mt-4 font-heading text-lg font-semibold text-space-navy">{title}</h2>
      {description ? <p className="mt-1 max-w-sm text-muted">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-matcha px-6 font-semibold text-space-navy"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}