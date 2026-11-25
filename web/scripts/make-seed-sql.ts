/** สร้าง supabase/seed.sql จาก data/products.json — รัน: npx tsx scripts/make-seed-sql.ts */
import fs from "node:fs";
import data from "../data/products.json";

const s = (v: unknown) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const j = (v: unknown) => `${s(JSON.stringify(v ?? []))}::jsonb`;

type P = (typeof data.products)[number] & { image_bg?: string };
const lines: string[] = [
  "-- สินค้าเริ่มต้นจาก data/products.json (สร้างอัตโนมัติ ห้ามแก้มือ)",
  "-- วิธีใช้: Supabase Dashboard → SQL Editor → วางทั้งไฟล์ → Run (หลังรัน 0001_init.sql แล้ว)",
  "-- รันซ้ำได้: รุ่น/SKU ที่มีอยู่แล้วจะไม่ถูกเขียนทับ (สถานะที่แก้ในแอดมินไม่หาย)",
  "",
];
(data.products as P[]).forEach((p, i) => {
  lines.push(
    `insert into public.products (slug, name, subtitle, category, published, price, unit, material, sizes, size_note, size_chart, features, image_bg, sort) values (${[
      s(p.slug), s(p.name), s(p.subtitle), s(p.category), p.published ? "true" : "false", p.price, s(p.unit), s(p.material),
      j(p.sizes), s(p.size_note), s(p.size_chart), j(p.features), s(p.image_bg ?? null), i,
    ].join(", ")}) on conflict (slug) do nothing;`,
  );
  p.variants.forEach((v, k) => {
    if (!v.sku) throw new Error(`ไม่มี SKU: ${p.slug} ${v.color} ${v.size}`);
    lines.push(
      `insert into public.variants (sku, product_slug, color, color_hex, size, availability, image, sort) values (${[
        s(v.sku), s(p.slug), s(v.color), s(v.color_hex), s(v.size), `'${v.availability}'`, s(v.image), k,
      ].join(", ")}) on conflict (sku) do nothing;`,
    );
  });
});
fs.writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log("เขียน supabase/seed.sql แล้ว:", data.products.length, "รุ่น");
