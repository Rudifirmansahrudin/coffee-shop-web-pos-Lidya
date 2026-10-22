import { z } from "zod";

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

export const productSchema = z.object({
  category_id: z.string().uuid("Kategori wajib dipilih"),
  name: z.string().trim().min(1, "Nama wajib diisi").max(80),
  description: nullableText(300),
  price: z.number().int("Harga harus bilangan bulat").min(0),
  price_large: z.number().int().min(0).nullable(),
  image_url: nullableText(300),
  stock_note: nullableText(120),
  is_available: z.boolean(),
  is_best_seller: z.boolean(),
});

export const productUpdateSchema = productSchema.partial();

// Cashier and barista may only toggle availability
export const stockToggleSchema = z.object({ is_available: z.boolean() }).strict();

export const toppingSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(60),
  price: z.number().int().min(0),
  is_available: z.boolean(),
});

export const toppingUpdateSchema = toppingSchema.partial();
export const toppingToggleSchema = stockToggleSchema;