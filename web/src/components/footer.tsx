import Image from "next/image";
import Link from "next/link";
import { LINE_ID, LINE_URL, SOCIAL, TAGLINE } from "@/lib/site";
import { ChatIcon, InstagramIcon, ShopIcon, TikTokIcon } from "./icons";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Footer() {
  return (
    <footer className="no-print mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <Image src="/images/brand/logo-white.webp" alt="Angry Muscles" width={160} height={71} className="h-12 w-auto" />
          <p className="font-display text-lg font-bold">{TAGLINE}</p>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">ติดต่อ</h2>
          <a href={LINE_URL} {...ext} className="btn btn-line">
            <ChatIcon /> LINE {LINE_ID}
          </a>
          <ul className="flex gap-3" aria-label="ช่องทางอื่นของร้าน">
            <li>
              <a href={SOCIAL.tiktok} {...ext} className="btn btn-white !px-3" aria-label="Angry Muscles บน TikTok">
                <TikTokIcon />
              </a>
            </li>
            <li>
              <a href={SOCIAL.instagram} {...ext} className="btn btn-white !px-3" aria-label="Angry Muscles บน Instagram">
                <InstagramIcon />
              </a>
            </li>
            <li>
              <a href={SOCIAL.shopee} {...ext} className="btn btn-white !px-3" aria-label="Angry Muscles บน Shopee">
                <ShopIcon />
              </a>
            </li>
          </ul>
          <p className="text-sm text-white/80">ช้อปได้ที่ TikTok Shop และ Shopee ด้วย</p>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">ข้อมูลร้าน</h2>
          <ul className="space-y-2 text-white/90">
            <li><Link href="/size-guide" className="underline-offset-4 hover:underline">หาไซส์</Link></li>
            <li><Link href="/policies/shipping" className="underline-offset-4 hover:underline">ค่าส่งและการจัดส่ง</Link></li>
            <li><Link href="/policies/returns" className="underline-offset-4 hover:underline">การเปลี่ยน/คืนสินค้า</Link></li>
            <li><Link href="/policies/privacy" className="underline-offset-4 hover:underline">นโยบายความเป็นส่วนตัว</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/20 py-4 text-center text-sm text-white/70">© 2026 Angry Muscles</p>
    </footer>
  );
}
