"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./cart";
import { CloseIcon, MinusIcon, PlusIcon } from "./icons";
import { formatTHB } from "@/lib/format";

export type ShippingInfo = { configured: boolean; fee: number; freeMin: number | null };

export function shippingText(s: ShippingInfo, subtotal: number) {
  if (!s.configured) return "[ใส่อัตราค่าส่ง]";
  if (s.freeMin !== null && subtotal >= s.freeMin) return "ส่งฟรี";
  return formatTHB(s.fee);
}

export function CartDrawer({ shipping }: { shipping: ShippingInfo }) {
  const { lines, open, setOpen, setQty, remove, subtotal } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="no-print fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="ตะกร้าสินค้า">
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label="ปิดตะกร้า" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-[2.5px] border-ink bg-cream">
        <div className="flex items-center justify-between border-b-[2.5px] border-ink px-5 py-4">
          <h2 className="text-2xl font-extrabold">ตะกร้า</h2>
          <button ref={closeRef} type="button" className="btn btn-white !px-3" onClick={() => setOpen(false)} aria-label="ปิด">
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="grid flex-1 place-content-center gap-4 p-8 text-center">
            <p className="font-display text-xl font-bold">ตะกร้ายังว่าง</p>
            <p className="text-muted">เลือกถุงเท้าคู่แรกของคุณได้เลย</p>
            <Link href="/products" className="btn btn-ink mx-auto" onClick={() => setOpen(false)}>
              ไปเลือกสินค้า
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y-2 divide-ink/10 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.sku} className="flex gap-3 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-white">
                    {l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-contain" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${l.slug}`} className="font-display font-bold leading-tight" onClick={() => setOpen(false)}>
                      {l.name}
                    </Link>
                    <p className="text-sm text-muted">
                      สี {l.color} · ไซส์ {l.size}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border-2 border-ink">
                        <button
                          type="button"
                          className="grid size-10 place-items-center"
                          onClick={() => setQty(l.sku, l.qty - 1)}
                          disabled={l.qty <= 1}
                          aria-label="ลดจำนวน"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-6 text-center font-bold" aria-live="polite">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          className="grid size-10 place-items-center"
                          onClick={() => setQty(l.sku, l.qty + 1)}
                          aria-label="เพิ่มจำนวน"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                      <button type="button" className="min-h-11 text-sm font-semibold text-red-deep underline" onClick={() => remove(l.sku)}>
                        ลบ
                      </button>
                    </div>
                  </div>
                  <p className="font-display font-bold">{formatTHB(l.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t-[2.5px] border-ink bg-white px-5 py-4">
              <div className="flex justify-between">
                <span>ยอดสินค้า</span>
                <span className="font-bold">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>ค่าส่ง</span>
                <span>{shippingText(shipping, subtotal)}</span>
              </div>
              <Link href="/checkout" className="btn btn-ink mt-2 w-full" onClick={() => setOpen(false)}>
                ไปชำระเงิน · {formatTHB(subtotal)}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
