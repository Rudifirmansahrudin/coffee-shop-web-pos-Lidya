import { Check } from "lucide-react";
import { STEPS, type OrderStatus } from "@/lib/order-status";

export function StatusStepper({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol
      className="flex flex-col lg:flex-row"
      aria-label="Status pesanan"
    >
      {STEPS.map((step, i) => {
        const done = i < currentIndex || status === "completed";
        const current = i === currentIndex && status !== "completed";
        const isLast = i === STEPS.length - 1;

        return (
          <li
            key={step.key}
            aria-current={current ? "step" : undefined}
            className="relative flex gap-3 pb-6 last:pb-0 lg:flex-1 lg:flex-col lg:items-center lg:gap-2 lg:pb-0"
          >
            {/* Connector line: vertical on mobile, horizontal on lg */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={[
                  "absolute left-4 top-8 h-full w-0.5 -translate-x-1/2",
                  "lg:left-1/2 lg:top-4 lg:h-0.5 lg:w-full lg:translate-x-0 lg:-translate-y-1/2",
                  done ? "bg-matcha" : "bg-line",
                ].join(" ")}
              />
            )}

            <span
              className={[
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                done
                  ? "bg-matcha text-space-navy"
                  : current
                  ? "bg-matcha-soft text-space-navy ring-2 ring-matcha"
                  : "bg-line text-muted",
              ].join(" ")}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
            </span>

            <span
              className={[
                "pt-1 text-sm lg:pt-0 lg:text-center",
                current ? "font-semibold text-ink" : done ? "text-ink" : "text-muted",
              ].join(" ")}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}