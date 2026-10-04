import type { Metadata } from "next";

import PaymentStatusScreen from "../payment-status-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment pending",
  robots: { index: false, follow: false },
};

export default async function PendingPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <PaymentStatusScreen route="pending" reference={ref} />;
}
