import raw from "../../data/products.json";
import type { Category } from "./types";

/** URL เต็มของเว็บ — ห้าม hardcode ที่อื่น (CLAUDE.md) */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  // ลืมตั้งบน Vercel → ใช้โดเมนหลักของโปรเจกต์แทน (กัน canonical/sitemap ชี้ localhost)
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
export const SITE_NAME = "Angry Muscles";
export const TAGLINE = "FOR ANGRY MUSCLES AND HAPPY HEARTS.";

export const LINE_URL = raw.line_url; // https://lin.ee/SNUS5D2
export const LINE_ID = raw.line_id;
export const SOCIAL = raw.social as { tiktok: string; instagram: string; shopee: string };
export const CATEGORIES: Category[] = raw.categories;

export const MAX_QTY_PER_LINE = 10;

/**
 * ค่าส่ง — ตั้งผ่าน env บน Vercel (ยังรอเจ้าของร้านกำหนด)
 * SHIPPING_FEE = ค่าส่งเหมาจ่าย (บาท) · FREE_SHIPPING_MIN = ส่งฟรีเมื่อยอดสินค้าถึง (บาท, ไม่ใส่ = ไม่มีส่งฟรี)
 * ถ้ายังไม่ตั้ง SHIPPING_FEE ระบบจะไม่เปิดรับชำระเงิน (กันเก็บค่าส่งผิด)
 */
export function shippingConfig() {
  const fee = process.env.SHIPPING_FEE;
  const freeMin = process.env.FREE_SHIPPING_MIN;
  const configured = fee !== undefined && fee !== "" && !Number.isNaN(Number(fee));
  return {
    configured,
    fee: configured ? Math.max(0, Math.round(Number(fee))) : 0,
    freeMin: freeMin && !Number.isNaN(Number(freeMin)) ? Math.round(Number(freeMin)) : null,
  };
}

export function shippingFor(subtotal: number) {
  const cfg = shippingConfig();
  if (!cfg.configured) return null;
  if (cfg.freeMin !== null && subtotal >= cfg.freeMin) return 0;
  return cfg.fee;
}

export { formatTHB } from "./format";

export function categoryBg(category: string) {
  return (
    {
      run: "var(--color-cat-run)",
      pilates: "var(--color-cat-pilates)",
      daily: "var(--color-cat-daily)",
      apparel: "var(--color-cat-apparel)",
    }[category] ?? "white"
  );
}

export function lineMessage(name: string, color: string, size: string, qty: number, unit: string) {
  return `${name} สี ${color} ไซส์ ${size} จำนวน ${qty} ${unit}`;
}
