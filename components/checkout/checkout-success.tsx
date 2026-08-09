import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CheckoutSuccessProps {
  orderId: string;
}

export function CheckoutSuccess({ orderId }: CheckoutSuccessProps) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="items-center text-center">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <CardTitle className="text-2xl">Order confirmed</CardTitle>
        <CardDescription>
          Your payment succeeded and your order is being prepared.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Order reference:{" "}
          <span className="font-medium text-foreground">
            {orderId.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <Button asChild>
          <Link href="/catalog">Continue shopping</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
