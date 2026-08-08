"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroBanner() {
  return (
    <section className="bg-secondary/50">
      <motion.div
        className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground"
        >
          <Sparkles className="size-4 text-primary" aria-hidden />
          New arrivals every week
        </motion.span>
        <motion.h1
          variants={item}
          className="text-balance text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Everyday essentials, beautifully made
        </motion.h1>
        <motion.p
          variants={item}
          className="max-w-xl text-balance text-lg text-muted-foreground"
        >
          {siteConfig.name} curates apparel, footwear, accessories, home goods,
          and tech — everything you need, shipped fast.
        </motion.p>
        <motion.div
          variants={item}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="#trending">
              Shop trending <ArrowDown className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#categories">Browse categories</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
