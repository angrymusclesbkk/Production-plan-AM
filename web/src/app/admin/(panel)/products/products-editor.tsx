"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { Availability, Product } from "@/lib/types";
import { setAvailabilityAction, setPriceAction, setPublishedAction } from "./actions";

const OPTIONS: { value: Availability; label: string; on: string }[] = [
  { value: "on_sale", label: "พร้อมขาย", on: "bg-ok text-white" },
  { value: "preorder", label: "รอพรีออเดอร์", on: "bg-[#F5C542] text-ink" },
  { value: "unavailable", label: "ยังไม่พร้อมขาย", on: "bg-muted text-white" },
];
const LABEL: Record<Availability, string> = { on_sale: "พร้อมขาย", preorder: "รอพรีออเดอร์", unavailable: "ยังไม่พร้อมขาย" };

type Toast = { text: string; undo?: () => void; error?: boolean } | null;

export function ProductsEditor({ products }: { products: Product[] }) {
  const [avail, setAvailState] = useState<Record<string, Availability>>(() =>
    Object.fromEntries(products.flatMap((p) => p.variants.map((v) => [v.sku, v.availability]))),
  );
  // ค่าล่าสุดเสมอ — ใช้ตอนเลิกทำ (closure ของปุ่มเลิกทำถูกสร้างก่อนค่าเปลี่ยน)
  const availRef = useRef(avail);
  const setAvail = (patch: Record<string, Availability>) => {
    availRef.current = { ...availRef.current, ...patch };
    setAvailState(availRef.current);
  };
  const [published, setPublished] = useState<Record<string, boolean>>(() => Object.fromEntries(products.map((p) => [p.slug, p.published])));
  const [toast, setToast] = useState<Toast>(null);
  const [, start] = useTransition();
  const timer = useRef<number | undefined>(undefined);

  function show(t: Toast) {
    setToast(t);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 8000);
  }

  /** เปลี่ยนสถานะทันทีบนจอ แล้วค่อยบันทึก — ไม่สำเร็จจะเด้งกลับ */
  function apply(skus: string[], value: Availability, label: string, isUndo = false) {
    const prev = Object.fromEntries(skus.map((s) => [s, availRef.current[s]])) as Record<string, Availability>;
    const changed = skus.filter((s) => prev[s] !== value);
    if (!changed.length) return;
    setAvail(Object.fromEntries(changed.map((s) => [s, value])));
    start(async () => {
      const r = await setAvailabilityAction(changed, value);
      if (!r.ok) {
        setAvail(prev);
        show({ text: r.error, error: true });
        return;
      }
      if (isUndo) {
        show({ text: "เลิกทำแล้ว" });
        return;
      }
      show({
        text: `บันทึกแล้ว · ${label} → ${LABEL[value]}`,
        undo: () => {
          // คืนค่าเดิมแยกตามกลุ่มค่า
          const byValue = new Map<Availability, string[]>();
          for (const s of changed) byValue.set(prev[s], [...(byValue.get(prev[s]) ?? []), s]);
          for (const [v, list] of byValue) apply(list, v, label, true);
        },
      });
    });
  }

  function togglePublished(p: Product) {
    const next = !published[p.slug];
    setPublished((x) => ({ ...x, [p.slug]: next }));
    start(async () => {
      const r = await setPublishedAction(p.slug, next);
      if (!r.ok) {
        setPublished((x) => ({ ...x, [p.slug]: !next }));
        show({ text: r.error, error: true });
      } else show({ text: `${p.name}: ${next ? "เปิดขึ้นเว็บแล้ว" : "ปิดทั้งรุ่นแล้ว (ไม่ขึ้นเว็บ)"}` });
    });
  }

  return (
    <div className="space-y-6">
      {products.map((p) => {
        const colors = [...new Map(p.variants.map((v) => [v.color, v.color_hex])).entries()];
        const isOn = published[p.slug];
        return (
          <section key={p.slug} className={`card overflow-hidden ${isOn ? "" : "opacity-80"}`} aria-labelledby={`h-${p.slug}`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b-2 border-ink bg-cream p-4">
              <h2 id={`h-${p.slug}`} className="text-xl font-extrabold">{p.name}</h2>
              <Link href={`/products/${p.slug}`} target="_blank" className="text-sm underline">ดูหน้าร้าน</Link>
              <button
                type="button"
                role="switch"
                aria-checked={isOn}
                onClick={() => togglePublished(p)}
                className="ml-auto flex min-h-11 items-center gap-2 font-display font-bold"
              >
                <span className={`relative h-7 w-12 rounded-full border-2 border-ink transition ${isOn ? "bg-ok" : "bg-white"}`}>
                  <span className={`absolute top-0.5 size-5 rounded-full border-2 border-ink bg-white transition-all ${isOn ? "left-[22px]" : "left-0.5"}`} />
                </span>
                {isOn ? "ขึ้นเว็บอยู่" : "ปิดทั้งรุ่น"}
              </button>
              <PriceEditor product={p} onDone={show} />
            </div>

            <div className="space-y-4 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">ตั้งทั้งรุ่นเป็น:</span>
                {OPTIONS.map((o) => (
                  <button key={o.value} type="button" className="btn btn-white !min-h-9 !px-3 !py-1 text-sm" onClick={() => apply(p.variants.map((v) => v.sku), o.value, `${p.name} ทั้งรุ่น`)}>
                    {o.label}
                  </button>
                ))}
              </div>

              {colors.map(([color, hex]) => {
                const vs = p.variants.filter((v) => v.color === color);
                return (
                  <div key={color} className="rounded-2xl border-2 border-ink/20 p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="size-6 shrink-0 rounded-full border-2 border-ink" style={{ background: hex }} aria-hidden />
                      <span className="font-display font-bold">{color}</span>
                      {vs.length > 1 && (
                        <span className="ml-auto flex flex-wrap items-center gap-1 text-xs">
                          ทุกไซส์ของสีนี้:
                          {OPTIONS.map((o) => (
                            <button key={o.value} type="button" className="min-h-9 rounded-full border-2 border-ink px-2 font-semibold" onClick={() => apply(vs.map((v) => v.sku), o.value, `${p.name} ${color} ทุกไซส์`)}>
                              {o.label}
                            </button>
                          ))}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {vs.map((v) => {
                        const size = p.sizes.find((s) => s.code === v.size)?.label ?? v.size;
                        return (
                          <li key={v.sku} className="flex flex-wrap items-center gap-2">
                            <span className="w-28 text-sm">
                              <span className="font-semibold">{size}</span>
                              <span className="block text-xs text-muted">{v.sku}</span>
                            </span>
                            <div role="radiogroup" aria-label={`สถานะ ${p.name} ${color} ${size}`} className="flex overflow-hidden rounded-full border-2 border-ink">
                              {OPTIONS.map((o) => {
                                const active = avail[v.sku] === o.value;
                                return (
                                  <button
                                    key={o.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => apply([v.sku], o.value, `${p.name} ${color} ${size}`)}
                                    className={`min-h-11 border-r-2 border-ink px-3 text-sm font-semibold last:border-r-0 ${active ? o.on : "bg-white"}`}
                                  >
                                    {o.label}
                                  </button>
                                );
                              })}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {toast && (
        <div role="status" className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-2xl border-[2.5px] border-ink p-4 shadow-[var(--shadow-pop)] ${toast.error ? "bg-pink" : "bg-white"}`}>
          <span className="flex-1 font-semibold">{toast.text}</span>
          {toast.undo && (
            <button type="button" className="btn btn-ink !min-h-9 !px-3 !py-1 text-sm" onClick={() => { toast.undo!(); setToast(null); }}>
              เลิกทำ
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PriceEditor({ product, onDone }: { product: Product; onDone: (t: Toast) => void }) {
  const [value, setValue] = useState(String(product.price));
  const [saved, setSaved] = useState(product.price);
  const [pending, start] = useTransition();
  const dirty = Number(value) !== saved;
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(value);
        start(async () => {
          const r = await setPriceAction(product.slug, n);
          if (r.ok) {
            setSaved(n);
            onDone({ text: `${product.name}: ราคาใหม่ ${n} บาท` });
          } else onDone({ text: r.error, error: true });
        });
      }}
    >
      <label htmlFor={`price-${product.slug}`} className="text-sm font-semibold">ราคา</label>
      <input id={`price-${product.slug}`} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} className="field !min-h-11 w-24" />
      {dirty && <button type="submit" className="btn btn-ink !min-h-11 !px-3 text-sm" disabled={pending}>บันทึก</button>}
    </form>
  );
}
