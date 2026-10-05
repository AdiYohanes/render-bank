import "server-only";

import { createTrustedSupabaseClient } from "@/lib/supabase/service";

import { lookupPaymentStatusWithClient } from "./status-lookup.mjs";
import type { StatusView } from "./status-resolve.mjs";

export type { StatusView };

export async function lookupPaymentStatus(reference: string | null | undefined): Promise<StatusView> {
  return lookupPaymentStatusWithClient(reference, createTrustedSupabaseClient) as Promise<StatusView>;
}
