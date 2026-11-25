"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe, paymentsMode, webhookSecret } from "@/lib/payments";
import { getStore } from "@/lib/store";

export type Scenario = "paid" | "async_ok" | "async_fail" | "expired" | "paid_twice" | "wrong_amount";

/**
 * จำลอง Stripe ส่ง webhook — ใช้ได้เฉพาะโหมด mock (ไม่มีคีย์ Stripe และไม่ได้อยู่บน Vercel)
 * ยิงเข้า /api/stripe/webhook จริง พร้อมลายเซ็นจริง เพื่อทดสอบโค้ดเส้นทางเดียวกับของจริง
 */
export async function simulate(token: string, scenario: Scenario) {
  if (paymentsMode() !== "mock") throw new Error("ใช้ได้เฉพาะโหมดทดสอบบนเครื่อง");
  const order = await (await getStore()).getOrderByToken(token);
  if (!order || !order.stripe_session_id) throw new Error("ไม่พบออเดอร์");

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const pi = "pi_mock_" + randomBytes(8).toString("hex");

  const session = (payment_status: string, amount = order.total * 100) => ({
    id: order.stripe_session_id,
    object: "checkout.session",
    amount_total: amount,
    currency: "thb",
    payment_status,
    payment_intent: pi,
    client_reference_id: order.id,
    metadata: { order_id: order.id, order_number: order.number },
  });
  const event = (type: string, obj: object) => ({
    id: "evt_mock_" + randomBytes(8).toString("hex"),
    object: "event",
    type,
    created: Math.floor(Date.now() / 1000),
    data: { object: obj },
  });

  const send = async (ev: object) => {
    const payload = JSON.stringify(ev);
    const sig = getStripe().webhooks.generateTestHeaderString({ payload, secret: webhookSecret()! });
    const r = await fetch(`${origin}/api/stripe/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json", "stripe-signature": sig },
      body: payload,
    });
    console.info("[mock-pay]", (ev as { type: string }).type, r.status, await r.text());
  };

  switch (scenario) {
    case "paid":
      await send(event("checkout.session.completed", session("paid")));
      break;
    case "paid_twice": {
      const ev = event("checkout.session.completed", session("paid"));
      await send(ev);
      await send(ev); // Stripe ส่งซ้ำ → ต้องไม่ส่งอีเมลซ้ำ
      break;
    }
    case "async_ok":
      await send(event("checkout.session.completed", session("unpaid")));
      await send(event("checkout.session.async_payment_succeeded", session("paid")));
      break;
    case "async_fail":
      await send(event("checkout.session.completed", session("unpaid")));
      await send(event("checkout.session.async_payment_failed", session("unpaid")));
      break;
    case "expired":
      await send(event("checkout.session.expired", session("unpaid")));
      break;
    case "wrong_amount":
      await send(event("checkout.session.completed", session("paid", order.total * 100 - 100)));
      break;
  }
  redirect(`/order/${token}`);
}
