import type Stripe from "stripe";
import { handleStripeEvent } from "@/lib/orders";
import { getStripe, webhookSecret } from "@/lib/payments";

export async function POST(req: Request) {
  const secret = webhookSecret();
  if (!secret) {
    console.error("[webhook] ยังไม่ได้ตั้ง STRIPE_WEBHOOK_SECRET");
    return new Response("webhook not configured", { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!sig) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    // ลายเซ็นไม่ผ่าน = ไม่ได้มาจาก Stripe ห้ามแตะฐานข้อมูล
    return new Response("invalid signature", { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event);
    console.info(`[webhook] ${event.type} ${event.id} -> ${result}`);
    return Response.json({ received: true, result });
  } catch (e) {
    // ตอบ 500 ให้ Stripe ส่งซ้ำภายหลัง (ระบบรับซ้ำได้ปลอดภัย)
    console.error("[webhook] error", event.type, event.id, e);
    return new Response("handler error", { status: 500 });
  }
}
