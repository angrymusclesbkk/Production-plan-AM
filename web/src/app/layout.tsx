import type { Metadata, Viewport } from "next";
import { Anuphan, Kanit } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-kanit",
  display: "swap",
});
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Angry Muscles — ถุงเท้าสายเทรน กวนแต่ซัพพอร์ตจริง",
    template: "%s | Angry Muscles",
  },
  description:
    "ถุงเท้าวิ่ง เวท HYROX และพิลาทิส พื้นหนานุ่มเต็มฝ่าเท้า กระชับ ไม่ร่น ไม่เลื่อน สั่งออนไลน์ สแกนจ่าย PromptPay ได้ทันที",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "th_TH",
    images: [{ url: "/images/brand/hero-run-flatlay.webp", width: 1400, height: 1400, alt: "ถุงเท้า Angry RUN" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFBF7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${kanit.variable} ${anuphan.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
