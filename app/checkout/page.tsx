import type { Metadata } from "next";

import { CheckoutClient } from "@/components/checkout/checkout-client";
import { siteConfig } from "@/config/site";
import { getCheckoutProfile } from "@/lib/data-access";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Pay securely for your ${siteConfig.name} order with Stripe.`,
};

export default async function CheckoutPage() {
  const profile = await getCheckoutProfile();

  return <CheckoutClient profile={profile} />;
}
