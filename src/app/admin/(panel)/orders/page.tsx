import { redirect } from "next/navigation";
import { getRole } from "@/lib/admin-auth";
import { listActiveOrders } from "@/lib/admin-orders-server";
import { OrdersBoard } from "@/components/admin/orders/OrdersBoard";
import { normalizeRole, type AdminOrder } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pesanan | Mission Control" };

export default async function AdminOrdersPage() {
  const role = normalizeRole(await getRole());
  if (!role) redirect("/admin/login");

  let orders: AdminOrder[] = [];
  let loadError = false;
  try {
    orders = await listActiveOrders();
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-space-navy">Antrean Pesanan</h1>
        <p className="text-sm text-muted">Pesanan dipanggil lewat nama panggilan di kasir.</p>
      </div>
      <OrdersBoard initialOrders={orders} role={role} initialError={loadError} />
    </div>
  );
}