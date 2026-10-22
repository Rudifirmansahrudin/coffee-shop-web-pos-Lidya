import "server-only";
import crypto from "crypto";
import midtransClient from "midtrans-client";

export type PaymentMode = "demo" | "sandbox";

export function getPaymentMode(): PaymentMode {
  return process.env.NEXT_PUBLIC_PAYMENT_MODE === "sandbox" ? "sandbox" : "demo";
}

export function createSnap() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not set");
  return new midtransClient.Snap({
    isProduction: false,
    serverKey,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  });
}

// signature_key = SHA512(order_id + status_code + gross_amount + serverKey)
export function isValidSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;
  const expected = crypto
    .createHash("sha512")
    .update(params.orderId + params.statusCode + params.grossAmount + serverKey)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(params.signatureKey);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Midtrans order_id is "<code>-<suffix>" (unique per attempt); order code is "SPC-XXXX"
export function buildMidtransOrderId(code: string): string {
  return `${code}-${Date.now().toString(36)}`;
}

export function orderCodeFromMidtransId(midtransOrderId: string): string {
  return midtransOrderId.split("-").slice(0, 2).join("-");
}