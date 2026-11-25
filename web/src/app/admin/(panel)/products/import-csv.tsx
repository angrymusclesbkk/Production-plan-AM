"use client";

import { useActionState } from "react";
import { importCsvAction, type ImportReport } from "./actions";

export function ImportCsv() {
  const [report, action, pending] = useActionState<ImportReport | null, FormData>(importCsvAction, null);
  return (
    <details className="card p-5">
      <summary className="cursor-pointer font-display text-lg font-bold">นำเข้าสถานะจาก CSV</summary>
      <form action={action} className="mt-4 space-y-3">
        <p className="text-sm text-muted">
          2 คอลัมน์: <code>sku,availability</code> ค่าที่ใช้ได้: on_sale / preorder / unavailable (หรือ พร้อมขาย / รอพรีออเดอร์ / ยังไม่พร้อมขาย)
        </p>
        <input type="file" name="file" accept=".csv,text/csv,text/plain" className="block min-h-11" />
        <textarea name="text" rows={4} className="field font-mono text-sm" placeholder={"หรือวางข้อความ เช่น\nsku,availability\nRUNBS,preorder"} />
        <button type="submit" className="btn btn-ink" disabled={pending}>{pending ? "กำลังนำเข้า…" : "นำเข้า"}</button>
      </form>
      {report && (
        <div className="mt-4 space-y-1" role="status">
          {"error" in report ? (
            <p className="font-semibold text-red-deep">{report.error}</p>
          ) : (
            <>
              <p className="font-semibold">เปลี่ยน {report.updated} รายการ · ค่าเดิมอยู่แล้ว {report.unchanged} รายการ</p>
              {report.missing.length > 0 && <p className="text-red-deep">ไม่พบ SKU: {report.missing.join(", ")}</p>}
              {report.invalid.length > 0 && (
                <ul className="list-disc pl-5 text-red-deep">
                  {report.invalid.map((x) => <li key={x}>รูปแบบผิด — {x}</li>)}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </details>
  );
}
