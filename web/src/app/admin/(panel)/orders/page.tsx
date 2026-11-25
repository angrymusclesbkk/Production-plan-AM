import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime, formatTHB } from "@/lib/format";
import { ADMIN_STATUS } from "@/lib/status";
import { getStore } from "@/lib/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";

export const metadata: Metadata = { title: "ออเดอร์" };

export default function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<p>กำลังโหลด…</p>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const store = await getStore();
  const all = await store.listOrders({ limit: 500 });
  const orders = status ? all.filter((o) => o.status === status) : all.filter((o) => o.status !== "pending" && o.status !== "expired");
  const count = (s: OrderStatus) => all.filter((o) => o.status === s).length;

  const tabs: { key: string; label: string; href: string }[] = [
    { key: "", label: "ทั้งหมด (ไม่รวมรอจ่าย/หมดเวลา)", href: "/admin/orders" },
    ...(["paid", "needs_attention", "packed", "shipped", "pending", "expired", "payment_failed", "cancelled"] as OrderStatus[]).map((s) => ({
      key: s,
      label: `${ADMIN_STATUS[s]} (${count(s)})`,
      href: `/admin/orders?status=${s}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">ออเดอร์</h1>
        <a href={`/admin/orders/export${status ? `?status=${status}` : ""}`} className="btn btn-white">
          ดาวน์โหลด CSV
        </a>
      </div>
      {count("needs_attention") > 0 && (
        <p className="card bg-pink p-4 font-semibold">มี {count("needs_attention")} ออเดอร์ที่ต้องตรวจ (เช่น ยอดเงินไม่ตรง)</p>
      )}
      {count("paid") > 0 && <p className="card bg-cat-apparel p-4 font-semibold">มี {count("paid")} ออเดอร์จ่ายแล้ว รอแพ็ก</p>}
      <nav className="flex flex-wrap gap-2" aria-label="กรองตามสถานะ">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href} className={`btn !min-h-9 !px-3 !py-1 text-sm ${(status ?? "") === t.key ? "btn-ink" : "btn-white"}`}>
            {t.label}
          </Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        <p className="text-muted">ยังไม่มีออเดอร์</p>
      ) : (
        <ul className="divide-y-2 divide-ink/10 rounded-[22px] border-[2.5px] border-ink">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="grid gap-1 p-4 hover:bg-cream sm:grid-cols-[130px_1fr_auto_auto] sm:items-center sm:gap-4">
                <span className="font-display font-bold">{o.number}</span>
                <span>
                  {o.customer_name} · {o.items.reduce((n, i) => n + i.qty, 0)} ชิ้น
                  <span className="block text-xs text-muted">{formatDateTime(o.created_at)}</span>
                </span>
                <span className="font-semibold">{formatTHB(o.total)}</span>
                <StatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
