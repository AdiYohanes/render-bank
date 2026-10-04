import "server-only";

import { createTrustedSupabaseClient } from "@/lib/supabase/service";

import { midtransConfig, midtransCreateCheckout, midtransOrderId, midtransSignature } from "./midtrans.mjs";

export { midtransConfig, midtransOrderId, midtransSignature };

export function midtransBindAttempt() {
  const trusted = createTrustedSupabaseClient();
  return async (attemptKey: string, provider: string, orderId: string) => {
    const { error } = await trusted.rpc("bind_provider_attempt", {
      p_attempt_key: attemptKey,
      p_provider: provider,
      p_order_id: orderId,
    });
    if (error) throw new Error("Provider attempt binding failed");
  };
}

/**
 * The real PaymentGateway.createCheckout wiring (registered at server start).
 */
export function registerMidtransGateway(): (input: {
  publicReference: string;
  buyerEmail: string;
  amountMinor: number;
  currency: string;
  attemptKey: string;
}) => Promise<{ redirectUrl: string }> {
  return async ({ attemptKey, ...input }) => {
    const { redirectUrl } = await midtransCreateCheckout(
      { ...input, attemptKey },
      { bindAttempt: midtransBindAttempt(), env: process.env },
    );
    return { redirectUrl };
  };
}
