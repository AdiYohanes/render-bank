import "server-only";

import { createTrustedSupabaseClient } from "../supabase/service";

import { createProcessingPurchaseWithClient } from "./create-processing-purchase.mjs";

export async function createProcessingPurchase(input: {
  buyerEmail: string;
  packId: string;
  provider: string;
}) {
  return createProcessingPurchaseWithClient(
    createTrustedSupabaseClient(),
    input,
  );
}
