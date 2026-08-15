import type { Metadata } from "next";

import { CategoryGrid } from "@/components/home/category-grid";
import { HeroBanner } from "@/components/home/hero-banner";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { TrendingProducts } from "@/components/home/trending-products";
import { ValueProps } from "@/components/home/value-props";
import { siteConfig } from "@/config/site";
import { getCategories, getTrendingProducts } from "@/lib/data-access";

export const metadata: Metadata = {
  description: `Shop ${siteConfig.name} — apparel, footwear, accessories, home goods, and tech.`,
};

export default async function Home() {
  const [categories, trending] = await Promise.all([
    getCategories(),
    getTrendingProducts(),
  ]);

  return (
    <main>
      <HeroBanner />
      <ValueProps />
      <CategoryGrid categories={categories} />
      <TrendingProducts products={trending} />
      <NewsletterBand />
    </main>
  );
}
