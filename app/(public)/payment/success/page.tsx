import type { Metadata } from "next";

import PaymentStatusScreen from "../payment-status-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment successful",
  // ROUTE_INDEXING: /payment/* shows per-purchase state, never indexed.
  robots: { index: false, follow: false },
};

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <PaymentStatusScreen route="success" reference={ref} />;
}
