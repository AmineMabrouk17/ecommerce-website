"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe/client";

interface PaymentElementsProps {
  clientSecret: string;
  onSuccess: () => void;
}

export function PaymentElements({
  clientSecret,
  onSuccess,
}: PaymentElementsProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "hsl(221 83% 53%)",
      },
    },
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      <StripePaymentForm onSuccess={onSuccess} />
    </Elements>
  );
}

function StripePaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setPending(true);
    setError(null);
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setPending(false);

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
      return;
    }

    if (paymentIntent?.status === "processing") {
      setError(
        "Your payment is processing. We will confirm your order shortly.",
      );
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <PaymentElement options={{ layout: "tabs" }} />

      <Button type="submit" size="lg" className="w-full" disabled={pending || !stripe || !elements}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Pay now
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Your payment details are encrypted and handled by Stripe.
      </p>
    </form>
  );
}
