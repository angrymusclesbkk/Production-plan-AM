import "server-only";
import type { Store } from "./types";

export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** true เมื่อรันบน Vercel (preview หรือ production) */
export const onVercel = Boolean(process.env.VERCEL);

/**
 * เลือกที่เก็บข้อมูล: Supabase ถ้าตั้ง env ครบ
 * ไม่งั้นใช้ไฟล์ในเครื่อง — แต่บน Vercel ใช้โหมดดูได้อย่างเดียวแทน (ไฟล์หายทุกครั้ง ออเดอร์จะหาย)
 */
export async function getStore(): Promise<Store> {
  if (supabaseConfigured()) return (await import("./supabase")).supabaseStore;
  if (onVercel) {
    // ยังไม่ได้ต่อ Supabase: เปิดหน้าร้านให้ดูได้ แต่ห้ามเขียนข้อมูล (ไฟล์บน Vercel ไม่ถาวร ออเดอร์จะหาย)
    return (await import("./readonly")).readonlyStore;
  }
  return (await import("./local")).localStore;
}
