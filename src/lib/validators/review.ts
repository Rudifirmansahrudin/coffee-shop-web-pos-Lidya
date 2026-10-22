import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Pilih rating 1-5").max(5),
  comment: z
    .string()
    .trim()
    .max(500, "Komentar maksimal 500 karakter")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type ReviewInput = z.input<typeof reviewSchema>;