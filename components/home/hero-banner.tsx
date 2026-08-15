"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import Image from "next/image";
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

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-grain opacity-[0.05]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        <motion.div
          className="flex flex-col items-start gap-6 text-left"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="size-4 text-primary" aria-hidden />
            New arrivals every week
          </motion.span>
          <motion.h1
            variants={item}
            className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Everyday essentials,{" "}
            <em className="font-display italic text-primary">beautifully made</em>
          </motion.h1>
          <motion.p
            variants={item}
            className="max-w-xl text-balance text-lg text-muted-foreground"
          >
            {siteConfig.name} curates apparel, footwear, accessories, home
            goods, and tech — everything you need, shipped fast.
          </motion.p>
          <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
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
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-violet/20 to-transparent blur-2xl"
          />
          <Image
            src={HERO_IMAGE}
            alt="Curated apparel and home goods at Lumina"
            width={1200}
            height={1000}
            priority
            className="relative aspect-[5/4] w-full rounded-3xl object-cover shadow-lifted"
          />
        </motion.div>
      </div>
    </section>
  );
}
