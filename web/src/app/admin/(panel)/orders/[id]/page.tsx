import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime, formatTHB } from "@/lib/format";
import { getStore } from "@/lib/store";
import { StatusBadge } from "../status-badge";
import { OrderEditor, PrintButton } from "./order-editor";

export const metadata: Metadata = { title: "รายละเอียดออเดอร์" };

export default function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<p>กำลังโหลด…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const o = await (await getStore()).getOrderById(id);
  if (!o) notFound();
  const editable = ["paid", "packed", "shipped", "needs_attention", "cancelled"].includes(o.status);
  const a = o.address;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="no-print text-sm underline">← กลับไปรายการออเดอร์</Link>
      <div className="no-print flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold">{o.number}</h1>
        <StatusBadge status={o.status} />
        <span className="text-sm text-muted">สั่ง {formatDateTime(o.created_at)}{o.paid_at ? ` · จ่าย ${formatDateTime(o.paid_at)}` : ""}</span>
      </div>
      {o.status === "needs_attention" && o.note && <p className="no-print card bg-pink p-4 font-semibold">{o.note}</p>}

      {/* ใบแปะหน้า — ตอนพิมพ์จะเหลือแค่กล่องนี้ */}
      <section className="card space-y-1 p-6 text-lg print:border-4">
        <p className="text-sm text-muted">ผู้รับ</p>
        <p className="font-display text-2xl font-extrabold">{o.customer_name}</p>
        <p className="font-semibold">โทร {o.phone}</p>
        <p>{a.line1}</p>
        <p>{a.district} {a.province} {a.postcode}</p>
        <p className="pt-2 text-sm">ออเดอร์ {o.number} · {o.items.map((i) => `${i.name} ${i.color} ${i.size} ×${i.qty}`).join(", ")}</p>
      </section>

      <div className="no-print grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-3 text-xl font-extrabold">รายการ</h2>
          <ul className="space-y-2">
            {o.items.map((i) => (
              <li key={i.sku} className="flex justify-between gap-3">
                <span>{i.name} · {i.color} · {i.size} × {i.qty}<span className="block text-xs text-muted">{i.sku}</span></span>
                <span className="font-semibold">{formatTHB(i.unit_price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t-2 border-ink/10 pt-3">
            <div className="flex justify-between"><span>ค่าส่ง</span><span>{formatTHB(o.shipping_fee)}</span></div>
            <div className="flex justify-between font-bold"><span>รวม</span><span>{formatTHB(o.total)}</span></div>
          </div>
          <p className="mt-3 text-sm text-muted">อีเมลลูกค้า: {o.email}</p>
          {o.stripe_payment_intent_id && <p className="text-xs text-muted">Stripe: {o.stripe_payment_intent_id}</p>}
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-xl font-extrabold">อัปเดตออเดอร์</h2>
          {editable ? (
            <OrderEditor id={o.id} tracking={o.tracking_no ?? ""} carrier={o.carrier ?? ""} note={o.note ?? ""} />
          ) : (
            <p className="text-muted">ออเดอร์นี้ยังไม่ได้จ่ายเงิน (สถานะเปลี่ยนเองเมื่อ Stripe แจ้ง) จึงยังแก้ไม่ได้</p>
          )}
          <PrintButton />
        </section>
      </div>
    </div>
  );
}
