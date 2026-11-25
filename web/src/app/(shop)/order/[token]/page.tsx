import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChatIcon } from "@/components/icons";
import { formatDateTime, formatTHB, maskEmail, maskPhone } from "@/lib/format";
import { LINE_ID, LINE_URL } from "@/lib/site";
import { CUSTOMER_STATUS } from "@/lib/status";
import { getStore } from "@/lib/store";
import { OrderWatcher } from "./order-watcher";

export const metadata: Metadata = {
  title: "สถานะออเดอร์",
  robots: { index: false, follow: false },
};

export default function OrderPage({ params }: PageProps<"/order/[token]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p className="font-display text-xl font-bold">กำลังโหลดออเดอร์…</p>}>
        <OrderContent params={params} />
      </Suspense>
    </div>
  );
}

async function OrderContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();
  const o = await (await getStore()).getOrderByToken(token);
  if (!o) notFound();

  const s = CUSTOMER_STATUS[o.status];
  const toneClass = s.tone === "ok" ? "bg-cat-apparel" : s.tone === "bad" ? "bg-pink" : "bg-cat-daily";

  return (
    <div className="space-y-6">
      <div className={`card space-y-2 p-6 ${toneClass}`} role="status">
        <p className="eyebrow !text-ink">ออเดอร์ {o.number}</p>
        <h1 className="text-3xl font-extrabold">{s.title}</h1>
        {o.status === "pending" && <p>ถ้าสแกนจ่ายแล้ว รอสักครู่ หน้านี้จะอัปเดตเอง</p>}
        {(o.status === "paid" || o.status === "packed" || o.status === "shipped") && (
          <p>ส่งอีเมลยืนยันไปที่ {maskEmail(o.email)} แล้ว</p>
        )}
        {o.status === "shipped" && o.tracking_no && (
          <p className="font-semibold">
            เลขพัสดุ: {o.carrier ? `${o.carrier} ` : ""}
            <span className="select-all">{o.tracking_no}</span>
          </p>
        )}
        {(o.status === "expired" || o.status === "payment_failed") && <p>ยังไม่ได้รับเงินสำหรับออเดอร์นี้ ไม่มีการตัดเงิน</p>}
        <OrderWatcher
          token={o.view_token}
          status={o.status}
          number={o.number}
          items={o.items.map((i) => ({ sku: i.sku, slug: i.product_slug, name: i.name, color: i.color, size: i.size, price: i.unit_price, qty: i.qty }))}
        />
      </div>

      <section className="card p-6">
        <h2 className="mb-4 text-xl font-extrabold">รายการ</h2>
        <ul className="space-y-2">
          {o.items.map((i) => (
            <li key={i.sku} className="flex justify-between gap-4">
              <span>
                {i.name} · {i.color} · {i.size} × {i.qty}
              </span>
              <span className="font-semibold">{formatTHB(i.unit_price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t-2 border-ink/10 pt-3">
          <div className="flex justify-between"><span>ยอดสินค้า</span><span>{formatTHB(o.subtotal)}</span></div>
          <div className="flex justify-between"><span>ค่าส่ง</span><span>{o.shipping_fee ? formatTHB(o.shipping_fee) : "ส่งฟรี"}</span></div>
          <div className="flex justify-between font-display text-xl font-extrabold"><span>รวม</span><span>{formatTHB(o.total)}</span></div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-2 text-xl font-extrabold">จัดส่งถึง</h2>
        <p>{o.customer_name} · {maskPhone(o.phone)}</p>
        <p>
          {o.address.line1} {o.address.district} {o.address.province} {o.address.postcode}
        </p>
        <p className="mt-3 text-sm text-muted">สั่งเมื่อ {formatDateTime(o.created_at)}</p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line">
          <ChatIcon /> ติดต่อ LINE {LINE_ID}
        </a>
        <p className="text-sm text-muted">แจ้งเลขออเดอร์ {o.number} ในแชท</p>
      </div>
    </div>
  );
}
