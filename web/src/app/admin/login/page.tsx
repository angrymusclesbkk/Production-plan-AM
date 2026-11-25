import type { Metadata } from "next";
import { authMode } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  const mode = authMode();
  return (
    <div className="mx-auto max-w-sm space-y-6 px-4 py-16">
      <h1 className="text-3xl font-extrabold">เข้าสู่ระบบแอดมิน</h1>
      {mode === "local" && (
        <p className="card bg-cat-daily p-3 text-sm">โหมดทดสอบในเครื่อง: ใช้รหัสผ่านจาก ADMIN_LOCAL_PASSWORD</p>
      )}
      {mode === "off" ? (
        <p className="card bg-pink p-4">ยังไม่ได้ตั้งค่า Supabase จึงยังล็อกอินไม่ได้</p>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
