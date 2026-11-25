"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart";
import { ChatIcon } from "@/components/icons";
import { formatTHB } from "@/lib/format";
import type { Quote, Unavailable } from "@/lib/orders";
import { LINE_URL } from "@/lib/site-client";
import { getQuoteAction, placeOrderAction } from "./actions";

type Fields = "name" | "phone" | "email" | "line1" | "district" | "province" | "postcode" | "consent";

export function CheckoutForm({ paymentsOff }: { paymentsOff: boolean }) {
  const { lines, ready, removeMany } = useCart();
  const params = useSearchParams();
  const cancelled = params.get("cancelled") === "1";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [removed, setRemoved] = useState<Unavailable[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Fields | "form", string>>>({});
  const [pending, startTransition] = useTransition();

  const cartKey = useMemo(() => lines.map((l) => `${l.sku}:${l.qty}`).join(","), [lines]);

  useEffect(() => {
    if (!ready) return;
    if (!lines.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ตะกร้าว่าง ไม่ต้องถาม server
      setQuote(null);
      return;
    }
    let alive = true;
    getQuoteAction(lines.map((l) => ({ sku: l.sku, qty: l.qty }))).then((q) => {
      if (!alive || !q) return;
      setQuote(q);
      if (q.unavailable.length) {
        setRemoved((r) => [...r, ...q.unavailable]);
        removeMany(q.unavailable.map((u) => u.sku));
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ถามใหม่เมื่อของในตะกร้าเปลี่ยน
  }, [ready, cartKey]);

  function submit(form: FormData) {
    setErrors({});
    const input = {
      items: lines.map((l) => ({ sku: l.sku, qty: l.qty })),
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      line1: String(form.get("line1") ?? ""),
      district: String(form.get("district") ?? ""),
      province: String(form.get("province") ?? ""),
      postcode: String(form.get("postcode") ?? ""),
      consent: form.get("consent") === "on",
    };
    startTransition(async () => {
      const r = await placeOrderAction(input);
      if (r.ok) {
        window.location.assign(r.url);
        return;
      }
      if (r.kind === "invalid") setErrors(r.fieldErrors);
      else if (r.kind === "unavailable") {
        setRemoved((x) => [...x, ...r.unavailable]);
        removeMany(r.unavailable.map((u) => u.sku));
        setErrors({ form: "มีสินค้าบางชิ้นไม่พร้อมขายแล้ว เอาออกจากตะกร้าให้แล้ว ตรวจยอดใหม่แล้วกดชำระเงินอีกครั้ง" });
      } else setErrors({ form: r.message });
    });
  }

  if (!ready) return <p>กำลังโหลดตะกร้า…</p>;

  const removedBox = removed.length > 0 && (
    <div className="card space-y-3 bg-pink p-5" role="alert">
      <p className="font-display font-bold">สินค้าเหล่านี้ไม่พร้อมขายแล้ว เอาออกจากตะกร้าให้แล้ว</p>
      <ul className="list-disc pl-5">
        {removed.map((u) => (
          <li key={u.sku}>
            {u.name} — {u.reason}
          </li>
        ))}
      </ul>
      <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line">
        <ChatIcon /> สั่งชิ้นนี้ทาง LINE
      </a>
    </div>
  );

  if (!lines.length) {
    return (
      <div className="space-y-6">
        {removedBox}
        <div className="card grid place-items-center gap-4 p-10 text-center">
          <p className="font-display text-xl font-bold">ตะกร้ายังว่าง</p>
          <Link href="/products" className="btn btn-ink">
            ไปเลือกสินค้า
          </Link>
        </div>
      </div>
    );
  }

  const err = (k: Fields) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-1 text-sm font-semibold text-red-deep">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: Fields) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_380px]">
      <form action={submit} className="space-y-5" noValidate>
        {cancelled && <p className="card bg-cat-daily p-4 font-semibold">ยกเลิกการชำระเงินแล้ว ของยังอยู่ในตะกร้า กดชำระเงินใหม่ได้เลย</p>}
        {removedBox}
        <p className="text-sm text-muted">ไม่ต้องสมัครสมาชิก กรอกข้อมูลจัดส่งแล้วสแกนจ่ายได้เลย</p>

        <div>
          <label htmlFor="name" className="mb-1 block font-display font-bold">ชื่อผู้รับ</label>
          <input id="name" name="name" autoComplete="name" className="field" required {...aria("name")} />
          {err("name")}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1 block font-display font-bold">เบอร์โทร</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0812345678" className="field" required {...aria("phone")} />
            {err("phone")}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block font-display font-bold">อีเมล</label>
            <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className="field" required {...aria("email")} />
            {err("email")}
            <p className="mt-1 text-xs text-muted">ส่งอีเมลยืนยันและลิงก์ดูสถานะออเดอร์ไปที่นี่</p>
          </div>
        </div>
        <div>
          <label htmlFor="line1" className="mb-1 block font-display font-bold">ที่อยู่จัดส่ง</label>
          <textarea id="line1" name="line1" rows={3} autoComplete="street-address" placeholder="บ้านเลขที่ หมู่บ้าน/อาคาร ถนน ตำบล/แขวง" className="field" required {...aria("line1")} />
          {err("line1")}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="district" className="mb-1 block font-display font-bold">อำเภอ/เขต</label>
            <input id="district" name="district" autoComplete="address-level3" className="field" required {...aria("district")} />
            {err("district")}
          </div>
          <div>
            <label htmlFor="province" className="mb-1 block font-display font-bold">จังหวัด</label>
            <input id="province" name="province" autoComplete="address-level1" className="field" required {...aria("province")} />
            {err("province")}
          </div>
          <div>
            <label htmlFor="postcode" className="mb-1 block font-display font-bold">รหัสไปรษณีย์</label>
            <input id="postcode" name="postcode" inputMode="numeric" autoComplete="postal-code" maxLength={5} className="field" required {...aria("postcode")} />
            {err("postcode")}
          </div>
        </div>
        <div>
          <label className="flex min-h-11 items-start gap-3">
            <input type="checkbox" name="consent" className="mt-1 size-5 accent-red" {...aria("consent")} />
            <span>
              ยอมรับ{" "}
              <Link href="/policies/privacy" target="_blank" className="font-semibold underline">
                นโยบายความเป็นส่วนตัว
              </Link>{" "}
              ให้ร้านใช้ข้อมูลนี้เพื่อจัดส่งและติดต่อเรื่องออเดอร์
            </span>
          </label>
          {err("consent")}
        </div>

        {errors.form && (
          <p className="card bg-pink p-4 font-semibold" role="alert">
            {errors.form}
          </p>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            className="btn btn-ink w-full text-lg"
            disabled={pending || paymentsOff || !quote || quote.total === null || quote.lines.length === 0}
          >
            {pending ? "กำลังเปิดหน้าชำระเงิน…" : `สแกนจ่าย PromptPay · ${quote?.total != null ? formatTHB(quote.total) : "…"}`}
          </button>
          <p className="text-sm text-muted">
            สแกนจ่ายด้วยแอปธนาคารใดก็ได้ หรือจ่ายด้วยบัตร · ในแอปธนาคารจะขึ้นชื่อผู้รับเป็น{" "}
            <strong className="text-ink">STRIPE PAYMENTS (THAILAND) LTD</strong> ซึ่งเป็นผู้รับชำระแทนร้าน Angry Muscles
          </p>
          {paymentsOff && <p className="font-semibold text-red-deep">ร้านยังไม่เปิดรับชำระเงินบนเว็บ สั่งทาง LINE ได้เลย</p>}
          {quote && quote.total === null && (
            <p className="font-semibold text-red-deep">ร้านยังไม่ได้ตั้งค่าส่ง จึงยังรับชำระเงินไม่ได้ สั่งทาง LINE ได้เลย</p>
          )}
        </div>
      </form>

      <aside className="card h-fit space-y-4 p-5" aria-label="สรุปยอด">
        <h2 className="text-xl font-extrabold">สรุปยอด</h2>
        {!quote ? (
          <p className="text-muted">กำลังตรวจราคาและสถานะสินค้า…</p>
        ) : (
          <>
            <ul className="space-y-3">
              {quote.lines.map((l) => (
                <li key={l.sku} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-white">
                    {l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-contain" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-display font-bold">{l.name}</p>
                    <p className="text-muted">
                      {l.color} · {l.size} × {l.qty}
                    </p>
                  </div>
                  <p className="font-semibold">{formatTHB(l.unit_price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t-2 border-ink/10 pt-3">
              <div className="flex justify-between">
                <span>ยอดสินค้า</span>
                <span>{formatTHB(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าส่ง</span>
                <span>{quote.shipping === null ? "[ใส่อัตราค่าส่ง]" : quote.shipping === 0 ? "ส่งฟรี" : formatTHB(quote.shipping)}</span>
              </div>
              <div className="flex justify-between pt-1 font-display text-xl font-extrabold">
                <span>รวม</span>
                <span>{quote.total === null ? "—" : formatTHB(quote.total)}</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
