// Checkout submit orchestration is implemented in plain JavaScript so Node's
// test runner exercises the same code.
import type { CheckoutAttemptRow, CheckoutDecision, CheckoutPackInput, CheckoutPurchaseResult } from "./initialize-types";

import { initializeCheckout as initializeCheckoutWithClient } from "./initialize-checkout.mjs";

export async function initializeCheckout({
  pack,
  findAttemptByKey,
  createPurchase,
  input,
  existingCookie,
}: {
  pack: CheckoutPackInput | null;
  findAttemptByKey: (attemptKey: string) => Promise<CheckoutAttemptRow | null>;
  createPurchase: (input: { buyerEmail: string; packId: string; provider: string; attemptKey: string; checkoutClaim: string }) => Promise<CheckoutPurchaseResult>;
  input: { buyerEmail: string; reconfirmed?: boolean };
  existingCookie: { claim: string; attemptKey: string } | null;
}): Promise<CheckoutDecision> {
  return initializeCheckoutWithClient({ pack, findAttemptByKey, createPurchase, input, existingCookie }) as Promise<CheckoutDecision>;
}
