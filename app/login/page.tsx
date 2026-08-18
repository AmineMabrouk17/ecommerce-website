import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${siteConfig.name} account to check out and track orders.`,
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; auth_error?: string };
}) {
  return (
    <AuthShell
      title="Welcome back"
      description={`Sign in to your ${siteConfig.name} account to check out and track orders.`}
    >
      <LoginForm next={searchParams.next} authError={searchParams.auth_error} />
    </AuthShell>
  );
}
