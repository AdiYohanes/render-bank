// @ts-check
/**
 * Redacted payment status lookup for /payment/* routes (#31). Reads the
 * purchase by the opaque public reference via the service-role client and
 * returns only the projection the screens may render. Unknown/lost
 * references return the unknown view — the routes render Unknown copy in the
 * requested route and never coerce it to a known state.
 * @typedef {import("./status-resolve.mjs").StatusView} StatusView
 */
import { resolveStatusView } from "./status-resolve.mjs";

/**
 * @param {string | null | undefined} reference opaque public reference from the querystring
 * @param {import("@/lib/supabase/service").createTrustedSupabaseClient} trustedFactory
 * @returns {Promise<StatusView>}
 */
export async function lookupPaymentStatusWithClient(reference, trustedFactory) {
  if (typeof reference !== "string" || reference.length < 16 || reference.length > 64) {
    return resolveStatusView(null);
  }
  const trusted = trustedFactory();
  const { data } = await trusted
    .from("purchases")
    .select("payment_status, pack_title_snapshot, buyer_email_normalized")
    .eq("public_reference", reference)
    .maybeSingle();
  return resolveStatusView(data ? { status: String(data.payment_status), pack_title_snapshot: data.pack_title_snapshot, buyer_email_normalized: data.buyer_email_normalized } : null);
}
