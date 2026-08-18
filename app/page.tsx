import type { Metadata } from "next";

import { BestSelling } from "@/components/home/best-selling";
import { CategoryGrid } from "@/components/home/category-grid";
import { HeroBanner } from "@/components/home/hero-banner";
import { NewArrivals } from "@/components/home/new-arrivals";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { TrendingProducts } from "@/components/home/trending-products";
import { ValueProps } from "@/components/home/value-props";
import { siteConfig } from "@/config/site";
import {
  getBestSelling,
  getCategories,
  getNewArrivals,
  getTrendingProducts,
} from "@/lib/data-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: `Shop ${siteConfig.name} — apparel, footwear, accessories, home goods, and tech.`,
};

export default async function Home() {
  const [categories, trending, newArrivals, bestSelling] = await Promise.all([
    getCategories(),
    getTrendingProducts(),
    getNewArrivals(),
    getBestSelling(),
  ]);

  return (
    <main>
      <HeroBanner />
      <ValueProps />
      <CategoryGrid categories={categories} />
      <TrendingProducts products={trending} />
      <NewArrivals products={newArrivals} />
      <BestSelling products={bestSelling} />
      <NewsletterBand />
    </main>
  );
}
