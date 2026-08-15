"use client";

import { Send } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || pending) return;

    startTransition(async () => {
      const result = await subscribeToNewsletter({ email });
      if (result.ok) {
        setEmail("");
        setNotice({
          ok: true,
          text: "You're in! Watch your inbox for the next drop.",
        });
      } else {
        setNotice({
          ok: false,
          text: result.error ?? "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setNotice(null);
          }}
          className="h-11 rounded-full bg-background px-4"
          aria-label="Email address"
        />
        <Button type="submit" size="lg" className="sm:shrink-0" disabled={pending}>
          <Send className="size-4" aria-hidden />
          {pending ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      {notice ? (
        <p
          role={notice.ok ? "status" : "alert"}
          className={
            notice.ok
              ? "mt-3 text-sm text-success"
              : "mt-3 text-sm text-destructive"
          }
        >
          {notice.text}
        </p>
      ) : null}
    </form>
  );
}
