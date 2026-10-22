import { NextResponse } from "next/server";
import { getRole } from "@/lib/admin-auth";
import { listActiveOrders } from "@/lib/admin-orders-server";

export const dynamic = "force-dynamic";

// Active orders for the admin queue (used by realtime refetch + polling)
export async function GET() {
  const role = await getRole();
  if (!role) {
    return NextResponse.json({ error: "Silakan masuk dulu." }, { status: 401 });
  }

  try {
    const orders = await listActiveOrders();
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Gagal memuat pesanan." }, { status: 500 });
  }
}