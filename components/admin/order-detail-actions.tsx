"use client";

import { Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { advanceOrder, cancelOrder } from "@/lib/actions/admin-orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/money";
import type { OrderStatus } from "@/lib/orders";

interface OrderDetailActionsProps {
  orderId: string;
  status: OrderStatus;
  totalAmount: number;
}

export function OrderDetailActions({
  orderId,
  status,
  totalAmount,
}: OrderDetailActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const advanceLabel =
    status === "paid"
      ? "Mark as shipped"
      : status === "shipped"
        ? "Mark as delivered"
        : null;

  const cancellable = status === "pending" || status === "paid";
  const cancelLabel =
    status === "paid" ? "Cancel and refund" : "Cancel order";

  function runAdvance() {
    setError(null);
    startTransition(async () => {
      const result = await advanceOrder(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function runCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCancelOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {advanceLabel ? (
        <Button className="w-full" onClick={runAdvance} disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {advanceLabel}
        </Button>
      ) : null}

      {cancellable ? (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending}
            >
              <XCircle className="size-4" aria-hidden />
              {cancelLabel}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{cancelLabel}</DialogTitle>
              <DialogDescription>
                {status === "paid"
                  ? `Refund ${formatPrice(totalAmount)} to the customer and cancel this order. Stock will be restored.`
                  : "Cancel this order. The customer has not been charged."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCancelOpen(false)}
                disabled={pending}
              >
                Keep order
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={runCancel}
                disabled={pending}
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {cancelLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {!advanceLabel && !cancellable ? (
        <p className="text-sm text-muted-foreground">
          This order is complete and cannot be changed.
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
