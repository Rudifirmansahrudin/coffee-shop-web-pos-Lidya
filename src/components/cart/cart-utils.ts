const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Formats a number as "Rp 25.000". */
export function formatPrice(value: number): string {
  return rupiah.format(value).replace(/\u00A0/g, " ");
}

/** Shared style for the main matcha call-to-action link/button. */
export const checkoutButtonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-matcha px-6 text-base font-semibold text-space-navy transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy";