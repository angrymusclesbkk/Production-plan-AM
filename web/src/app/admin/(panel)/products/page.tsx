import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductsFresh } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";
import { getStore } from "@/lib/store";
import { ImportCsv } from "./import-csv";
import { ProductsEditor } from "./products-editor";

export const metadata: Metadata = { title: "สินค้า" };

export default function ProductsAdminPage() {
  return (
    <Suspense fallback={<p>กำลังโหลด…</p>}>
      <Content />
    </Suspense>
  );
}

const FIELD: Record<string, string> = { availability: "สถานะ", published: "เปิดขายรุ่น", price: "ราคา" };
const VALUE: Record<string, string> = {
  on_sale: "พร้อมขาย",
  preorder: "รอพรีออเดอร์",
  unavailable: "ยังไม่พร้อมขาย",
  true: "เปิด",
  false: "ปิด",
};

async function Content() {
  await requireAdmin();
  const products = await getProductsFresh();
  const logs = await (await getStore()).getLogs(30);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">สินค้าและสถานะการขาย</h1>
        <p className="mt-1 text-muted">กดแล้วบันทึกทันที หน้าร้านเปลี่ยนตามภายในไม่กี่วินาที (ถ้ากดรัว ๆ หลายอย่าง อาจช้าสุดราว 1 นาที) · พร้อมขาย = ใส่ตะกร้าได้ · รอพรีออเดอร์ / ยังไม่พร้อมขาย = ปุ่มพาไป LINE</p>
      </div>
      <ProductsEditor products={products} />
      <ImportCsv />
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">ประวัติการเปลี่ยนล่าสุด</h2>
        {logs.length === 0 ? (
          <p className="text-muted">ยังไม่มี</p>
        ) : (
          <ul className="divide-y divide-ink/10 rounded-[22px] border-2 border-ink text-sm">
            {logs.map((l, i) => (
              <li key={i} className="flex flex-wrap gap-x-3 px-4 py-2">
                <span className="text-muted">{formatDateTime(l.at)}</span>
                <span className="font-semibold">{l.sku}</span>
                <span>
                  {FIELD[l.field] ?? l.field}: {VALUE[l.from_value ?? ""] ?? l.from_value} → {VALUE[l.to_value ?? ""] ?? l.to_value}
                </span>
                <span className="text-muted">{l.admin_email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
