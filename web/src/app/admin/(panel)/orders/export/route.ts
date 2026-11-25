import { getAdmin } from "@/lib/admin-auth";
import { getStore } from "@/lib/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

function cell(v: unknown) {
  const s = String(v ?? "");
  // กันสูตร Excel (CSV injection)
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return new Response("unauthorized", { status: 401 });
  const status = new URL(req.url).searchParams.get("status") as OrderStatus | null;
  const orders = await (await getStore()).listOrders({ status: status && ORDER_STATUSES.includes(status) ? status : undefined, limit: 5000 });
  const head = ["เลขออเดอร์", "สถานะ", "วันที่สั่ง", "วันที่จ่าย", "ชื่อ", "เบอร์", "อีเมล", "ที่อยู่", "อำเภอ/เขต", "จังหวัด", "รหัสไปรษณีย์", "รายการ", "ยอดสินค้า", "ค่าส่ง", "รวม", "ขนส่ง", "เลขพัสดุ"];
  const rows = orders.map((o) => [
    o.number, o.status, o.created_at, o.paid_at, o.customer_name, o.phone, o.email,
    o.address.line1, o.address.district, o.address.province, o.address.postcode,
    o.items.map((i) => `${i.sku} ${i.name} ${i.color} ${i.size} x${i.qty}`).join("; "),
    o.subtotal, o.shipping_fee, o.total, o.carrier, o.tracking_no,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
