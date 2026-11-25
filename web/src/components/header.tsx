"use client";

import Image from "next/image";
import Link from "next/link";
import { BagIcon } from "./icons";
import { useCart } from "./cart";

const NAV = [
  { href: "/products", label: "สินค้า" },
  { href: "/size-guide", label: "หาไซส์" },
  { href: "/#team", label: "สั่งให้ทีม" },
  { href: "/#faq", label: "คำถาม" },
];

export function Header() {
  const { count, setOpen, ready } = useCart();
  return (
    <header className="no-print sticky top-0 z-30 border-b-[2.5px] border-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="Angry Muscles หน้าแรก">
          <Image src="/images/brand/logo-red.webp" alt="Angry Muscles" width={140} height={62} priority className="h-10 w-auto" />
        </Link>
        <nav className="ml-auto hidden gap-6 font-display font-semibold md:flex" aria-label="เมนูหลัก">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-red-deep">
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-white ml-auto md:ml-4"
          aria-label={`เปิดตะกร้า มีสินค้า ${count} ชิ้น`}
        >
          <BagIcon />
          <span>ตะกร้า</span>
          <span className="grid min-w-6 place-items-center rounded-full bg-red px-1.5 text-sm text-white" aria-hidden>
            {ready ? count : 0}
          </span>
        </button>
      </div>
      <nav className="flex gap-5 overflow-x-auto px-4 pb-2 font-display text-sm font-semibold md:hidden" aria-label="เมนูหลัก (มือถือ)">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap py-1">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
