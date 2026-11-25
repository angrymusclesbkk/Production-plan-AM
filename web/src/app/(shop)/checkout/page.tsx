import type { Metadata } from "next";
import { Suspense } from "react";
import { paymentsMode } from "@/lib/payments";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "ชำระเงิน",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const mode = paymentsMode();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-extrabold">ชำระเงิน</h1>
      {mode === "mock" && (
        <p className="card mb-6 bg-cat-daily p-4 text-sm font-semibold">
          โหมดทดสอบบนเครื่อง: ยังไม่ได้ใส่คีย์ Stripe ระบบจะพาไปหน้าจำลองการจ่ายเงิน ไม่มีการตัดเงินจริง
        </p>
      )}
      <Suspense fallback={<p>กำลังโหลด…</p>}>
        <CheckoutForm paymentsOff={mode === "off"} />
      </Suspense>
    </div>
  );
}
