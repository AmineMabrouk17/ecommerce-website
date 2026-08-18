"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL = 5000;

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

type Slide = {
  tagline: string;
  tagIcon: typeof Sparkles;
  headline: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  image: string;
  imageAlt: string;
};

const slides: Slide[] = [
  {
    tagline: "Summer Collection",
    tagIcon: Sparkles,
    headline: "Everyday essentials, ",
    highlight: "beautifully made",
    description:
      "Curated apparel, footwear, accessories, home goods, and tech — everything you need, shipped fast.",
    ctaLabel: "Shop trending",
    ctaHref: "#trending",
    secondaryLabel: "Browse categories",
    secondaryHref: "#categories",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    imageAlt: "Curated apparel and home goods at Lumina",
  },
  {
    tagline: "Limited Time Offer",
    tagIcon: Tag,
    headline: "Up to 40% off ",
    highlight: "season favourites",
    description:
      "Refresh your wardrobe and living space with handpicked pieces at unbeatable prices. Don't miss out.",
    ctaLabel: "Shop the sale",
    ctaHref: "#trending",
    secondaryLabel: "See all deals",
    secondaryHref: "#categories",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
    imageAlt: "Seasonal favourites on sale at Lumina",
  },
  {
    tagline: "Free Shipping",
    tagIcon: Truck,
    headline: "Fast delivery, ",
    highlight: "always free",
    description:
      "No minimum order required. Your order ships within 24 hours with real-time tracking included.",
    ctaLabel: "Start shopping",
    ctaHref: "#trending",
    secondaryLabel: "Learn more",
    secondaryHref: "#categories",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    imageAlt: "Fast free shipping on all Lumina orders",
  },
];

function slideVariants(): Variants {
  return {
    enter: (dir: number) => ({
      x: dir > 0 ? "8%" : "-8%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-8%" : "8%",
      opacity: 0,
      transition: { duration: 0.35, ease: "easeIn" },
    }),
  };
}

export function HeroBanner() {
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = slides[current];

  const goTo = useCallback(
    (index: number) => {
      const dir = index > current ? 1 : -1;
      setCurrent([index, dir]);
    },
    [current],
  );

  const next = useCallback(() => {
    setCurrent(([prev]) => [(prev + 1) % slides.length, 1]);
  }, []);

  const prev = useCallback(() => {
    setCurrent(([prev]) => [(prev - 1 + slides.length) % slides.length, -1]);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next]);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-grain opacity-[0.05]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants()}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-start gap-6 text-left"
          >
            <motion.span
              variants={container}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm"
            >
              <slide.tagIcon
                className="size-4 text-primary"
                aria-hidden
              />
              {slide.tagline}
            </motion.span>

            <motion.h1
              variants={container}
              initial="hidden"
              animate="show"
              className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              {slide.headline}
              <em className="font-display italic text-primary">
                {slide.highlight}
              </em>
            </motion.h1>

            <motion.p
              variants={item}
              initial="hidden"
              animate="show"
              className="max-w-xl text-balance text-lg text-muted-foreground"
            >
              {slide.description}
            </motion.p>

            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild size="lg">
                <Link href={slide.ctaHref}>
                  {slide.ctaLabel} <ArrowDown className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={slide.secondaryHref}>{slide.secondaryLabel}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants()}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative"
            >
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-violet/20 to-transparent blur-2xl"
              />
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                width={1200}
                height={1000}
                priority
                className="relative aspect-[5/4] w-full rounded-3xl object-cover shadow-lifted"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="flex size-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-soft backdrop-blur-sm transition-transform hover:scale-110"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="flex size-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-soft backdrop-blur-sm transition-transform hover:scale-110"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dots navigation */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-2 pb-6 lg:justify-start lg:px-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "size-2.5 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-primary"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
            )}
          />
        ))}
        <span className="ml-3 text-sm text-muted-foreground">
          {current + 1} / {slides.length}
        </span>
      </div>
    </section>
  );
}
