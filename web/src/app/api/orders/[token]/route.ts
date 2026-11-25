import { connection } from "next/server";
import { getStore } from "@/lib/store";

/** ให้หน้า /order/[token] ถามสถานะซ้ำ — ส่งกลับแค่สถานะ ไม่มีข้อมูลส่วนตัว */
export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[token]">) {
  await connection();
  const { token } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return Response.json({ error: "not found" }, { status: 404 });
  const order = await (await getStore()).getOrderByToken(token);
  if (!order) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ status: order.status }, { headers: { "Cache-Control": "no-store" } });
}
