import "server-only";
import seed from "../../../data/products.json";
import type { Product } from "../types";
import type { Store } from "./types";

/**
 * โหมดดูได้อย่างเดียว — ใช้บน Vercel ตอนยังไม่ได้ต่อ Supabase
 * อ่านสินค้าจาก data/products.json ได้ แต่สร้างออเดอร์/แก้สินค้าไม่ได้ (ไม่มีที่เก็บถาวร)
 */
const products: Product[] = (seed.products as unknown as Product[]).map((p) => ({
  ...p,
  image_bg: p.image_bg ?? null,
  material: p.material ?? null,
  size_note: p.size_note ?? null,
  size_chart: p.size_chart ?? null,
}));

function noWrite(): never {
  throw new Error("ยังไม่ได้ต่อ Supabase — เว็บอยู่ในโหมดดูได้อย่างเดียว");
}

export const readonlyStore: Store = {
  kind: "local",
  getProducts: async () => products,
  setPublished: async () => noWrite(),
  setPrice: async () => noWrite(),
  setAvailability: async () => noWrite(),
  getLogs: async () => [],
  createOrder: async () => noWrite(),
  getOrderById: async () => null,
  getOrderByToken: async () => null,
  getOrderBySession: async () => null,
  transitionOrder: async () => noWrite(),
  updateOrder: async () => noWrite(),
  listOrders: async () => [],
};
