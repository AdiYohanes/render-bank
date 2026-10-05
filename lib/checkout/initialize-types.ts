export type CheckoutDecision =
  | { kind: "ready"; attemptKey: string; claim: string; reference: string; claimExpiresAt: string; packTitle: string; amountMinor: number; currency: string; buyerEmail: string; resumed?: boolean }
  | { kind: "redirect-status"; reference: string }
  | { kind: "unavailable" | "invalid-email" | "price-changed" | "email-conflict" | "checkout-failed" };

export type CheckoutPackInput = {
  id: string;
  slug: string;
  title: string;
  price_minor: number;
  currency: string;
};

export type CheckoutAttemptRow = {
  public_reference: string;
  status: "CREATED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "EXPIRED";
  claim_expires_at: string;
  order_id: string | null;
  amount_minor: number;
  currency: string;
  provider: string;
};

export type CheckoutPurchaseResult = {
  publicReference: string;
  claimExpiresAt: string;
};

export type CheckoutInput = { buyerEmail: string; reconfirmed?: boolean };

export type CheckoutCookiePair = { claim: string; attemptKey: string } | null;
