"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Availability, Product } from "@/lib/types";
import { formatTHB } from "@/lib/format";
import { LINE_URL } from "@/lib/site-client";
import { MAX_QTY, useCart } from "./cart";
import { BagIcon, ChatIcon, CheckIcon, MinusIcon, PlusIcon } from "./icons";

const BADGE: Record<Exclude<Availability, "on_sale">, string> = {
  preorder: "พรีออเดอร์",
  unavailable: "ยังไม่พร้อมขาย",
};

const CAT_BG: Record<string, string> = {
  run: "var(--color-cat-run)",
  pilates: "var(--color-cat-pilates)",
  daily: "var(--color-cat-daily)",
  apparel: "var(--color-cat-apparel)",
};

export function ProductDetail({ product: p }: { product: Product }) {
  const { add, setOpen } = useCart();

  const colors = useMemo(() => {
    const m = new Map<string, { color: string; hex: string; image: string | null; anyOnSale: boolean }>();
    for (const v of p.variants) {
      const c = m.get(v.color) ?? { color: v.color, hex: v.color_hex, image: v.image, anyOnSale: false };
      if (v.availability === "on_sale") c.anyOnSale = true;
      if (!c.image && v.image) c.image = v.image;
      m.set(v.color, c);
    }
    return [...m.values()];
  }, [p]);

  // เริ่มที่สีแรกที่ยังขายได้ ถ้าไม่มีก็สีแรก
  const [color, setColor] = useState(() => (colors.find((c) => c.anyOnSale) ?? colors[0]).color);
  const sizesForColor = p.sizes.filter((s) => p.variants.some((v) => v.color === color && v.size === s.code));
  const [size, setSize] = useState<string | null>(() => {
    const vs = p.variants.filter((v) => v.color === color);
    if (vs.length === 1) return vs[0].size;
    return vs.find((v) => v.availability === "on_sale")?.size ?? null;
  });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = p.variants.find((v) => v.color === color && v.size === size) ?? null;
  const current = colors.find((c) => c.color === color)!;
  const image = variant?.image ?? current.image;
  const sizeLabel = p.sizes.find((s) => s.code === size)?.label ?? size ?? "";
  const lineMsg = `${p.name} สี ${color} ไซส์ ${sizeLabel} จำนวน ${qty} ${p.unit}`;

  function chooseColor(c: string) {
    setColor(c);
    setAdded(false);
    const vs = p.variants.filter((v) => v.color === c);
    if (!vs.some((v) => v.size === size)) {
      setSize(vs.length === 1 ? vs[0].size : (vs.find((v) => v.availability === "on_sale")?.size ?? null));
    }
  }

  function addToCart() {
    if (!variant || variant.availability !== "on_sale") return;
    add({
      sku: variant.sku,
      slug: p.slug,
      name: p.name,
      color: variant.color,
      size: sizeLabel,
      price: p.price,
      image: variant.image ?? current.image,
      unit: p.unit,
      qty,
    });
    setAdded(true);
    setOpen(true);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div
        className="card relative aspect-square overflow-hidden"
        style={{ background: p.image_bg ?? CAT_BG[p.category] ?? "white" }}
      >
        {image ? (
          <Image
            key={image}
            src={image}
            alt={`${p.name} สี ${color}`}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain p-6"
          />
        ) : (
          // ไม่มีรูป: เว้นว่างไว้ตามกฎ ไม่ใช้รูปสีอื่นแทน
          <div className="grid h-full place-items-center text-muted">ยังไม่มีรูปสีนี้</div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">{p.name}</h1>
          <p className="mt-1 text-muted">{p.subtitle}</p>
          <p className="mt-3 font-display text-3xl font-extrabold">{formatTHB(p.price)}</p>
        </div>

        <fieldset>
          <legend className="mb-2 font-display font-bold">
            สี: <span className="font-semibold">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => chooseColor(c.color)}
                aria-pressed={color === c.color}
                aria-label={`${c.color}${c.anyOnSale ? "" : " (ไม่พร้อมขายทุกไซส์ — สั่งทาง LINE)"}`}
                title={c.color}
                className={`relative size-11 rounded-full border-[2.5px] border-ink ${color === c.color ? "ring-4 ring-red ring-offset-2" : ""}`}
                style={{ background: c.hex }}
              >
                {!c.anyOnSale && (
                  <span aria-hidden className="absolute left-1/2 top-1/2 h-[2.5px] w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-red" />
                )}
              </button>
            ))}
          </div>
        </fieldset>

        {sizesForColor.length > 0 && (
          <fieldset>
            <legend className="mb-2 font-display font-bold">ไซส์</legend>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((s) => {
                const v = p.variants.find((x) => x.color === color && x.size === s.code)!;
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setSize(s.code);
                      setAdded(false);
                    }}
                    aria-pressed={size === s.code}
                    className={`btn !px-4 ${size === s.code ? "btn-ink" : "btn-white"}`}
                  >
                    {s.label}
                    {v.availability !== "on_sale" && (
                      <span className="rounded-full bg-red-deep px-2 py-0.5 text-xs text-white">{BADGE[v.availability]}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {p.size_note && <p className="mt-3 text-sm text-muted">{p.size_note}</p>}
            {p.size_chart && (
              <Link href="/size-guide" className="mt-2 inline-block text-sm font-semibold text-red-deep underline underline-offset-4">
                ดูตารางไซส์ {p.name}
              </Link>
            )}
          </fieldset>
        )}

        <div className="flex items-center gap-4">
          <span className="font-display font-bold">จำนวน</span>
          <div className="flex items-center rounded-full border-[2.5px] border-ink bg-white">
            <button type="button" className="grid size-11 place-items-center" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="ลดจำนวน" disabled={qty <= 1}>
              <MinusIcon />
            </button>
            <span className="w-8 text-center font-display text-lg font-bold" aria-live="polite">
              {qty}
            </span>
            <button type="button" className="grid size-11 place-items-center" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} aria-label="เพิ่มจำนวน" disabled={qty >= MAX_QTY}>
              <PlusIcon />
            </button>
          </div>
        </div>

        {!variant ? (
          <p className="rounded-2xl border-2 border-dashed border-ink p-4 font-semibold">เลือกไซส์ก่อน</p>
        ) : variant.availability === "on_sale" ? (
          <div className="space-y-2">
            <button type="button" onClick={addToCart} className="btn btn-ink w-full text-lg">
              <BagIcon /> ใส่ตะกร้า · {formatTHB(p.price * qty)}
            </button>
            {added && (
              <p className="flex items-center gap-2 text-sm font-semibold text-ok" role="status">
                <CheckIcon className="size-4" /> ใส่ตะกร้าแล้ว
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 rounded-[22px] border-[2.5px] border-dashed border-ink p-4">
            <p className="font-display font-bold">
              {variant.availability === "preorder"
                ? `${color} ไซส์ ${sizeLabel} เปิดพรีออเดอร์ — สั่งทาง LINE ได้เลย`
                : `${color} ไซส์ ${sizeLabel} ยังไม่พร้อมขายบนเว็บ — สอบถามทาง LINE`}
            </p>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line w-full text-lg">
              <ChatIcon /> {variant.availability === "preorder" ? "พรีออเดอร์ทาง LINE" : "สอบถามทาง LINE"}
            </a>
            <p className="text-sm">
              แจ้งในแชทว่า: <strong className="select-all">{lineMsg}</strong>
            </p>
            <p className="text-sm text-muted">ทีมงานจะแจ้งรอบผลิตและวันส่ง</p>
          </div>
        )}

        {p.features.length > 0 && (
          <ul className="space-y-2">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-red" /> {f}
              </li>
            ))}
          </ul>
        )}
        {p.material && <p className="text-sm text-muted">เนื้อผ้า: {p.material}</p>}
      </div>
    </div>
  );
}
