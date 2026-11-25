/**
 * นำเข้าสินค้าจาก data/products.json เข้า Supabase
 *   npm run seed           → เพิ่มเฉพาะรุ่น/SKU ที่ยังไม่มี (ไม่ทับสถานะ/ราคาที่แอดมินแก้ไว้)
 *   npm run seed -- --force → เขียนทับทุกอย่างด้วยค่าจากไฟล์ (ระวัง: สถานะที่แก้ในแอดมินจะหาย)
 */
import { createClient } from "@supabase/supabase-js";
import data from "../data/products.json";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* ใช้ env ที่ตั้งไว้แล้ว */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("ต้องมี NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env.local");
  process.exit(1);
}
const force = process.argv.includes("--force");
const db = createClient(url, key, { auth: { persistSession: false } });

type P = (typeof data.products)[number] & { image_bg?: string };

async function main() {
  const products = (data.products as P[]).map((p, i) => ({
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    published: p.published,
    price: p.price,
    unit: p.unit,
    material: p.material ?? null,
    sizes: p.sizes,
    size_note: p.size_note ?? null,
    size_chart: p.size_chart ?? null,
    features: p.features,
    image_bg: p.image_bg ?? null,
    sort: i,
  }));
  const variants = (data.products as P[]).flatMap((p) =>
    p.variants.map((v, i) => ({
      sku: v.sku,
      product_slug: p.slug,
      color: v.color,
      color_hex: v.color_hex,
      size: v.size,
      availability: v.availability,
      image: v.image,
      sort: i,
    })),
  );
  const missingSku = variants.filter((v) => !v.sku);
  if (missingSku.length) throw new Error("มี variant ที่ไม่มี SKU: " + JSON.stringify(missingSku));

  const opts = { onConflict: undefined as string | undefined, ignoreDuplicates: !force };
  let r = await db.from("products").upsert(products, { ...opts, onConflict: "slug" });
  if (r.error) throw r.error;
  r = await db.from("variants").upsert(variants, { ...opts, onConflict: "sku" });
  if (r.error) throw r.error;

  const { count: pc } = await db.from("products").select("*", { count: "exact", head: true });
  const { count: vc } = await db.from("variants").select("*", { count: "exact", head: true });
  console.log(`เสร็จ (${force ? "เขียนทับ" : "เพิ่มเฉพาะที่ยังไม่มี"}) — ในฐานข้อมูลมี ${pc} รุ่น ${vc} ตัวเลือก`);
}

main().catch((e) => {
  console.error("seed ไม่สำเร็จ:", e.message ?? e);
  process.exit(1);
});
