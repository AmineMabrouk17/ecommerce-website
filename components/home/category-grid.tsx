"use client";

import { ArrowUpRight, Shirt, Watch, Armchair, Cpu, Footprints } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { HomeCategory } from "@/lib/data-access";

const CATEGORY_IMAGES: Record<string, string> = {
  apparel: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  accessories: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
  "home-living": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80",
  tech: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  apparel: <Shirt className="size-6" />,
  footwear: <Footprints className="size-6" />,
  accessories: <Watch className="size-6" />,
  "home-living": <Armchair className="size-6" />,
  tech: <Cpu className="size-6" />,
};

const CATEGORY_OVERLAY: Record<string, string> = {
  apparel: "from-primary/80 to-primary/40",
  footwear: "from-violet/80 to-violet/40",
  accessories: "from-warning/80 to-warning/40",
  "home-living": "from-success/80 to-success/40",
  tech: "from-info/80 to-info/40",
};

const CATEGORY_TEXT: Record<string, string> = {
  apparel: "text-primary-foreground",
  footwear: "text-violet-foreground",
  accessories: "text-warning-foreground",
  "home-living": "text-success-foreground",
  tech: "text-info-foreground",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";

function imageFor(category: HomeCategory): string {
  return CATEGORY_IMAGES[category.slug] ?? FALLBACK_IMAGE;
}

function overlayFor(category: HomeCategory): string {
  return CATEGORY_OVERLAY[category.slug] ?? "from-gray-500/80 to-gray-500/40";
}

function textFor(category: HomeCategory): string {
  return CATEGORY_TEXT[category.slug] ?? "text-white";
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  return (
    <section id="categories" className="scroll-mt-6">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Categories
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Shop by category
          </h2>
          <p className="mt-1 text-muted-foreground">
            Explore the collection, organized for easy browsing.
          </p>
        </div>
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Link
                href={`/catalog?category=${category.slug}`}
                className={cn(
                  "group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
                aria-label={`Browse ${category.name}`}
              >
                <Image
                  src={imageFor(category)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t transition-opacity duration-300",
                    overlayFor(category),
                    "opacity-70 group-hover:opacity-90"
                  )}
                />
                <div className="relative z-10 flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <span className={cn("font-semibold", textFor(category))}>
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium opacity-80",
                        textFor(category)
                      )}
                    >
                      Shop now
                      <ArrowUpRight
                        className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    </span>
                  </div>
                  <span className={cn("opacity-90 transition-transform duration-300 group-hover:scale-110", textFor(category))}>
                    {CATEGORY_ICONS[category.slug] ?? <ArrowUpRight className="size-6" />}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
