// @ts-check
import { createHash } from "node:crypto";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const randomUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const providerName = /^[a-z][a-z0-9_-]{1,63}$/;
const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const claimFormat = /^[A-Za-z0-9_-]{43}$/;

/**
 * @param {import('@supabase/supabase-js').SupabaseClient<import('../supabase/database.types').Database>} client
 * @param {{ buyerEmail: string, packId: string, provider: string, attemptKey: string, checkoutClaim: string }} input
 */
export async function createProcessingPurchaseWithClient(client, input) {
  if (!input || Object.keys(input).some((key) => !["buyerEmail", "packId", "provider", "attemptKey", "checkoutClaim"].includes(key)) ||
      typeof input.buyerEmail !== "string" || typeof input.packId !== "string" ||
      typeof input.provider !== "string" || typeof input.attemptKey !== "string" ||
      typeof input.checkoutClaim !== "string") {
    throw new Error("Invalid checkout input");
  }
  const email = input.buyerEmail.trim().toLowerCase();
  if (email.length > 254 || !emailAddress.test(email) || !uuid.test(input.packId) ||
      !providerName.test(input.provider) || !randomUuid.test(input.attemptKey) || !claimFormat.test(input.checkoutClaim) ||
      Buffer.from(input.checkoutClaim, "base64url").toString("base64url") !== input.checkoutClaim) {
    throw new Error("Invalid checkout input");
  }

  // ponytail: the trusted caller retains the claim across retries; persist it server-side only if checkout survives reloads.
  const publicReference = createHash("sha256").update("reference:").update(input.attemptKey).update(input.checkoutClaim).digest("base64url");
  const claimExpiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const { data, error } = await client.rpc("create_processing_purchase", {
    buyer_email: email,
    selected_pack_id: input.packId,
    payment_provider: input.provider,
    reference: publicReference,
    attempt_key: input.attemptKey,
    claim_hash: `\\x${createHash("sha256").update(input.checkoutClaim).digest("hex")}`,
    claim_expires_at: claimExpiresAt,
  });
  if (error || !data?.[0]) throw new Error("Checkout initialization failed");
  const row = data[0];
  return {
    purchaseId: row.purchase_id,
    paymentAttemptId: row.payment_attempt_id,
    packTitle: row.pack_title,
    amountMinor: row.amount_minor,
    currency: row.currency,
    publicReference,
    checkoutClaim: input.checkoutClaim,
    claimExpiresAt: row.saved_claim_expires_at,
  };
}
