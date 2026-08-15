"use server";

import {
  newsletterEmailSchema,
  type NewsletterEmailInput,
} from "@/lib/newsletter";
import { createClient } from "@/lib/supabase/server";

export interface SubscribeNewsletterResult {
  ok: boolean;
  error?: string;
}

export async function subscribeToNewsletter(
  input: NewsletterEmailInput,
): Promise<SubscribeNewsletterResult> {
  const parsed = newsletterEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    return {
      ok: false,
      error: "We could not subscribe you right now. Please try again.",
    };
  }

  return { ok: true };
}
