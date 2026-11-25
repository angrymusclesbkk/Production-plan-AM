import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

/** เฉพาะรุ่นที่ published — ปิดรุ่นแล้วจะหายจาก sitemap เอง */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalog();
  const fixed = ["", "/products", "/size-guide", "/policies/shipping", "/policies/returns", "/policies/privacy"];
  return [
    ...fixed.map((p) => ({ url: SITE_URL + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [...new Set(p.variants.map((v) => v.image).filter(Boolean))].map((i) => SITE_URL + i),
    })),
  ];
}
