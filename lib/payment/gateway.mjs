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
