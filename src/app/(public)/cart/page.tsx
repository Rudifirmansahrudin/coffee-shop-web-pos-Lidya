import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Keranjang | Space Coffee and Matcha",
  description: "Periksa pesananmu sebelum checkout di Space Coffee and Matcha.",
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-6 md:pb-12">
      <h1 className="font-heading text-2xl font-bold text-space-navy md:text-3xl">Keranjang</h1>
      <CartView />
    </main>
  );
}