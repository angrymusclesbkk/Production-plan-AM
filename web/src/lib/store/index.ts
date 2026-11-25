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
 * ไม่งั้นใช้ไฟล์ในเครื่อง — แต่บน Vercel ห้าม (ไฟล์หายทุกครั้ง ออเดอร์จะหาย)
 */
export async function getStore(): Promise<Store> {
  if (supabaseConfigured()) return (await import("./supabase")).supabaseStore;
  if (onVercel) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า Supabase บน Vercel: ต้องมี NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return (await import("./local")).localStore;
}
