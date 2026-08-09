import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPanel } from "@/components/product/product-panel";
import { siteConfig } from "@/config/site";
import { getProductBySlug } from "@/lib/data-access";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const description =
    product.description ??
    `Shop the ${product.name} at ${siteConfig.name}.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {product.category ? (
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <a href="/catalog" className="hover:text-foreground">
            Products
          </a>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <a
            href={`/catalog?category=${product.category.slug}`}
            className="hover:text-foreground"
          >
            {product.category.name}
          </a>
        </nav>
      ) : null}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.description ? (
            <p className="text-muted-foreground">{product.description}</p>
          ) : null}
          <ProductPanel product={product} />
        </div>
      </div>
    </main>
  );
}
