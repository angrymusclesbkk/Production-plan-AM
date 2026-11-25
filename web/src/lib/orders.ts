import "server-only";
import { randomBytes } from "node:crypto";
import { after } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { getProductsFresh } from "./catalog";
import { sendAttentionEmail, sendPaidEmails } from "./email";
import { createPaymentSession, paymentsMode } from "./payments";
import { MAX_QTY_PER_LINE, shippingFor } from "./site";
import { getStore } from "./store";
import type { Order, OrderItem, Product, Variant } from "./types";

export type CartInput = { sku: string; qty: number }[];

export type QuoteLine = OrderItem & { image: string | null; slug: string };
export type Unavailable = { sku: string; name: string; reason: string };
export type Quote = {
  lines: QuoteLine[];
  unavailable: Unavailable[];
  subtotal: number;
  shipping: number | null; // null = ร้านยังไม่ตั้งค่าส่ง
  total: number | null;
};

/** คำนวณยอดจากฐานข้อมูลสด — ราคาและสถานะจาก browser ไม่ถูกเชื่อ */
export async function quoteCart(cart: CartInput): Promise<Quote> {
  const products = await getProductsFresh();
  const bySku = new Map<string, { p: Product; v: Variant }>();
  for (const p of products) for (const v of p.variants) bySku.set(v.sku, { p, v });

  const lines: QuoteLine[] = [];
  const unavailable: Unavailable[] = [];
  const merged = new Map<string, number>();
  for (const c of cart) merged.set(c.sku, (merged.get(c.sku) ?? 0) + c.qty);

  for (const [sku, rawQty] of merged) {
    const hit = bySku.get(sku);
    if (!hit) {
      unavailable.push({ sku, name: sku, reason: "ไม่พบสินค้านี้แล้ว" });
      continue;
    }
    const { p, v } = hit;
    const label = p.sizes.find((s) => s.code === v.size)?.label ?? v.size;
    const name = `${p.name} สี ${v.color} ไซส์ ${label}`;
    if (!p.published) {
      unavailable.push({ sku, name, reason: "ปิดการขายแล้ว" });
      continue;
    }
    if (v.availability !== "on_sale") {
      unavailable.push({
        sku,
        name,
        reason: v.availability === "preorder" ? "เปลี่ยนเป็นพรีออเดอร์ทาง LINE แล้ว" : "สินค้าชิ้นนี้ไม่พร้อมขายแล้ว",
      });
      continue;
    }
    const qty = Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.floor(rawQty)));
    lines.push({
      sku,
      slug: p.slug,
      product_slug: p.slug,
      name: p.name,
      color: v.color,
      size: label,
      qty,
      unit_price: p.price,
      image: v.image,
    });
  }
  const subtotal = lines.reduce((n, l) => n + l.unit_price * l.qty, 0);
  const shipping = lines.length ? shippingFor(subtotal) : 0;
  return { lines, unavailable, subtotal, shipping, total: shipping === null ? null : subtotal + shipping };
}

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ sku: z.string().min(1).max(64), qty: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
    .min(1, "ตะกร้าว่าง")
    .max(50),
  name: z.string().trim().min(2, "กรอกชื่อผู้รับ").max(100),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)")),
  email: z.string().trim().toLowerCase().pipe(z.email("อีเมลไม่ถูกต้อง")),
  line1: z.string().trim().min(5, "กรอกบ้านเลขที่ ถนน ตำบล/แขวง").max(300),
  district: z.string().trim().min(2, "กรอกอำเภอ/เขต").max(100),
  province: z.string().trim().min(2, "กรอกจังหวัด").max(100),
  postcode: z.string().trim().regex(/^\d{5}$/, "รหัสไปรษณีย์ 5 หลัก"),
  consent: z.literal(true, { error: "กรุณายอมรับนโยบายความเป็นส่วนตัว" }),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export type PlaceOrderResult =
  | { ok: true; url: string }
  | { ok: false; kind: "invalid"; fieldErrors: Record<string, string> }
  | { ok: false; kind: "unavailable"; unavailable: Unavailable[] }
  | { ok: false; kind: "closed" | "error"; message: string };

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      fieldErrors[k] ??= issue.message;
    }
    return { ok: false, kind: "invalid", fieldErrors };
  }
  const d = parsed.data;

  if (paymentsMode() === "off") {
    return { ok: false, kind: "closed", message: "ร้านยังไม่เปิดรับชำระเงินบนเว็บ สั่งทาง LINE ได้เลย" };
  }

  const q = await quoteCart(d.items);
  if (q.unavailable.length) return { ok: false, kind: "unavailable", unavailable: q.unavailable };
  if (q.shipping === null || q.total === null) {
    return { ok: false, kind: "closed", message: "ร้านยังไม่ได้ตั้งค่าส่ง จึงยังรับชำระเงินไม่ได้ สั่งทาง LINE ได้เลย" };
  }

  const store = await getStore();
  const order = await store.createOrder({
    view_token: randomBytes(24).toString("base64url"), // 192 bit เดาไม่ได้
    customer_name: d.name,
    phone: d.phone,
    email: d.email,
    address: { line1: d.line1, district: d.district, province: d.province, postcode: d.postcode },
    subtotal: q.subtotal,
    shipping_fee: q.shipping,
    total: q.total,
    items: q.lines.map((l) => ({
      sku: l.sku,
      product_slug: l.product_slug,
      name: l.name,
      color: l.color,
      size: l.size,
      qty: l.qty,
      unit_price: l.unit_price,
    })),
  });

  try {
    const session = await createPaymentSession(order);
    await store.updateOrder(order.id, { stripe_session_id: session.id });
    return { ok: true, url: session.url };
  } catch (e) {
    console.error("[checkout] สร้างหน้าชำระเงินไม่สำเร็จ", order.number, e);
    await store.updateOrder(order.id, { status: "cancelled", note: "สร้างหน้าชำระเงินไม่สำเร็จ" });
    return { ok: false, kind: "error", message: "เปิดหน้าชำระเงินไม่สำเร็จ ลองใหม่อีกครั้ง หรือทัก LINE" };
  }
}

