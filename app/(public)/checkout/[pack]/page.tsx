import type { Metadata } from "next";

import { ArtworkFrame } from "@/app/components/artwork";
import { resolveCheckoutPack } from "@/lib/checkout/pack-resolve.mjs";
import { formatPackPrice } from "@/lib/payment/present";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ pack: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pack } = await params;
  const resolved = await resolveCheckoutPack(pack);
  return {
    title: resolved ? `Checkout ${resolved.title}` : "Pack not available",
    // ROUTE_INDEXING: /checkout/[pack] must stay out of search (SCREEN_REQUIREMENTS #47).
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { pack: slug } = await params;
  const resolved = await resolveCheckoutPack(slug);
  if (!resolved) {
    return (
      <main className="content-wrap checkout-page interim-page" id="main">
        <p className="eyebrow">CHECKOUT</p>
        <h1>Pack not available</h1>
        <p>
          This Pack is not purchasable right now — it may have been renamed,
          archived, or is still in preparation.
        </p>
        <div className="actions">
          <a className="button-primary" href="/packs">
            Browse Packs
          </a>
          <a className="button-secondary" href="/explore">
            Explore Prompts
          </a>
        </div>
      </main>
    );
  }

  const price = formatPackPrice(resolved.price_minor, resolved.currency);

  return (
    <main className="content-wrap checkout-page" id="main">
      <p className="eyebrow">CHECKOUT</p>
      <h1>Checkout</h1>
      <section className="checkout-summary" aria-label="Order summary">
        {resolved.cover ? <div className="checkout-cover prompt-artwork"><ArtworkFrame alt={`${resolved.title} cover`} asset={resolved.cover} /></div> : null}
        <h2>{resolved.title}</h2>
        <p>{resolved.description}</p>
        <dl className="pack-meta">
          <div>
            <dt>Price</dt>
            <dd>{price}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>One-time purchase</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>{resolved.currency}</dd>
          </div>
        </dl>
      </section>

      <CheckoutForm packSlug={resolved.slug} />

      <section className="checkout-trust">
        <p>
          Secure payment — digital product, no subscription. Access link will
          be sent to your email.
        </p>
      </section>
    </main>
  );
}
