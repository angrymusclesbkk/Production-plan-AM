import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getStore } from "./store";
import type { Product, Variant } from "./types";

export const CATALOG_TAG = "catalog";

/**
 * สินค้าที่เปิดขาย (published) สำหรับหน้าร้าน — แคชไว้ และล้างแคชทันทีเมื่อแอดมินแก้ (updateTag)
 * ห้ามใช้ฟังก์ชันนี้เช็กก่อนรับเงิน ให้ใช้ getProductsFresh() แทน
 */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  // ตาข่ายรองรับ: ถ้าแอดมินกดหลายครั้งติดกันจนการล้างแคชชนกัน หน้าร้านจะถูกต้องเองภายใน ~1 นาที
  cacheLife({ stale: 60, revalidate: 60, expire: 86400 });
  cacheTag(CATALOG_TAG);
  const store = await getStore();
  return (await store.getProducts()).filter((p) => p.published);
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  return (await getCatalog()).find((p) => p.slug === slug) ?? null;
}

/** อ่านสดจากฐานข้อมูล ไม่ผ่านแคช — ใช้ตอนสร้างออเดอร์ และในหน้าแอดมิน */
export async function getProductsFresh(): Promise<Product[]> {
  const store = await getStore();
  return store.getProducts();
}

export function colorsOf(p: Product) {
  const seen = new Map<string, { color: string; hex: string; image: string | null; variants: Variant[] }>();
  for (const v of p.variants) {
    const c = seen.get(v.color) ?? { color: v.color, hex: v.color_hex, image: v.image, variants: [] };
    c.variants.push(v);
    if (!c.image && v.image) c.image = v.image;
    seen.set(v.color, c);
  }
  return [...seen.values()];
}

export function sizeLabel(p: Product, code: string) {
  return p.sizes.find((s) => s.code === code)?.label ?? code;
}

/** รูปแรกของรุ่น (ใช้เป็นรูปการ์ด/OG) */
export function coverImage(p: Product) {
  return p.variants.find((v) => v.image)?.image ?? null;
}

export function productState(p: Product) {
  const onSale = p.variants.filter((v) => v.availability === "on_sale").length;
  if (onSale === p.variants.length) return "all" as const;
  if (onSale === 0) return "none" as const;
  return "some" as const;
}