// ---------------- Webhook ----------------

export type WebhookResult =
  | "paid"
  | "already_processed"
  | "waiting_for_payment"
  | "payment_failed"
  | "expired"
  | "needs_attention"
  | "unknown_order"
  | "ignored";

async function findOrder(s: Stripe.Checkout.Session): Promise<Order | null> {
  const store = await getStore();
  return (
    (await store.getOrderBySession(s.id)) ??
    (s.metadata?.order_id ? await store.getOrderById(s.metadata.order_id) : null)
  );
}

function intentId(s: Stripe.Checkout.Session) {
  if (!s.payment_intent) return null;
  return typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent.id;
}

async function markPaid(s: Stripe.Checkout.Session): Promise<WebhookResult> {
  const order = await findOrder(s);
  if (!order) {
    console.error("[webhook] ไม่พบออเดอร์ของ session", s.id);
    return "unknown_order";
  }
  // ดูแค่ session ของออเดอร์นี้ ถ้า id ไม่ตรง (เช่น session เก่า) ไม่ยุ่ง
  if (order.stripe_session_id && order.stripe_session_id !== s.id) {
    console.error("[webhook] session ไม่ตรงกับออเดอร์", order.number, s.id);
    return "unknown_order";
  }
  const store = await getStore();

  const expected = order.total * 100;
  if (s.amount_total !== expected || (s.currency ?? "").toLowerCase() !== "thb") {
    const reason = `ยอดที่ Stripe รับ (${s.amount_total} ${s.currency}) ไม่ตรงกับยอดออเดอร์ (${expected} thb)`;
    const updated = await store.transitionOrder(order.id, ["pending"], {
      status: "needs_attention",
      note: reason,
      stripe_payment_intent_id: intentId(s),
    });
    if (updated) after(() => sendAttentionEmail(updated, reason));
    return updated ? "needs_attention" : "already_processed";
  }

  // อัปเดตแบบมีเงื่อนไข: มีแค่ครั้งแรกที่ผ่าน — webhook ซ้ำจะได้ null และไม่ส่งอีเมลซ้ำ
  const updated = await store.transitionOrder(order.id, ["pending"], {
    status: "paid",
    paid_at: new Date().toISOString(),
    stripe_payment_intent_id: intentId(s),
  });
  if (!updated) return "already_processed";
  after(() => sendPaidEmails(updated));
  return "paid";
}

async function markClosed(s: Stripe.Checkout.Session, status: "payment_failed" | "expired"): Promise<WebhookResult> {
  const order = await findOrder(s);
  if (!order) return "unknown_order";
  const store = await getStore();
  const updated = await store.transitionOrder(order.id, ["pending"], { status });
  return updated ? status : "already_processed";
}

/** ตาม docs/SPEC.md หัวข้อ "ยืนยันว่าจ่ายแล้ว" */
export async function handleStripeEvent(event: Stripe.Event): Promise<WebhookResult> {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      // ห้ามตั้ง paid จาก event นี้อย่างเดียว ต้องเช็ก payment_status
      if (s.payment_status === "paid") return markPaid(s);
      return "waiting_for_payment";
    }
    case "checkout.session.async_payment_succeeded":
      return markPaid(event.data.object);
    case "checkout.session.async_payment_failed":
      return markClosed(event.data.object, "payment_failed");
    case "checkout.session.expired":
      return markClosed(event.data.object, "expired");
    default:
      return "ignored";
  }
}
