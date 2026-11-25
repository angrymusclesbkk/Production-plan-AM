"use client";

import { useActionState } from "react";
import { updateOrderAction } from "@/app/admin/actions";

export function OrderEditor({ id, tracking, carrier, note }: { id: string; tracking: string; carrier: string; note: string }) {
  const [msg, action, pending] = useActionState(updateOrderAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="status" className="mb-1 block font-display font-bold">เปลี่ยนสถานะ</label>
        <select id="status" name="status" className="field" defaultValue="keep">
          <option value="keep">— ไม่เปลี่ยน —</option>
          <option value="packed">แพ็กแล้ว</option>
          <option value="shipped">ส่งแล้ว (ต้องมีเลขพัสดุ)</option>
          <option value="needs_attention">ต้องตรวจ</option>
          <option value="cancelled">ยกเลิก (คืนเงินใน Stripe Dashboard เอง)</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="carrier" className="mb-1 block font-display font-bold">ขนส่ง</label>
          <input id="carrier" name="carrier" defaultValue={carrier} placeholder="เช่น Flash, Kerry, ไปรษณีย์ไทย" className="field" />
        </div>
        <div>
          <label htmlFor="tracking_no" className="mb-1 block font-display font-bold">เลขพัสดุ</label>
          <input id="tracking_no" name="tracking_no" defaultValue={tracking} className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="note" className="mb-1 block font-display font-bold">โน้ตภายใน</label>
        <textarea id="note" name="note" defaultValue={note} rows={2} className="field" />
      </div>
      <button type="submit" className="btn btn-ink" disabled={pending}>{pending ? "กำลังบันทึก…" : "บันทึก"}</button>
      {msg && <p role="status" className="font-semibold">{msg}</p>}
    </form>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn btn-white" onClick={() => window.print()}>
      พิมพ์ใบแปะหน้า
    </button>
  );
}
