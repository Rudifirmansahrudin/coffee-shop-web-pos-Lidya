import { NextResponse } from "next/server";
import { getServiceClient, ORDER_CODE_REGEX } from "@/lib/track-db";
import { reviewSchema } from "@/lib/validators/review";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  if (!ORDER_CODE_REGEX.test(code)) {
    return NextResponse.json({ error: "Kode pesanan tidak valid." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  try {
    const db = getServiceClient();
    const { data: order } = await db
      .from("orders")
      .select("id, status")
      .eq("code", code)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.status !== "completed") {
      return NextResponse.json(
        { error: "Rating bisa diisi setelah pesanan selesai." },
        { status: 409 }
      );
    }

    const { error } = await db.from("reviews").insert({
      order_id: order.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    if (error) {
      // Unique violation: this order already has a review
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Kamu sudah memberi rating untuk pesanan ini." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan rating. Coba lagi." },
      { status: 500 }
    );
  }
}