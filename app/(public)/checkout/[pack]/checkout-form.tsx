"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { submitCheckout } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button-primary" disabled={pending} type="submit">
      {pending ? "Redirecting to payment…" : "Continue to Payment"}
    </button>
  );
}

export function CheckoutForm({ packSlug }: { packSlug: string }) {
  const [state, formAction] = useActionState(submitCheckout, undefined);
  const router = useRouter();

  // The action returns a redirect target (external provider URL or a status
  // route) instead of throwing NEXT_REDIRECT, so the fresh claim cookie set in
  // the same server-action response survives the handoff.
  useEffect(() => {
    if (state?.redirectUrl) router.push(state.redirectUrl);
  }, [state, router]);

  return (
    <form action={formAction} className="checkout-form">
      {state?.reconfirm && (
        <p className="notice" role="alert">
          The price has changed since you started checkout. Submit again to
          confirm the latest price.
        </p>
      )}
      {state?.reconfirm && <input name="reconfirm" type="hidden" value="1" />}
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <label>
        Email
        <input autoComplete="email" inputMode="email" name="email" placeholder="you@example.com" required type="email" />
      </label>
      <p className="checkout-email-help">Access link will be sent to this email.</p>
      <SubmitButton />
      <input name="packSlug" type="hidden" value={packSlug} />
    </form>
  );
}
