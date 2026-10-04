// @ts-check
/**
 * Midtrans Snap adapter — the only module that knows provider details (#29;
 * ADR-0001). Server-only; plain HTTPS + stdlib crypto, no SDK. The injectable
 * fetch keeps tests network-free with fake payloads (sandbox/fake vectors only;
 * no production credential is ever used).
 */
import { createHash, timingSafeEqual } from "node:crypto";

const SANDBOX_BASE = "https://app.sandbox.midtrans.com";
const PRODUCTION_BASE = "https://app.midtrans.com";
const ORDER_ID_PREFIX = "r-";

/**
 * Resolved, redacted-safe provider config. Missing/invalid env fails closed
 * before any purchase mutation.
 * @param {Record<string, string | undefined>} [env]
 */
export function midtransConfig(env = process.env) {
  const serverKey = env.MIDTRANS_SERVER_KEY;
  if (typeof serverKey !== "string" || !serverKey.trim() || serverKey.startsWith("replace-with-")) {
    throw new Error("Payment provider is unavailable");
  }
  const isProduction = env.MIDTRANS_IS_PRODUCTION === "true";
  return {
    base: isProduction ? PRODUCTION_BASE : SANDBOX_BASE,
    serverKey,
    isProduction,
  };
}

/**
 * The exact order id formula locked in ADR-0001.
 * @param {string} publicReference
 */
export function midtransOrderId(publicReference) {
  return `${ORDER_ID_PREFIX}${publicReference}`;
}

/**
 * Basic auth token from the server key only.
 * @param {string} serverKey
 */
function basicAuth(serverKey) {
  return Buffer.from(`${serverKey}:`).toString("base64");
}

/**
 * Create the hosted Snap session and bind the provider order id to the stored
 * attempt — binding persists before the buyer leaves (ADR-0001).
 * @param {Object} input
 * @param {string} input.publicReference
 * @param {string} input.buyerEmail
 * @param {number} input.amountMinor
 * @param {string} input.currency
 * @param {string} input.attemptKey stable attempt key of the stored attempt
 * @param {Object} deps injected seams
 * @param {(attemptKey: string, provider: string, orderId: string) => Promise<void>} [deps.bindAttempt] accepted bind_provider_attempt seam
 * @param {typeof fetch} [deps.fetchImpl] injectable fetch for tests
 * @param {Record<string, string | undefined>} [deps.env] injectable env for tests
 */
export async function midtransCreateCheckout(input, deps = { bindAttempt: undefined }) {
  if (!deps.bindAttempt) throw new Error("Payment provider is unavailable");
  const config = midtransConfig(deps.env);
  const fetchFn = deps.fetchImpl ?? fetch;
  const orderId = midtransOrderId(input.publicReference);
  const body = JSON.stringify({
    transaction_details: {
      order_id: orderId,
      gross_amount: input.amountMinor,
    },
    customer_details: { email: input.buyerEmail },
    credit_card: { secure: true },
    callbacks: {
      finish: `/payment/success?ref=${encodeURIComponent(input.publicReference)}`,
      unfinish: `/payment/pending?ref=${encodeURIComponent(input.publicReference)}`,
      error: `/payment/failed?ref=${encodeURIComponent(input.publicReference)}`,
    },
  });

  let response;
  try {
    response = await fetchFn(`${config.base}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Basic ${basicAuth(config.serverKey)}`,
      },
      body,
    });
  } catch {
    throw new Error("Payment provider is unavailable");
  }

  if (response.status === 409) {
    // Midtrans HTTP 4252/409: order id already exists. Per ADR-0001, recovery
    // (same-session resume or status redirect) is the web hook's 409 flow —
    // not this binder. Fail safe: no second create ever after an accepted one.
    throw new Error("Payment order already exists");
  }

  if (!response.ok) {
    // Provider error bodies are never propagated to buyer surfaces.
    throw new Error("Payment provider rejected the checkout");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Payment provider returned an invalid checkout response");
  }

  if (typeof payload?.redirect_url !== "string" || !/^https:\/\//.test(payload.redirect_url)) {
    throw new Error("Payment provider returned an invalid checkout response");
  }

  // Binding persists before the buyer handoff; a bind failure fails the
  // checkout — no buyer leaves for a provider page with no stored binding.
  await deps.bindAttempt(input.attemptKey, "midtrans", orderId);

  return { orderId, redirectUrl: payload.redirect_url };
}

