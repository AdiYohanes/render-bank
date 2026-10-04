// @ts-check
/**
 * PaymentGateway seam (TECHNICAL_ARCHITECTURE §14). The only surface domain
 * services may touch; `lib/payment/midtrans.ts` is the sole provider-aware
 * adapter — registered at server start; every unregistered call fails closed
 * before any purchase mutation.
 */

/** @typedef {{publicReference: string, buyerEmail: string, amountMinor: number, currency: string, attemptKey: string}} CheckoutTerms */

/** @typedef {(input: CheckoutTerms) => Promise<{redirectUrl: string}>} GatewayCreate */

/**
 * Raised by the provider adapter when the order already settled at the
 * provider (ADR-0001 409 recovery): the checkout flow must redirect the buyer
 * to the purchase's status route with no further create call.
 */
export class SettledOrderError extends Error {
  constructor() {
    super("Payment order already settled");
    this.name = "SettledOrderError";
  }
}


/**
 * Create a hosted-checkout session from the initializer's authoritative terms.
 * @param {CheckoutTerms} input
 * @returns {Promise<{redirectUrl: string}>}
 */
export async function createCheckout(input) {
  // fail-closed when nothing is registered: no purchase mutation ever happens
  // against an unconfigured provider.
  const impl = currentProvider();
  return impl(input);
}

/** @type {GatewayCreate | null} */
let provideCreate = null;

/** @type {(() => GatewayCreate) | null} */
let adapterFactory = null;

/**
 * Wire the real Midtrans adapter at server start. The factory is lazy so
 * gateway.mjs itself stays server-only without importing provider details.
 * @param {(() => GatewayCreate) | null} factory
 */
export function registerGateway(factory) {
  adapterFactory = factory;
  provideCreate = null;
}

/**
 * Resolves the registered adapter once per process; tests inject fakes via
 * __setCreateCheckoutForTests so this path is never hit.
 * @returns {GatewayCreate}
 */
function currentProvider() {
  if (provideCreate) return provideCreate;
  if (!adapterFactory) throw new Error("Payment provider is unavailable");
  provideCreate = adapterFactory();
  return provideCreate;
}

/**
 * Wiring for a fake gateway in tests; never networked.
 * @param {GatewayCreate | null} impl
 * @returns {void}
 */
export function __setCreateCheckoutForTests(impl) {
  provideCreate = impl;
}

/** @typedef {import("./midtrans.mjs").NormalizedWebhookEvent} NormalizedWebhookEvent */

/** @typedef {(rawBody: string, headers: Record<string, string | undefined>) => NormalizedWebhookEvent | null} WebhookVerify */

/** @type {WebhookVerify | null} */
let provideVerify = null;

/**
 * Wire the webhook normalizer of the registered adapter (same factory seam as
 * create). Server start registers both.
 * @param {WebhookVerify | null} impl
 * @returns {void}
 */
export function registerWebhookVerifier(impl) {
  provideVerify = impl;
}

/**
 * Verify a provider webhook and normalize it into the lifecycle facts. The
 * raw body stays byte-exact; provider details never cross this seam.
 * Fails closed (never returns a fact) when nothing is registered.
 * @param {string} rawBody exact request body text as received
 * @param {Record<string, string | undefined>} headers the webhook's headers
 * @returns {NormalizedWebhookEvent | null} null = verified but not actionable
 */
export function verifyAndNormalizeWebhook(rawBody, headers) {
  if (!provideVerify) throw new Error("Payment provider is unavailable");
  return provideVerify(rawBody, headers);
}

/**
 * Wiring for a fake webhook verifier in tests; never networked.
 * @param {WebhookVerify | null} impl
 * @returns {void}
 */
export function __setVerifyAndNormalizeWebhookForTests(impl) {
  provideVerify = impl;
}
