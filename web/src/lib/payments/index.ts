import "server-only";
import { randomBytes } from "node:crypto";
import Stripe from "stripe";
import { SITE_URL } from "../site";
import { onVercel } from "../store";
import type { Order } from "../types";

/**
 * stripe = รับเงินจริง/โหมดทดสอบของ Stripe (มี STRIPE_SECRET_KEY)
 * mock   = จำลองการจ่ายเงินสำหรับทดสอบบนเครื่องเท่านั้น (ไม่มีคีย์ และไม่ได้รันบน Vercel)
 * off    = ยังไม่เปิดรับเงิน (บน Vercel แต่ยังไม่ใส่คีย์)
 */
export type PaymentsMode = "stripe" | "mock" | "off";

export function paymentsMode(): PaymentsMode {
  if (process.env.STRIPE_SECRET_KEY) return "stripe";
  if (!onVercel) return "mock";
  return "off";
}

const MOCK_WEBHOOK_SECRET = "whsec_local_mock_only";

export function webhookSecret(): string | null {
  if (process.env.STRIPE_WEBHOOK_SECRET) return process.env.STRIPE_WEBHOOK_SECRET;
  return paymentsMode() === "mock" ? MOCK_WEBHOOK_SECRET : null;
}

let stripe: Stripe | null = null;
/** ในโหมด mock ใช้แค่ตรวจลายเซ็น webhook (ทำในเครื่อง ไม่เรียก API) */
export function getStripe() {
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_not_used_for_api_calls");
  return stripe;
}

export async function createPaymentSession(order: Order): Promise<{ id: string; url: string }> {
  const mode = paymentsMode();
  if (mode === "off") throw new Error("ยังไม่ได้ตั้งค่า Stripe");
  if (mode === "mock") {
    return { id: "cs_mock_" + randomBytes(12).toString("hex"), url: `/dev/mock-pay/${order.view_token}` };
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((i) => ({
    quantity: i.qty,
    price_data: {
      currency: "thb",
      unit_amount: i.unit_price * 100, // THB ใน Stripe เป็นสตางค์
      product_data: { name: `${i.name} · ${i.color} · ${i.size}` },
    },
  }));
  if (order.shipping_fee > 0) {
    line_items.push({
      quantity: 1,
      price_data: { currency: "thb", unit_amount: order.shipping_fee * 100, product_data: { name: "ค่าส่ง" } },
    });
  }

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      // API ใหม่: เป็นตัวกรองจากวิธีจ่ายที่เปิดไว้ใน Stripe Dashboard — ต้องเปิด PromptPay และ Card ใน Dashboard ด้วย
      allowed_payment_method_types: ["promptpay", "card"],
      line_items,
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: order.number },
      payment_intent_data: {
        description: `Angry Muscles ${order.number}`,
        metadata: { order_id: order.id, order_number: order.number },
      },
      locale: "th",
      success_url: `${SITE_URL}/order/${order.view_token}`,
      cancel_url: `${SITE_URL}/checkout?cancelled=1`,
    },
    { idempotencyKey: `checkout-${order.id}` },
  );
  if (!session.url) throw new Error("Stripe ไม่ส่งลิงก์ชำระเงินกลับมา");
  return { id: session.id, url: session.url };
}
