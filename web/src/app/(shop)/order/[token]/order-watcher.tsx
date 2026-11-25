"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart";
import { ChatIcon } from "@/components/icons";
import { LINE_URL } from "@/lib/site-client";
import type { OrderStatus } from "@/lib/types";

type Item = { sku: string; slug: string; name: string; color: string; size: string; price: number; qty: number };

const POLL_MS = 5000;
const POLL_MAX = 24; // 2 นาที

export function OrderWatcher({ token, status, number, items }: { token: string; status: OrderStatus; number: string; items: Item[] }) {
  const router = useRouter();
  const { clear, add, ready, lines } = useCart();
  const [gaveUp, setGaveUp] = useState(false);

  // จ่ายแล้ว → ล้างตะกร้าครั้งเดียวต่อออเดอร์ (กลับมาดูลิงก์ทีหลังจะไม่ล้างตะกร้าใหม่)
  useEffect(() => {
    if (!ready || !["paid", "packed", "shipped"].includes(status)) return;
    const flag = `am_cleared_${token}`;
    try {
      if (window.localStorage.getItem(flag)) return;
      window.localStorage.setItem(flag, "1");
    } catch {
      /* ignore */
    }
    clear();
  }, [ready, status, token, clear]);

  useEffect(() => {
    if (status !== "pending") return;
    let n = 0;
    const id = window.setInterval(async () => {
      n += 1;
      try {
        const r = await fetch(`/api/orders/${token}`, { cache: "no-store" });
        if (r.ok) {
          const j = (await r.json()) as { status: OrderStatus };
          if (j.status !== status) {
            window.clearInterval(id);
            router.refresh();
            return;
          }
        }
      } catch {
        /* เน็ตหลุด ลองรอบหน้า */
      }
      if (n >= POLL_MAX) {
        window.clearInterval(id);
        setGaveUp(true);
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [status, token, router]);

  if (status === "pending" && gaveUp) {
    return (
      <div className="space-y-2 pt-2">
        <p>ยังไม่ได้รับการยืนยันจากธนาคาร ถ้าตัดเงินแล้วแต่สถานะไม่เปลี่ยน ทัก LINE พร้อมเลขออเดอร์ {number}</p>
        <div className="flex flex-wrap gap-2">
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            <ChatIcon /> ทัก LINE
          </a>
          <button type="button" className="btn btn-white" onClick={() => router.refresh()}>
            เช็กอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (status === "expired" || status === "payment_failed") {
    return (
      <button
        type="button"
        className="btn btn-ink mt-2"
        onClick={() => {
          for (const i of items) if (!lines.some((l) => l.sku === i.sku)) add({ sku: i.sku, slug: i.slug, name: i.name, color: i.color, size: i.size, price: i.price, image: null, unit: "", qty: i.qty });
          router.push("/checkout");
        }}
      >
        สั่งใหม่อีกครั้ง
      </button>
    );
  }

  if (status === "pending") {
    return <p className="text-sm text-muted">บันทึกลิงก์หน้านี้ไว้ดูสถานะได้ (ส่งไปทางอีเมลด้วยหลังจ่ายเงิน)</p>;
  }
  return null;
}
