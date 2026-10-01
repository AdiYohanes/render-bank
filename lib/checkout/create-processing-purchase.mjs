import { createHash, randomBytes, randomUUID } from "node:crypto";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const providerName = /^[a-z][a-z0-9_-]{1,63}$/;
const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createProcessingPurchaseWithClient(client, input) {
  if (!input || Object.keys(input).some((key) => !["buyerEmail", "packId", "provider"].includes(key)) ||
      typeof input.buyerEmail !== "string" || typeof input.packId !== "string" || typeof input.provider !== "string") {
    throw new Error("Invalid checkout input");
  }
  const email = input.buyerEmail.trim().toLowerCase();
  if (email.length > 254 || !emailAddress.test(email) || !uuid.test(input.packId) || !providerName.test(input.provider)) {
    throw new Error("Invalid checkout input");
  }

  const checkoutClaim = randomBytes(32).toString("base64url");
  const publicReference = randomBytes(32).toString("base64url");
  const claimExpiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const { data, error } = await client.rpc("create_processing_purchase", {
    buyer_email: email,
    selected_pack_id: input.packId,
    payment_provider: input.provider,
    reference: publicReference,
    attempt_key: randomUUID(),
    claim_hash: `\\x${createHash("sha256").update(checkoutClaim).digest("hex")}`,
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
    checkoutClaim,
    claimExpiresAt,
  };
}
