"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import { CHECKOUT_COOKIE, checkoutCookieOptions, parseCheckoutCookie } from "@/lib/checkout/claim-cookie";
import { createCheckout, registerGateway, SettledOrderError } from "@/lib/payment/gateway";
import { registerMidtransGateway } from "@/lib/payment/midtrans";
import { initializeCheckout } from "@/lib/checkout/initialize-checkout";
import type { CheckoutAttemptRow } from "@/lib/checkout/initialize-types";
import { createProcessingPurchase } from "@/lib/checkout/create-processing-purchase";
import { resolveCheckoutPack } from "@/lib/checkout/pack-resolve";
import { createTrustedSupabaseClient } from "@/lib/supabase/service";

// Register the real provider adapter once per process (server-only import).
registerGateway(registerMidtransGateway);

/** Stored attempt for the cookie's stable attempt key; null when unknown. */
async function findAttemptByKey(attemptKey: string): Promise<CheckoutAttemptRow | null> {
  const trusted = createTrustedSupabaseClient();
  const { data } = await trusted
    .from("payment_attempts")
    .select("public_reference:purchases(public_reference), status, expires_at, order_id:provider_attempt_id, amount_minor, currency, provider")
    .eq("idempotency_key", attemptKey)
    .maybeSingle();
  if (!data) return null;
  const { public_reference, order_id, expires_at, ...rest } = data as {
    public_reference: string | { public_reference: string } | null;
    order_id: string | null;
    status: CheckoutAttemptRow["status"];
    expires_at: string;
    amount_minor: number;
    currency: string;
    provider: string;
  };
  const reference = typeof public_reference === "object" && public_reference !== null ? public_reference.public_reference : public_reference;
  if (!reference) return null;
  return {
    public_reference: reference,
    status: rest.status,
    claim_expires_at: expires_at,
    order_id,
    amount_minor: rest.amount_minor,
    currency: rest.currency,
    provider: rest.provider,
  };
}

/**
 * Submit checkout. Presentation-safe by contract: rejections are opaque reason
 * fragments; the cookie carries the raw claim; the database sees its hash only
 * (create_processing_purchase owns hashing). Returns the redirect-target state
 * for useActionState; error copy renders inline from the returned state.
 */
export async function submitCheckout(
  _prev: { error?: string; reconfirm?: boolean; redirectUrl?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; reconfirm?: boolean; unavailable?: boolean; redirectUrl?: string }> {
  const slug = String(formData.get("packSlug") ?? "").trim();
  if (!slug) return { error: "This checkout could not be started. Please open the Pack again." };

  const store = await cookies();
  const protocolSecure = (await headers()).get("x-forwarded-proto") === "https";
  const claimCookie = parseCheckoutCookie(store.get(CHECKOUT_COOKIE)?.value ?? null);

  // Server-authoritative pack resolution; archived/unknown packs refuse to sell.
  const pack = slug ? await resolveCheckoutPack(slug) : null;
  const decision = await initializeCheckout({
    pack: pack ? { id: pack.id, slug: pack.slug, title: pack.title, price_minor: pack.price_minor, currency: pack.currency } : null,
    findAttemptByKey,
    createPurchase: (input) => createProcessingPurchase(input),
    input: { buyerEmail: String(formData.get("email") ?? ""), reconfirmed: formData.get("reconfirm") === "1" },
    existingCookie: claimCookie,
  });

  if (decision.kind === "ready") {
    // Persist fresh claim material with the response; resume keeps the pair.
    if (decision.claim && (!claimCookie || claimCookie.claim !== decision.claim)) {
      store.set(CHECKOUT_COOKIE, `${decision.attemptKey}.${decision.claim}`, checkoutCookieOptions(protocolSecure));
    }
    try {
      const session = await createCheckout({
        publicReference: decision.reference,
        buyerEmail: decision.buyerEmail,
        amountMinor: decision.amountMinor,
        currency: decision.currency,
        attemptKey: decision.attemptKey,
      });
      return { redirectUrl: session.redirectUrl };
    } catch (error) {
      if (error instanceof SettledOrderError) {
        // ADR-0001 409 recovery: the order already settled at the provider —
        // no create, redirect to the purchase's own status route.
        return { redirectUrl: `/payment/success?ref=${encodeURIComponent(decision.reference)}` };
      }
      // Provider down/misconfigured: the attempt stays CREATED; a later submit
      // with the same stable pair resumes it instead of duplicating.
      return { error: "Payment could not be started right now. Your checkout is saved — try again in a moment." };
    }
  }

  if (decision.kind === "redirect-status") return { redirectUrl: `/payment/success?ref=${encodeURIComponent(decision.reference)}` };
  if (decision.kind === "unavailable") return { error: "This Pack is not purchasable right now.", unavailable: true };

  if (decision.kind === "invalid-email") return { error: "Enter the email the access link should go to." };
  if (decision.kind === "price-changed") return { error: "The price has changed since you started checkout. Submit again to confirm the latest price.", reconfirm: true };
  if (decision.kind === "email-conflict") return { error: "This checkout is already in progress with a different email. Open the Pack again to start a new checkout." };
  return { error: "Checkout could not be completed. Please try again." };
}
