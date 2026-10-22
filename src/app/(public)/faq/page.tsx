import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FaqChatbot from "@/components/faq/FaqChatbot";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang sering diajukan seputar pemesanan, pembayaran, dan lokasi Space Coffee and Matcha.",
};

export const revalidate = 60;

type Faq = { id: string; question: string; answer: string };

async function getFaqs(): Promise<{ faqs: Faq[]; failed: boolean }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer")
      .order("sort_order", { ascending: true });
    if (error) return { faqs: [], failed: true };
    return { faqs: (data ?? []) as Faq[], failed: false };
  } catch {
    return { faqs: [], failed: true };
  }
}

export default async function FaqPage() {
  const { faqs, failed } = await getFaqs();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:py-12">
      <h1 className="font-heading text-2xl font-bold text-space-navy md:text-3xl">
        Pertanyaan yang Sering Diajukan
      </h1>
      <p className="mt-2 text-muted">Tidak menemukan jawabannya? Tanya asisten kami.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <section aria-label="Daftar FAQ" className="space-y-3">
          {failed ? (
            <p className="rounded-2xl border border-line bg-surface p-4 text-ink">
              FAQ belum bisa dimuat. Coba muat ulang halaman sebentar lagi.
            </p>
          ) : faqs.length === 0 ? (
            <p className="rounded-2xl border border-line bg-surface p-4 text-ink">
              Belum ada FAQ. Silakan gunakan asisten atau hubungi kedai.
            </p>
          ) : (
            faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-2xl border border-line bg-surface open:border-matcha"
              >
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-xl text-matcha transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 leading-relaxed text-ink">{faq.answer}</p>
              </details>
            ))
          )}
        </section>

        <div className="lg:sticky lg:top-24">
          <FaqChatbot />
        </div>
      </div>
    </div>
  );
}