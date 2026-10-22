import ContentManager, { type FaqRow } from "@/components/admin/ContentManager";
import { getAdminRole } from "@/lib/admin-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const role = await getAdminRole();

  if (role !== "owner") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h1 className="font-heading text-xl font-semibold text-ink">Konten</h1>
        <p className="mt-2 text-sm text-muted">Halaman ini hanya untuk Owner. Ganti peran lewat menu di header.</p>
      </div>
    );
  }

  const db = createSupabaseAdminClient();
  const [contentRes, faqRes] = await Promise.all([
    db.from("site_content").select("key,value"),
    db.from("faqs").select("id,question,answer,sort_order").order("sort_order", { ascending: true }),
  ]);

  if (contentRes.error || faqRes.error) {
    return (
      <div className="rounded-2xl border border-danger bg-surface p-6">
        <p className="text-sm text-danger">Gagal memuat konten. Muat ulang halaman.</p>
      </div>
    );
  }

  const initialContent: Record<string, unknown> = {};
  for (const row of contentRes.data ?? []) initialContent[row.key as string] = row.value;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Konten</h1>
        <p className="text-sm text-muted">Ubah teks di Beranda, Tentang, Lokasi, dan FAQ.</p>
      </div>
      <ContentManager initialContent={initialContent} initialFaqs={(faqRes.data ?? []) as FaqRow[]} />
    </div>
  );
}