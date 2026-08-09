import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OrderHistory } from "@/components/account/order-history";
import { ProfileForm } from "@/components/account/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { getAccountData } from "@/lib/data-access";

export const metadata: Metadata = {
  title: "Account",
  description: `Manage your ${siteConfig.name} profile and track your orders.`,
};

export default async function AccountPage() {
  const { profile, orders } = await getAccountData();
  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and track your orders.
        </p>
      </header>

      <div className="space-y-8">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <OrderHistory orders={orders} />
      </div>
    </main>
  );
}
