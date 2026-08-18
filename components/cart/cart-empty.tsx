"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CartEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="size-7 text-muted-foreground" aria-hidden />
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start browsing to find something you love.
        </p>
      </motion.div>
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/catalog">Start shopping</Link>
        </Button>
      </motion.div>
    </div>
  );
}
