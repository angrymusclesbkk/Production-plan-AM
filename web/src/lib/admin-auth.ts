import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { onVercel, supabaseConfigured } from "./store";

/** อีเมลที่เป็นแอดมินได้ คั่นด้วยจุลภาค (env ADMIN_EMAILS) */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * supabase = ล็อกอินด้วย Supabase Auth (เว็บจริง)
 * local    = ทดสอบในเครื่อง ใช้รหัสผ่านจาก ADMIN_LOCAL_PASSWORD (ห้ามใช้บน Vercel)
 */
export function authMode(): "supabase" | "local" | "off" {
  if (supabaseConfigured()) return "supabase";
  if (!onVercel) return "local";
  return "off";
}

async function supabaseAuthClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // เรียกจาก Server Component ตั้ง cookie ไม่ได้ — proxy.ts รีเฟรช session ให้แล้ว
        }
      },
    },
  });
}

// ---- โหมด local ----
const LOCAL_COOKIE = "am_admin_local";
function localSecret() {
  return process.env.ADMIN_SESSION_SECRET || "local-dev-only-not-for-production";
}
function sign(email: string) {
  return createHmac("sha256", localSecret()).update(email).digest("base64url");
}
/** รูปแบบ cookie: base64url(email).signature — ใช้แต่ตัวอักษรที่ไม่ต้อง encode */
function makeLocal(email: string) {
  return `${Buffer.from(email).toString("base64url")}.${sign(email)}`;
}
function verifyLocal(v: string | undefined) {
  if (!v) return null;
  const [encoded, sig] = v.split(".");
  if (!encoded || !sig) return null;
  const email = Buffer.from(encoded, "base64url").toString("utf8");
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(email));
  return a.length === b.length && timingSafeEqual(a, b) ? email : null;
}

export async function getAdmin(): Promise<{ email: string } | null> {
  // ต้องเช็กตอนมีคนเปิดหน้าเสมอ ห้ามให้ผลถูกจำไว้ตั้งแต่ตอน build
  await connection();
  const allowed = adminEmails();
  if (!allowed.length) return null;
  const mode = authMode();
  let email: string | null = null;
  if (mode === "supabase") {
    const { data } = await (await supabaseAuthClient()).auth.getUser();
    email = data.user?.email?.toLowerCase() ?? null;
  } else if (mode === "local") {
    email = verifyLocal((await cookies()).get(LOCAL_COOKIE)?.value);
  }
  return email && allowed.includes(email) ? { email } : null;
}

/** ใช้ในทุกหน้าและทุก action ของแอดมิน */
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

export async function signIn(emailRaw: string, password: string): Promise<string | null> {
  const email = emailRaw.trim().toLowerCase();
  const allowed = adminEmails();
  if (!allowed.length) return "ยังไม่ได้ตั้ง ADMIN_EMAILS";
  if (!allowed.includes(email)) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  const mode = authMode();

  if (mode === "supabase") {
    const sb = await supabaseAuthClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : null;
  }
  if (mode === "local") {
    const pw = process.env.ADMIN_LOCAL_PASSWORD;
    if (!pw) return "โหมดทดสอบ: ตั้ง ADMIN_LOCAL_PASSWORD ใน .env.local ก่อน";
    const ok = password.length === pw.length && timingSafeEqual(Buffer.from(password), Buffer.from(pw));
    if (!ok) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    (await cookies()).set(LOCAL_COOKIE, makeLocal(email), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return null;
  }
  return "ยังไม่ได้ตั้งค่า Supabase";
}

export async function signOut() {
  if (authMode() === "supabase") await (await supabaseAuthClient()).auth.signOut();
  (await cookies()).delete(LOCAL_COOKIE);
}
