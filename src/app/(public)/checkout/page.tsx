import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Space Coffee and Matcha",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}