// @ts-check
/**
 * PaymentGateway seam (TECHNICAL_ARCHITECTURE §14). The only surface domain
 * services may touch; `lib/payment/midtrans.ts` is the sole provider-aware
 * adapter (built in #29 — until then every call fails closed, before any
 * purchase mutation).
 */

/** @typedef {(input: unknown) => Promise<{redirectUrl: string}> | {redirectUrl: string}} GatewayCreate */

/**
 * Create a hosted-checkout session from the initializer's authoritative terms.
 * @param {{publicReference: string, buyerEmail: string, amountMinor: number, currency: string}} input
 * @returns {Promise<{redirectUrl: string}>}
 */
export async function createCheckout(input) {
  // ponytail: fail-closed until the Midtrans adapter lands (#29); the checkout
  // server action already treats this as the "payment initialization failed" state.
  const impl = provideCreate ?? failClosed;
  return impl(input);
}

/** @type {GatewayCreate} */
function failClosed() {
  throw new Error("Payment provider is unavailable");
}

/** @type {GatewayCreate | null} */
let provideCreate = null;

/**
 * Wiring for a fake gateway in tests; never networked.
 * @param {GatewayCreate | null} impl
 * @returns {void}
 */
export function __setCreateCheckoutForTests(impl) {
  provideCreate = impl;
}

/** Wire the real Midtrans adapter at startup (#29). @param {GatewayCreate} impl */
export function registerGateway(impl) {
  provideCreate = impl;
}
