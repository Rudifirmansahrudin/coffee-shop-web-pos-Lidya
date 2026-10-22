import { z } from "zod";

export const CONTENT_KEYS = [
  "hero",
  "promo",
  "about",
  "opening_hours",
  "contact",
  "social",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export const contentSchema = z.object({
  key: z.enum(CONTENT_KEYS),
  value: z.unknown().refine((v) => v !== undefined, "Isi tidak boleh kosong"),
});

const faqFields = {
  question: z.string().trim().min(3, "Pertanyaan terlalu pendek").max(300),
  answer: z.string().trim().min(3, "Jawaban terlalu pendek").max(2000),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
};

export const faqCreateSchema = z.object(faqFields);
export const faqUpdateSchema = z.object({ id: z.string().uuid(), ...faqFields });
export const faqDeleteSchema = z.object({ id: z.string().uuid() });

export const demoActionSchema = z.object({
  action: z.enum(["confirm-pending", "seed-week", "reset"]),
});