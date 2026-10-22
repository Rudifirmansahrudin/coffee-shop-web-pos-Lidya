import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client for tracking API routes (server only).
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env variables");
  return createClient(url, key, { auth: { persistSession: false } });
}

export const ORDER_CODE_REGEX = /^SPC-[A-Z0-9]{4}$/;