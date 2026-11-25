import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductDetail } from "@/components/product-detail";
import { coverImage, getCatalog, getCatalogProduct } from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Availability } from "@/lib/types";

const SCHEMA_AVAILABILITY: Record<Availability, string> = {
  on_sale: "https://schema.org/InStock",
  preorder: "https://schema.org/PreOrder",
  unavailable: "https://schema.org/OutOfStock",
};

export async function generateStaticParams() {
  return (await getCatalog()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getCatalogProduct(slug);
  if (!p) return { title: "ไม่พบสินค้า", robots: { index: false } };
  const img = coverImage(p);
  const title = `${p.name} ${p.subtitle}`;
  return {
    title,
    description: `${p.name} — ${p.subtitle} ราคา ${p.price} บาท ${p.features.slice(0, 2).join(" · ")}`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: `${title} | ${SITE_NAME}`, images: img ? [{ url: img, alt: p.name }] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const p = await getCatalogProduct(slug);
  if (!p) notFound();

  const url = `${SITE_URL}/products/${p.slug}`;
  const images = [...new Set(p.variants.map((v) => v.image).filter(Boolean))].map((i) => SITE_URL + i);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: [p.subtitle, ...p.features].join(" · "),
          image: images,
          brand: { "@type": "Brand", name: SITE_NAME },
          url,
          offers: p.variants.map((v) => ({
            "@type": "Offer",
            sku: v.sku,
            name: `${p.name} ${v.color} ${p.sizes.find((s) => s.code === v.size)?.label ?? v.size}`,
            price: p.price,
            priceCurrency: "THB",
            availability: SCHEMA_AVAILABILITY[v.availability],
            itemCondition: "https://schema.org/NewCondition",
            url,
          })),
        }}
      />
      <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/" className="underline-offset-4 hover:underline">
          หน้าแรก
        </Link>{" "}
        /{" "}
        <Link href="/products" className="underline-offset-4 hover:underline">
          สินค้า
        </Link>{" "}
        / <span className="text-ink">{p.name}</span>
      </nav>
      <ProductDetail product={p} />
    </div>
  );
}
