import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatTHB } from "@/lib/format";
import { paymentsMode } from "@/lib/payments";
import { getStore } from "@/lib/store";
import { simulate, type Scenario } from "./actions";

export const metadata: Metadata = { title: "จำลองการจ่ายเงิน (ทดสอบ)", robots: { index: false } };

const SCENARIOS: [Scenario, string, string][] = [
  ["paid", "จ่ายสำเร็จ", "btn-ink"],
  ["async_ok", "จ่ายสำเร็จแบบเงินเข้าทีหลัง", "btn-white"],
  ["paid_twice", "จ่ายสำเร็จ + Stripe ส่ง webhook ซ้ำ", "btn-white"],
  ["async_fail", "จ่ายไม่สำเร็จ", "btn-white"],
  ["expired", "QR หมดอายุ", "btn-white"],
  ["wrong_amount", "ยอดเงินไม่ตรง", "btn-white"],
];

export default function MockPayPage({ params }: PageProps<"/dev/mock-pay/[token]">) {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <Suspense fallback={<p>กำลังโหลด…</p>}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}

async function Content({ params }: { params: Promise<{ token: string }> }) {
  if (paymentsMode() !== "mock") notFound();
  const { token } = await params;
  const o = await (await getStore()).getOrderByToken(token);
  if (!o) notFound();
  return (
    <div className="card space-y-5 p-6">
      <p className="eyebrow">โหมดทดสอบ — ไม่มีเงินจริง</p>
      <h1 className="text-3xl font-extrabold">จำลองหน้าจ่ายเงิน</h1>
      <p>
        ออเดอร์ {o.number} · ยอด <strong>{formatTHB(o.total)}</strong> · สถานะตอนนี้ <code>{o.status}</code>
      </p>
      <p className="text-sm text-muted">
        ปุ่มด้านล่างยิง webhook ที่เซ็นลายเซ็นแบบเดียวกับ Stripe เข้า /api/stripe/webhook จริง หน้านี้จะหายไปเองเมื่อใส่คีย์ Stripe
      </p>
      <div className="grid gap-3">
        {SCENARIOS.map(([key, label, cls]) => (
          <form key={key} action={simulate.bind(null, token, key)}>
            <button type="submit" className={`btn ${cls} w-full`}>
              {label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
