import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: `Create a ${siteConfig.name} account to check out and track orders.`,
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { next?: string; auth_error?: string };
}) {
  return (
    <AuthShell
      title="Create your account"
      description={`Join ${siteConfig.name} to check out and track your orders.`}
    >
      <RegisterForm next={searchParams.next} authError={searchParams.auth_error} />
    </AuthShell>
  );
}
