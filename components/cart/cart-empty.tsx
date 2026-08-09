import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <ShoppingCart className="size-10 text-muted-foreground" aria-hidden />
      <div>
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start browsing to find something you love.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/catalog">Start shopping</Link>
      </Button>
    </div>
  );
}
