"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileFormSchema, type ProfileFormInput } from "@/lib/account";
import { updateProfile } from "@/lib/actions/account";
import type { AccountProfile } from "@/lib/data-access";

interface ProfileFormProps {
  profile: AccountProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.name,
      avatarUrl: profile.avatarUrl ?? "",
    },
  });

  const avatarUrl = watch("avatarUrl");

  function onSubmit(values: ProfileFormInput) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p
          role="status"
          className="rounded-md border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700"
        >
          Profile saved.
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar preview"
            className="size-16 rounded-full border object-cover"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
            {(profile.name || "?")[0].toUpperCase()}
          </span>
        )}
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{profile.email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Avery Park"
          aria-invalid={Boolean(errors.fullName)}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
        <Input
          id="avatarUrl"
          type="url"
          autoComplete="url"
          placeholder="https://…"
          aria-invalid={Boolean(errors.avatarUrl)}
          {...register("avatarUrl")}
        />
        {errors.avatarUrl && (
          <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save profile
      </Button>
    </form>
  );
}
