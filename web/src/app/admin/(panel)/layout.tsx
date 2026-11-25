import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="no-print border-b-[2.5px] border-ink bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin/orders" className="font-display text-lg font-extrabold">
            Angry Muscles · แอดมิน
          </Link>
          <nav className="flex gap-5 font-display font-semibold" aria-label="เมนูแอดมิน">
            <Link href="/admin/orders" className="py-2 hover:underline">ออเดอร์</Link>
            <Link href="/admin/products" className="py-2 hover:underline">สินค้า</Link>
            <Link href="/" target="_blank" className="py-2 hover:underline">ดูหน้าร้าน</Link>
          </nav>
          <form action={logoutAction} className="ml-auto">
            <button type="submit" className="min-h-11 text-sm underline">ออกจากระบบ</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </>
  );
}
