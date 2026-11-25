import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-xl place-content-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-extrabold">ไม่พบหน้านี้</h1>
      <p className="text-muted">ลิงก์อาจผิด หรือสินค้านี้ปิดการขายแล้ว</p>
      <Link href="/products" className="btn btn-ink mx-auto">
        ดูสินค้าทั้งหมด
      </Link>
    </main>
  );
}
