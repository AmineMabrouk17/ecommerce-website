"use server";

import { profileFormSchema, type ProfileFormInput } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export interface UpdateProfileResult {
  error?: string;
}

function firstIssueMessage(message: string): string {
  return message || "Something went wrong. Please try again.";
}

export async function updateProfile(
  input: ProfileFormInput,
): Promise<UpdateProfileResult> {
  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error.issues[0]?.message) };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      avatar_url: parsed.data.avatarUrl ?? null,
    })
    .eq("id", user.id);
  if (error) {
    return { error: "We could not save your profile. Please try again." };
  }

  return {};
}
