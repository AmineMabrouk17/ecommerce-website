import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: `Choose a new password for your ${siteConfig.name} account.`,
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Your reset link is only valid once, so pick a strong password."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
