import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminRole } from "@/lib/admin-guard";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const role = await getAdminRole();
  const db = createSupabaseAdminClient();

  const [categories, products, toppings] = await Promise.all([
    db.from("categories").select("id, name").order("sort_order"),
    db
      .from("products")
      .select(
        "id, category_id, name, description, price, price_large, image_url, is_available, is_best_seller, stock_note"
      )
      .order("name"),
    db.from("toppings").select("id, name, price, is_available").order("name"),
  ]);

  return (
    <ProductsManager
      role={role ?? "barista"}
      categories={categories.data ?? []}
      products={products.data ?? []}
      toppings={toppings.data ?? []}
    />
  );
}