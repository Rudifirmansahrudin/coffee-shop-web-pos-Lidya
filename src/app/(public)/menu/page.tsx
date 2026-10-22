import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MenuClient } from "@/components/menu/MenuClient";
import { CartBar } from "@/components/cart/CartBar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import type { MenuCategory, MenuProduct, MenuTopping } from "@/components/menu/types";

export const metadata: Metadata = {
  title: "Menu | Space Coffee and Matcha",
  description: "Pilih kopi, matcha, dan minuman favoritmu di Space Coffee and Matcha.",
};

interface MenuPageProps {
  searchParams: { meja?: string; promo?: string };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  // Only accept simple, safe values from the URL
  const tableNo = searchParams.meja && /^\d{1,3}$/.test(searchParams.meja) ? searchParams.meja : null;
  const promoCode =
    searchParams.promo && /^[A-Za-z0-9_-]{1,20}$/.test(searchParams.promo)
      ? searchParams.promo.toUpperCase()
      : null;

  const supabase = createSupabaseServerClient();
  const [catRes, prodRes, topRes] = await Promise.all([
    supabase.from("categories").select("id,name,slug,sort_order").order("sort_order"),
    supabase
      .from("products")
      .select(
        "id,category_id,name,description,price,price_large,image_url,is_available,is_best_seller,stock_note"
      )
      .order("name"),
    supabase.from("toppings").select("id,name,price").eq("is_available", true).order("price"),
  ]);

  const hasError = catRes.error || prodRes.error || topRes.error;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-44 pt-6 md:pb-24 lg:pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-space-navy md:text-3xl">Menu</h1>
        {tableNo && (
          <span className="inline-flex min-h-[32px] items-center rounded-full bg-matcha-soft px-3 text-sm font-semibold text-space-navy">
            Meja {tableNo}
          </span>
        )}
      </div>

      {promoCode && (
        <div
          role="note"
          className="mt-4 rounded-2xl border border-star-gold bg-surface p-4 text-sm text-ink"
        >
          <p className="font-semibold">Kode promo {promoCode} terbawa dari tautanmu.</p>
          <p className="mt-0.5 text-muted">Sebutkan kode ini ke kasir saat mengambil pesanan.</p>
        </div>
      )}

      {hasError ? (
        <div role="alert" className="mt-8 rounded-2xl border border-danger bg-surface p-6 text-center">
          <p className="font-heading text-base font-semibold text-ink">Menu belum bisa dimuat</p>
          <p className="mt-1 text-sm text-muted">
            Terjadi gangguan saat mengambil data. Coba muat ulang halaman sebentar lagi.
          </p>
        </div>
      ) : (
        <>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
            <div className="min-w-0">
              <MenuClient
                categories={(catRes.data ?? []) as MenuCategory[]}
                products={(prodRes.data ?? []) as MenuProduct[]}
                toppings={(topRes.data ?? []) as MenuTopping[]}
                tableNo={tableNo}
              />
            </div>
            <div className="mt-6 lg:mt-6">
              <CartSidebar />
            </div>
          </div>
          <CartBar />
        </>
      )}
    </main>
  );
}