import { z } from "zod";

export const orderIdSchema = z.string().uuid();

export const statusActionSchema = z.object({
  action: z.enum(["preparing", "ready", "completed", "cancelled"]),
});

export type StatusActionInput = z.infer<typeof statusActionSchema>;