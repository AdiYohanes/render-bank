// Payment webhook (#30; ADR-0001, TECHNICAL_ARCHITECTURE §10.2). The only
// normal path that completes payment. Reads the provider-required raw body,
// verifies the Midtrans signature before trusting anything, normalizes the
// verified facts to the lifecycle allowlist, and routes through the accepted
// service-role RPCs. 2xx = accepted/replayed/ignored; 4xx = malformed or
// unauthenticated; 5xx only for transient internal failures (provider retries
// per its documented schedule).
import { createHash, randomBytes } from "node:crypto";

import { createTrustedSupabaseClient } from "@/lib/supabase/service";
import { midtransVerifyWebhook } from "@/lib/payment/midtrans.mjs";
import type { NormalizedWebhookEvent } from "@/lib/payment/midtrans.d";

export const dynamic = "force-dynamic";
// Provider-required raw body: never let a parser re-serialize before the
// signature check. crypto/hash behavior is required from Node.
export const runtime = "nodejs";

/** SHA-256 hex digest of the exact received payload — stored, never the body. */
function payloadDigest(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

/** Candidate token hash (`\x` bytea literal), derived in trusted memory only (Phase 5 emails it). */
function candidateTokenHash(): string {
  return `\\x${randomBytes(32).toString("hex")}`;
}

/**
 * Facts needed by complete_paid_purchase that only the server owns: the
 * attempt's Pack, amount, and currency are resolved from stored terms by the
 * verified order id. The provider payload never supplies them.
 */
async function resolveStoredTerms(trusted: ReturnType<typeof createTrustedSupabaseClient>, orderId: string) {
  const { data, error } = await trusted
    .from("payment_attempts")
    .select("amount_minor, currency, purchases(pack_id)")
    .eq("provider", "midtrans")
    .eq("provider_attempt_id", orderId)
    .maybeSingle();
  if (error || !data?.purchases) return null;
  const pack = typeof data.purchases === "object" && data.purchases !== null && "pack_id" in data.purchases
    ? (data.purchases.pack_id as string | null)
    : null;
  return pack ? { packId: pack, amountMinor: data.amount_minor, currency: data.currency } : null;
}

/** Facts for safe logs only: no payload, buyer, or credential data. */
function safeLogContext() {
  return { provider: "midtrans", route: "/api/payment/webhook" };
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Malformed webhook payload" }, { status: 400 });
  }

  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });

  // Verify + normalize before trusting or mutating anything.
  let event: NormalizedWebhookEvent | null;
  try {
    event = midtransVerifyWebhook(rawBody, headers);
  } catch (error) {
    // Unauthenticated/malformed: 4xx, body is presentation-safe.
    const invalid = String((error as Error)?.message ?? "").includes("Invalid webhook signature");
    return Response.json(
      { error: invalid ? "Invalid webhook signature" : "Malformed webhook payload" },
      { status: invalid ? 401 : 400 },
    );
  }

  // Verified but not actionable (pending, capture-pending, refunds, unknown):
  // accepted; no attempt resolves it, so nothing is recorded or mutated.
  if (!event) {
    return new Response(null, { status: 200 });
  }

  if (event.outcome === "success") {
    const trusted = createTrustedSupabaseClient();
    try {
      const terms = await resolveStoredTerms(trusted, event.providerAttemptId);
      if (!terms) {
        // Unknown/mismatched attempt: nothing mutated, provider won't retry
        // better data — 200 with safe logging (reconciliation, not retry).
        console.warn(JSON.stringify({ ...safeLogContext(), kind: "unknown-attempt" }));
        return new Response(null, { status: 200 });
      }
      const { error } = await trusted.rpc("complete_paid_purchase", {
        p_provider: "midtrans",
        p_provider_event_id: event.providerEventId,
        p_provider_attempt_id: event.providerAttemptId,
        p_event_type: event.eventType,
        p_verified_status: "SUCCEEDED",
        p_expected_pack_id: terms.packId,
        p_amount_minor: terms.amountMinor,
        p_currency: terms.currency,
        p_token_hash: candidateTokenHash(),
      });
      if (error) {
        // Mismatch/unknown/transition failures: nothing mutated. Provider gets
        // 200 (it will not retry better data) with safe logging.
        console.warn(JSON.stringify({ ...safeLogContext(), kind: "completion-failed", stage: "database" }));
        return new Response(null, { status: 200 });
      }
    } catch {
      console.warn(JSON.stringify({ ...safeLogContext(), kind: "completion-failed", stage: "network" }));
      return Response.json({ error: "Webhook processing is temporarily unavailable" }, { status: 503 });
    }
    return new Response(null, { status: 200 });
  }

  // Verified non-success: durable status via the companion RPC. The order id
  // is the only payload fact used to resolve the attempt; outcome and digest
  // are normalized server-side.
  const trusted = createTrustedSupabaseClient();
  try {
    const { error } = await trusted.rpc("record_unpaid_payment_event", {
      p_provider: "midtrans",
      p_provider_event_id: event.providerEventId,
      p_provider_attempt_id: event.providerAttemptId,
      p_event_type: event.eventType,
      p_event_outcome: event.outcome === "failed" ? "FAILED" : "EXPIRED",
      p_provider_payload_digest: payloadDigest(rawBody),
    });
    if (error) {
      console.warn(JSON.stringify({ ...safeLogContext(), kind: "recording-failed", stage: "database" }));
      return new Response(null, { status: 200 });
    }
  } catch {
    console.warn(JSON.stringify({ ...safeLogContext(), kind: "recording-failed", stage: "network" }));
    return Response.json({ error: "Webhook processing is temporarily unavailable" }, { status: 503 });
  }
  return new Response(null, { status: 200 });
}
