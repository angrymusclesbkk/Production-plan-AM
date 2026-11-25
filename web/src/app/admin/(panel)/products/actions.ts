"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { getStore } from "@/lib/store";
import { AVAILABILITY_VALUES, type Availability } from "@/lib/types";

/**
 * ล้างแคชหน้าร้าน แล้วเปิดหน้าที่เกี่ยวข้องล่วงหน้าทันที
 * (คำขอแรกหลังล้างแคชจะได้หน้าเก่าหนึ่งครั้ง — ให้คำขอนี้รับไปแทนลูกค้า)
 */
async function refreshStorefront() {
  updateTag(CATALOG_TAG);
  // หน้าสินค้าที่เคยตอบ "ไม่พบ" (ตอนปิดรุ่น) ไม่ได้ผูกกับ tag — ต้องล้างตาม path ด้วย ไม่งั้นเปิดรุ่นกลับแล้วยังค้าง
  revalidatePath("/products/[slug]", "page");
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const slugs = (await (await getStore()).getProducts()).map((p) => p.slug);
  const paths = ["/", "/products", "/sitemap.xml", "/feeds/google-merchant.xml", ...slugs.map((s) => `/products/${s}`)];
  after(async () => {
    await Promise.allSettled(paths.map((p) => fetch(origin + p, { cache: "no-store" })));
  });
}

type Result = { ok: true; missing?: string[] } | { ok: false; error: string };

const availability = z.enum(AVAILABILITY_VALUES as [Availability, ...Availability[]]);

export async function setAvailabilityAction(skus: string[], value: Availability): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ skus: z.array(z.string().min(1).max(64)).min(1).max(200), value: availability }).safeParse({ skus, value });
  if (!parsed.success) return { ok: false, error: "ข้อมูลไม่ถูกต้อง" };
  try {
    const r = await (await getStore()).setAvailability(parsed.data.skus, parsed.data.value, admin.email);
    await refreshStorefront();
    return { ok: true, missing: r.missing };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }
}

export async function setPublishedAction(slug: string, published: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (typeof published !== "boolean" || !slug) return { ok: false, error: "ข้อมูลไม่ถูกต้อง" };
  try {
    await (await getStore()).setPublished(slug, published, admin.email);
    await refreshStorefront();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "บันทึกไม่สำเร็จ" };
  }
}

export async function setPriceAction(slug: string, price: number): Promise<Result> {
  const admin = await requireAdmin();
  if (!slug || !Number.isInteger(price) || price < 1 || price > 100000) return { ok: false, error: "ราคาต้องเป็นจำนวนเต็ม 1–100,000 บาท" };
  try {
    await (await getStore()).setPrice(slug, price, admin.email);
    await refreshStorefront();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "บันทึกไม่สำเร็จ" };
  }
}

const THAI: Record<string, Availability> = {
  on_sale: "on_sale",
  preorder: "preorder",
  unavailable: "unavailable",
  "พร้อมขาย": "on_sale",
  "รอพรีออเดอร์": "preorder",
  "พรีออเดอร์": "preorder",
  "ยังไม่พร้อมขาย": "unavailable",
};

export type ImportReport = { updated: number; unchanged: number; missing: string[]; invalid: string[] } | { error: string };

/** นำเข้า CSV คอลัมน์ sku,availability — แถวที่ผิดจะรายงานกลับ ไม่ข้ามเงียบ ๆ */
export async function importCsvAction(_prev: ImportReport | null, form: FormData): Promise<ImportReport> {
  const admin = await requireAdmin();
  const file = form.get("file");
  const text = file instanceof File && file.size ? await file.text() : String(form.get("text") ?? "");
  if (!text.trim()) return { error: "ไม่มีข้อมูล" };
  if (text.length > 200_000) return { error: "ไฟล์ใหญ่เกินไป" };

  const groups = new Map<Availability, string[]>();
  const invalid: string[] = [];
  text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .forEach((line, idx) => {
      const t = line.trim();
      if (!t) return;
      const [skuRaw, valRaw] = t.split(/[,\t;]/).map((s) => s?.trim().replace(/^"|"$/g, ""));
      if (idx === 0 && skuRaw?.toLowerCase() === "sku") return; // หัวตาราง
      const v = THAI[valRaw ?? ""];
      if (!skuRaw || !v) {
        invalid.push(`บรรทัด ${idx + 1}: ${t}`);
        return;
      }
      groups.set(v, [...(groups.get(v) ?? []), skuRaw]);
    });

  const store = await getStore();
  const before = new Map((await store.getProducts()).flatMap((p) => p.variants.map((v) => [v.sku, v.availability] as const)));
  let updated = 0;
  let unchanged = 0;
  const missing: string[] = [];
  for (const [value, skus] of groups) {
    const r = await store.setAvailability(skus, value, admin.email);
    missing.push(...r.missing);
    for (const s of r.updated) {
      if (before.get(s) === value) unchanged++;
      else updated++;
    }
  }
  await refreshStorefront();
  return { updated, unchanged, missing, invalid };
}
