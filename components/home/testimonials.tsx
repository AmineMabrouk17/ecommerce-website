"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { StarRating } from "@/components/product/star-rating";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Verified Buyer",
    rating: 5,
    text: "Absolutely love the quality! The fabric is so soft and the fit is perfect. Will definitely be ordering more.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: 2,
    name: "James L.",
    role: "Verified Buyer",
    rating: 5,
    text: "Fast shipping and the product exceeded my expectations. The attention to detail is remarkable.",
    avatar: "https://i.pravatar.cc/150?u=james",
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Verified Buyer",
    rating: 4,
    text: "Beautiful design and great customer service. Had a sizing question and they responded within hours.",
    avatar: "https://i.pravatar.cc/150?u=emily",
  },
  {
    id: 4,
    name: "Michael K.",
    role: "Verified Buyer",
    rating: 5,
    text: "This has become my go-to store. Every piece I've bought has been top-notch quality and style.",
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
  {
    id: 5,
    name: "Olivia P.",
    role: "Verified Buyer",
    rating: 5,
    text: "The packaging was beautiful and the product feels premium. You can really tell they care about the experience.",
    avatar: "https://i.pravatar.cc/150?u=olivia",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft">
      <Quote
        className="mb-3 size-8 text-primary/20"
        aria-hidden
      />
      <p className="flex-1 text-muted-foreground leading-relaxed">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="size-10 rounded-full object-cover"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
        <div className="ml-auto shrink-0">
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = testimonials.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, next]);

  return (
    <section className="bg-gradient-to-b from-secondary/40 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Testimonials
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            What our customers say
          </h2>
          <p className="mt-1 text-muted-foreground">
            Real reviews from verified buyers.
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {[0, 1, 2].map((offset) => {
                  const index = (current + offset) % total;
                  return (
                    <TestimonialCard
                      key={testimonials[index].id}
                      testimonial={testimonials[index]}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={prev}
            aria-label="Previous testimonials"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 rounded-full border bg-card p-2 shadow-soft transition hover:bg-muted sm:block"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            onClick={next}
            aria-label="Next testimonials"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 rounded-full border bg-card p-2 shadow-soft transition hover:bg-muted sm:block"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={cn(
                "size-2 rounded-full transition",
                i === current ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
