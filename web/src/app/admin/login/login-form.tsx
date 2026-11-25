"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block font-display font-bold">อีเมล</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block font-display font-bold">รหัสผ่าน</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {error && <p className="font-semibold text-red-deep" role="alert">{error}</p>}
      <button type="submit" className="btn btn-ink w-full" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
