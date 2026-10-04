import type { Metadata } from "next";

import PaymentStatusScreen from "../payment-status-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false, follow: false },
};

export default async function CancelledPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <PaymentStatusScreen route="cancelled" reference={ref} />;
}
