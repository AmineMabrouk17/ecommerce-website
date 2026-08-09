"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCheckoutPayment,
  type CheckoutLineSummary,
} from "@/lib/actions/checkout";
import type { CartLine } from "@/lib/cart";
import type { CheckoutLineError, CheckoutProfile } from "@/lib/data-access";
import { shippingFormSchema, type ShippingFormInput } from "@/lib/orders";

export interface CheckoutPayment {
  orderId: string;
  clientSecret: string;
  items: CheckoutLineSummary[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
}

interface ShippingFormProps {
  profile: CheckoutProfile | null;
  lines: CartLine[];
  onReadyToPay: (payment: CheckoutPayment) => void;
  onUnavailable: (errors: CheckoutLineError[]) => void;
}

export function ShippingForm({
  profile,
  lines,
  onReadyToPay,
  onUnavailable,
}: ShippingFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormInput>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    },
  });

  function onSubmit(values: ShippingFormInput) {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutPayment({
        form: values,
        lines: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      });

      if (result.error) {
        setError(result.error);
        if (result.lineErrors) onUnavailable(result.lineErrors);
        return;
      }

      if (result.orderId && result.clientSecret) {
        onReadyToPay({
          orderId: result.orderId,
          clientSecret: result.clientSecret,
          items: result.lines ?? [],
          subtotal: result.subtotal ?? 0,
          shippingAmount: result.shippingAmount ?? 0,
          totalAmount: result.totalAmount ?? 0,
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Avery Park"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-muted-foreground">
          Shipping address
        </legend>
        <div className="space-y-2">
          <Label htmlFor="address.line1">Address line 1</Label>
          <Input
            id="address.line1"
            autoComplete="address-line1"
            placeholder="1 Main St"
            aria-invalid={Boolean(errors.address?.line1)}
            {...register("address.line1")}
          />
          {errors.address?.line1 && (
            <p className="text-sm text-destructive">
              {errors.address.line1.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.line2">Address line 2 (optional)</Label>
          <Input
            id="address.line2"
            autoComplete="address-line2"
            placeholder="Apt, suite, etc."
            {...register("address.line2")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              autoComplete="address-level2"
              placeholder="Denver"
              aria-invalid={Boolean(errors.address?.city)}
              {...register("address.city")}
            />
            {errors.address?.city && (
              <p className="text-sm text-destructive">
                {errors.address.city.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address.state">State / Province</Label>
            <Input
              id="address.state"
              autoComplete="address-level1"
              placeholder="CO"
              aria-invalid={Boolean(errors.address?.state)}
              {...register("address.state")}
            />
            {errors.address?.state && (
              <p className="text-sm text-destructive">
                {errors.address.state.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address.postalCode">Postal code</Label>
            <Input
              id="address.postalCode"
              autoComplete="postal-code"
              placeholder="80202"
              aria-invalid={Boolean(errors.address?.postalCode)}
              {...register("address.postalCode")}
            />
            {errors.address?.postalCode && (
              <p className="text-sm text-destructive">
                {errors.address.postalCode.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address.country">Country</Label>
            <Input
              id="address.country"
              autoComplete="country"
              placeholder="US"
              aria-invalid={Boolean(errors.address?.country)}
              {...register("address.country")}
            />
            {errors.address?.country && (
              <p className="text-sm text-destructive">
                {errors.address.country.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Continue to payment
      </Button>
    </form>
  );
}
