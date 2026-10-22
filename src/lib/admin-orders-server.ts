import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ACTIVE_STATUSES, type AdminOrder } from "@/lib/admin-orders";

// Must match the event name that the /track page listens to (see src/lib/track-db.ts)
export const TRACK_EVENT = "status";

export async function listActiveOrders(): Promise<AdminOrder[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("orders")
    .select(
      "id, code, customer_name, total, status, note, is_dummy, created_at, order_items(id, name, size, toppings, price, qty, note)"
    )
    .in("status", [...ACTIVE_STATUSES])
    .order("created_at", { ascending: true }) // oldest first = FIFO queue
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminOrder[];
}

// Best-effort broadcast to the customer tracking channel order:<code> (server side, REST).
export async function broadcastOrderUpdate(code: string, status: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `order:${code}`,
            event: TRACK_EVENT,
            payload: { code, status },
            private: false,
          },
        ],
      }),
      cache: "no-store",
    });
  } catch {
    // Ignore: the track page also polls every 15 seconds
  }
}