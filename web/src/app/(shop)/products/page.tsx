import type { Metadata } from "next";
import { ShopGrid } from "@/components/shop-grid";
import { getCatalog } from "@/lib/catalog";
import { toCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด — ถุงเท้าวิ่ง พิลาทิส เสื้อ ผ้าโพกหัว",
  description: "ถุงเท้า Angry RUN, GRIP, OG, MAX REP เสื้อ Oversized และ Baby Tee ผ้าโพกหัว เลือกสีและไซส์ สแกนจ่าย PromptPay ได้ทันที",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = (await getCatalog()).map(toCard);
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">Shop</p>
      <h1 className="mb-6 text-4xl font-extrabold">สินค้าทั้งหมด</h1>
      <ShopGrid products={products} categories={CATEGORIES} syncUrl />
    </section>
  );
}
