"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resolveNext,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_NEXT = "/";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function firstIssueMessage(message: string): string {
  return message || "Something went wrong. Please try again.";
}

export interface AuthActionResult {
  error?: string;
  message?: string;
  next?: string;
}

export async function login(
  input: LoginInput,
  next?: string | null,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Invalid email or password." };
  }

  return { next: resolveNext(next, DEFAULT_NEXT) };
}

export async function register(
  input: RegisterInput,
  next?: string | null,
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const intendedNext = resolveNext(next, DEFAULT_NEXT);
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(intendedNext)}`,
    },
  });
  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message:
        "Your account is almost ready — check your email to confirm your registration before signing in.",
    };
  }

  return { next: intendedNext };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error) {
    return { error: error.message };
  }

  return {
    message:
      "If that email has an account, a password reset link is on its way.",
  };
}

export async function updatePassword(
  input: ResetPasswordInput,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  return { next: "/login" };
}

export type OAuthProvider = "google" | "github";

export interface OAuthActionResult {
  error?: string;
  redirectTo?: string;
}

export async function signInWithProvider(
  provider: OAuthProvider,
  next?: string | null,
): Promise<OAuthActionResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(resolveNext(next, DEFAULT_NEXT))}`,
    },
  });
  if (error) {
    return { error: error.message };
  }
  if (!data.url) {
    return { error: "Unable to start sign-in. Please try again." };
  }

  return { redirectTo: data.url };
}
