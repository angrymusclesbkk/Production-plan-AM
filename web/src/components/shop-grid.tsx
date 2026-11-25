"use client";

import { useEffect, useState } from "react";
import type { CardData } from "@/lib/card";
import type { Category } from "@/lib/types";
import { ProductCard } from "./product-card";

/**
 * การ์ดทุกใบอยู่ใน HTML ตั้งแต่แรก (ดีต่อ SEO) — การกรองหมวดทำฝั่ง browser
 * อ่าน/เขียน ?category= ใน URL ให้แชร์ลิงก์หมวดได้
 */
export function ShopGrid({ products, categories, syncUrl = false }: { products: CardData[]; categories: Category[]; syncUrl?: boolean }) {
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    if (!syncUrl) return;
    const c = new URLSearchParams(window.location.search).get("category");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- อ่าน URL หลัง hydrate
    if (c && categories.some((x) => x.id === c)) setCat(c);
  }, [syncUrl, categories]);

  function choose(id: string) {
    setCat(id);
    if (syncUrl) {
      const url = new URL(window.location.href);
      if (id === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", id);
      window.history.replaceState(null, "", url);
    }
  }

  const used = categories.filter((c) => products.some((p) => p.category === c.id));
  const chips = [{ id: "all", label: "ทั้งหมด" }, ...used];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="กรองตามหมวด">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => choose(c.id)}
            aria-pressed={cat === c.id}
            className={`btn !px-4 !py-1.5 text-sm ${cat === c.id ? "btn-ink" : "btn-white"}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((p, i) => (
          <li key={p.slug} hidden={cat !== "all" && p.category !== cat}>
            <ProductCard p={p} priority={i < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
