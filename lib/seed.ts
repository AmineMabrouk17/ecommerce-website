export interface SeedCategory {
  name: string;
  slug: string;
}

export interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  categorySlug: string;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

export const DEMO_CUSTOMER = {
  email: "demo@example.com",
  password: "demo1234",
  fullName: "Demo Customer",
} as const;

export const SEED_CATEGORIES: readonly SeedCategory[] = [
  { name: "Apparel", slug: "apparel" },
  { name: "Footwear", slug: "footwear" },
  { name: "Accessories", slug: "accessories" },
  { name: "Home & Living", slug: "home-living" },
  { name: "Tech", slug: "tech" },
];

export const SEED_PRODUCTS: readonly SeedProduct[] = [
  {
    name: "Lumina Everyday Tee",
    slug: "lumina-everyday-tee",
    description: "A soft organic-cotton tee with a clean fit, made for daily wear.",
    price: 2499,
    compareAtPrice: 3200,
    stock: 120,
    categorySlug: "apparel",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Cloudknit Hoodie",
    slug: "cloudknit-hoodie",
    description: "A brushed-fleece hoodie that stays warm without the weight.",
    price: 4900,
    stock: 80,
    categorySlug: "apparel",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    isPublished: true,
    isFeatured: true,
  },
  {
    name: "Heritage Denim Jacket",
    slug: "heritage-denim-jacket",
    description: "A structured denim jacket that breaks in beautifully over time.",
    price: 7500,
    compareAtPrice: 9000,
    stock: 40,
    categorySlug: "apparel",
    images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Swift Runners",
    slug: "swift-runners",
    description: "Cushioned road runners with a responsive, breathable upper.",
    price: 8900,
    compareAtPrice: 11000,
    stock: 65,
    categorySlug: "footwear",
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80"],
    isPublished: true,
    isFeatured: true,
  },
  {
    name: "Trail Hiker Boots",
    slug: "trail-hiker-boots",
    description: "Water-resistant hiking boots with grippy all-terrain soles.",
    price: 12900,
    stock: 35,
    categorySlug: "footwear",
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Canvas Court Sneakers",
    slug: "canvas-court-sneakers",
    description: "Minimal canvas sneakers with a classic court silhouette.",
    price: 4500,
    stock: 90,
    categorySlug: "footwear",
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Aurora Field Backpack",
    slug: "aurora-field-backpack",
    description: "A weatherproof daypack with padded laptop sleeve and side pockets.",
    price: 6800,
    compareAtPrice: 7900,
    stock: 55,
    categorySlug: "accessories",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
    isPublished: true,
    isFeatured: true,
  },
  {
    name: "Pinnacle Steel Watch",
    slug: "pinnacle-steel-watch",
    description: "A minimalist steel watch with sapphire glass and a mesh strap.",
    price: 15900,
    stock: 25,
    categorySlug: "accessories",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
    isPublished: true,
    isFeatured: true,
  },
  {
    name: "Polaroid Wayfarer Sunglasses",
    slug: "polaroid-wayfarer-sunglasses",
    description: "UV-protective wayfarers with a timeless acetate frame.",
    price: 5900,
    stock: 70,
    categorySlug: "accessories",
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Amber Table Lamp",
    slug: "amber-table-lamp",
    description: "A warm-glowing table lamp with a linen shade and brass stem.",
    price: 3900,
    stock: 45,
    categorySlug: "home-living",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Studio Pour-Over Set",
    slug: "studio-pour-over-set",
    description: "A ceramic pour-over carafe with a matching dripper and two cups.",
    price: 2900,
    compareAtPrice: 3500,
    stock: 100,
    categorySlug: "home-living",
    images: ["https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Linen Throw Blanket",
    slug: "linen-throw-blanket",
    description: "A breathable stonewashed-linen throw for cozy evenings.",
    price: 3400,
    stock: 60,
    categorySlug: "home-living",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Halo Wireless Headphones",
    slug: "halo-wireless-headphones",
    description: "Over-ear headphones with active noise cancelling and 40h battery.",
    price: 14900,
    compareAtPrice: 17900,
    stock: 30,
    categorySlug: "tech",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    isPublished: true,
    isFeatured: true,
  },
  {
    name: "Resonance Bluetooth Speaker",
    slug: "resonance-bluetooth-speaker",
    description: "A portable speaker with rich 360-degree sound and deep bass.",
    price: 9900,
    stock: 50,
    categorySlug: "tech",
    images: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
  {
    name: "Minimalist Mechanical Keyboard",
    slug: "minimalist-mechanical-keyboard",
    description: "A low-profile mechanical keyboard with tactile switches and RGB.",
    price: 12900,
    stock: 3,
    categorySlug: "tech",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"],
    isPublished: true,
    isFeatured: false,
  },
];

export function validateSeedCatalog(
  categories: readonly SeedCategory[] = SEED_CATEGORIES,
  products: readonly SeedProduct[] = SEED_PRODUCTS,
): void {
  const categorySlugs = categories.map((category) => category.slug);
  if (new Set(categorySlugs).size !== categorySlugs.length) {
    throw new Error("seed catalog has duplicate category slugs");
  }

  const productSlugs = products.map((product) => product.slug);
  if (new Set(productSlugs).size !== productSlugs.length) {
    throw new Error("seed catalog has duplicate product slugs");
  }

  const knownCategorySlugs = new Set(categorySlugs);
  for (const product of products) {
    if (!Number.isInteger(product.price) || product.price <= 0) {
      throw new Error(`product ${product.slug} must have a positive integer price in cents`);
    }
    if (product.compareAtPrice !== undefined && product.compareAtPrice <= product.price) {
      throw new Error(`product ${product.slug} compare-at price must exceed its price`);
    }
    if (!Number.isInteger(product.stock) || product.stock < 0) {
      throw new Error(`product ${product.slug} must have a non-negative integer stock`);
    }
    if (!knownCategorySlugs.has(product.categorySlug)) {
      throw new Error(`product ${product.slug} references unknown category ${product.categorySlug}`);
    }
    if (product.images.length === 0 || product.images.some((image) => !image.startsWith("https://"))) {
      throw new Error(`product ${product.slug} must have at least one https image`);
    }
  }
}
