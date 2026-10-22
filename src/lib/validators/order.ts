import { z } from "zod";

// Indonesian mobile numbers: 08xx, 628xx, +628xx
const PHONE_RE = /^(\+62|62|0)8[1-9]\d{6,11}$/;

const phoneSchema = z
  .string()
  .trim()
  .max(20)
  .optional()
  .transform((v) => (v ?? "").replace(/[\s-]/g, ""))
  .refine((v) => v === "" || PHONE_RE.test(v), {
    message: "Nomor WhatsApp tidak valid. Contoh: 081234567890",
  })
  .transform((v) => (v === "" ? null : v.replace(/^(\+62|0)/, "62")));

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  size: z.enum(["REG", "LRG"]),
  toppingIds: z.array(z.string().uuid()).max(10),
  qty: z.number().int().min(1).max(20),
  note: z.string().trim().max(120).optional(),
});

export const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Nama panggilan minimal 2 huruf")
    .max(40, "Nama panggilan maksimal 40 karakter"),
  customerPhone: phoneSchema,
  note: z
    .string()
    .trim()
    .max(200, "Catatan maksimal 200 karakter")
    .optional()
    .transform((v) => (v ? v : null)),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Kamu perlu menyetujui kebijakan privasi" }),
  }),
  items: z
    .array(orderItemSchema)
    .min(1, "Keranjang masih kosong")
    .max(30, "Terlalu banyak item"),
});

export type OrderInput = z.input<typeof orderSchema>;
export type OrderParsed = z.output<typeof orderSchema>;