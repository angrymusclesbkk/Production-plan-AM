"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, signIn, signOut } from "@/lib/admin-auth";
import { getStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
  const err = await signIn(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (err) return err;
  redirect("/admin/orders");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

/**
 * แอดมินเปลี่ยนได้เฉพาะสถานะหลังจ่ายเงิน — "จ่ายแล้ว" มาจาก webhook ของ Stripe เท่านั้น (CLAUDE.md)
 * ออเดอร์ที่ยังรอจ่าย ห้ามแก้ (ถ้ายกเลิกแล้วลูกค้าจ่ายทีหลัง เงินจะเข้าแต่ออเดอร์หาย)
 */
const EDITABLE_FROM: OrderStatus[] = ["paid", "packed", "shipped", "needs_attention", "cancelled"];
const SETTABLE: OrderStatus[] = ["packed", "shipped", "cancelled", "needs_attention"];

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(SETTABLE as [OrderStatus, ...OrderStatus[]]).optional(),
  tracking_no: z.string().trim().max(60).optional(),
  carrier: z.string().trim().max(60).optional(),
  note: z.string().trim().max(1000).optional(),
});

export async function updateOrderAction(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const statusRaw = String(form.get("status") ?? "");
  const parsed = updateSchema.safeParse({
    id: form.get("id"),
    status: statusRaw && statusRaw !== "keep" ? statusRaw : undefined,
    tracking_no: form.get("tracking_no") ?? undefined,
    carrier: form.get("carrier") ?? undefined,
    note: form.get("note") ?? undefined,
  });
  if (!parsed.success) return "ข้อมูลไม่ถูกต้อง: " + parsed.error.issues[0]?.message;
  const { id, ...patch } = parsed.data;
  const store = await getStore();
  const order = await store.getOrderById(id);
  if (!order) return "ไม่พบออเดอร์";
  if (!EDITABLE_FROM.includes(order.status)) return "ออเดอร์ที่ยังไม่ได้จ่ายเงิน แก้สถานะไม่ได้";
  if (patch.status === "shipped" && !(patch.tracking_no || order.tracking_no)) return "ใส่เลขพัสดุก่อนเปลี่ยนเป็นส่งแล้ว";
  await store.updateOrder(id, {
    ...(patch.status ? { status: patch.status } : {}),
    tracking_no: patch.tracking_no || null,
    carrier: patch.carrier || null,
    note: patch.note || null,
  });
  return "บันทึกแล้ว";
}