/**
 * Webhook event categories the seam understands (ADR-0001 lifecycle table).
 * First verified fact wins; later conflicting categories are recorded but
 * never undo applied ones.
 * @typedef {"success" | "failed" | "expired" | "ignored"} WebhookOutcome
 */

/** @typedef {{outcome: WebhookOutcome, providerEventId: string, providerAttemptId: string, eventType: string}} NormalizedWebhookEvent */

/**
 * Verify a Midtrans webhook (POST /api/payment/webhook) against the signature
 * rule SHA-512(order_id + status_code + gross_amount + server_key) and
 * normalize the verified facts into the lifecycle allowlist. The raw body
 * string is required exactly as received — signature is computed over it, so
 * any re-serialization breaks verification (fail closed). Returns null when
 * the event is not one the lifecycle acts on.
 * @param {string} rawBody exact request body text as received
 * @param {Record<string, string | undefined>} headers the webhook's headers
 * @param {Record<string, string | undefined>} [env]
 * @returns {NormalizedWebhookEvent | null} null = verified but not actionable
 */
export function midtransVerifyWebhook(rawBody, headers, env = process.env) {
  const config = midtransConfig(env);
  if (typeof rawBody !== "string" || !rawBody) throw new Error("Malformed webhook payload");

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new Error("Malformed webhook payload");
  }

  const orderId = payload?.order_id;
  const statusCode = payload?.status_code;
  const grossAmount = payload?.gross_amount;
  const signature = headers["x-callback-signature"];
  if (
    typeof orderId !== "string" || typeof statusCode !== "string" || typeof grossAmount !== "string"
    || typeof signature !== "string" || !signature
  ) {
    throw new Error("Malformed webhook payload");
  }
  const expected = midtransSignature(orderId, statusCode, grossAmount, config.serverKey);
  if (!timingSafeEqualHex(signature, expected)) throw new Error("Invalid webhook signature");

  // Verified from here on: normalize only the lifecycle-fact allowlist.
  const transactionStatus = payload.transaction_status;
  const fraudStatus = payload.fraud_status;
  const transactionId = payload.transaction_id;
  const eventType = typeof transactionId === "string" && transactionId ? transactionId : "webhook";
  if (typeof orderId !== "string" || orderId.startsWith("r-") !== true) {
    throw new Error("Malformed webhook payload");
  }
  const providerAttemptId = orderId;
  const providerEventId = typeof payload.event === "string" && payload.event ? payload.event : `${transactionStatus}:${transactionId ?? ""}`;

  if (transactionStatus === "settlement" || (transactionStatus === "capture" && fraudStatus === "accept")) {
    return { outcome: "success", providerEventId, providerAttemptId, eventType };
  }
  if (transactionStatus === "capture" && fraudStatus === "pending") {
    return null; // capture-pending: recorded only
  }
  if (transactionStatus === "pending" || transactionStatus === "refund" || transactionStatus === "partial_refund") {
    return null; // pending/refunds: recorded only
  }
  if (transactionStatus === "cancel" || transactionStatus === "deny") {
    return { outcome: "failed", providerEventId, providerAttemptId, eventType };
  }
  if (transactionStatus === "expire") {
    return { outcome: "expired", providerEventId, providerAttemptId, eventType };
  }
  return null; // unknown verified status: not actionable by this lifecycle
}

/**
 * Constant-time hex comparison so signature checks do not leak timing.
 * @param {string} given untrusted hex digest
 * @param {string} expected trusted hex digest
 */
function timingSafeEqualHex(given, expected) {
  if (typeof given !== "string" || given.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/**
 * Signature formula: SHA-512(order_id + status_code + gross_amount + server_key).
 * Exposed for webhook verification test vectors (#30) and fixture reuse here.
 * @param {string} orderId
 * @param {string} statusCode
 * @param {string} grossAmount
 * @param {string} serverKey
 */
export function midtransSignature(orderId, statusCode, grossAmount, serverKey) {
  return createHash("sha512").update(orderId).update(statusCode).update(grossAmount).update(serverKey).digest("hex");
}
