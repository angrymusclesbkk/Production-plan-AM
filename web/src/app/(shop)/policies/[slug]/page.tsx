import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatTHB } from "@/lib/format";
import { LINE_ID, LINE_URL, shippingConfig } from "@/lib/site";

/** เนื้อหานโยบายรอเจ้าของร้าน — ห้ามเปิดขายจริงถ้ายังมี [placeholder] (docs/PROMPTS.md Phase 6) */
function policies() {
  const s = shippingConfig();
  const fee = s.configured
    ? `ค่าส่ง ${formatTHB(s.fee)} ต่อออเดอร์${s.freeMin !== null ? ` ส่งฟรีเมื่อซื้อครบ ${formatTHB(s.freeMin)}` : ""}`
    : "[ใส่อัตราค่าส่ง]";
  return {
    shipping: {
      title: "ค่าส่งและการจัดส่ง",
      body: [fee, "[ใส่ขนส่งที่ใช้ และระยะเวลาจัดส่งโดยประมาณ]", "ได้เลขพัสดุแล้วทีมงานจะแจ้งทางอีเมลหรือ LINE"],
    },
    returns: {
      title: "การเปลี่ยน/คืนสินค้า",
      body: ["[ใส่เงื่อนไขการเปลี่ยนไซส์/สี และการคืนสินค้า]", "[ใส่ระยะเวลาที่แจ้งเปลี่ยนได้หลังได้รับสินค้า]"],
    },
    privacy: {
      title: "นโยบายความเป็นส่วนตัว",
      body: [
        "เราเก็บชื่อ เบอร์โทร อีเมล และที่อยู่จัดส่ง เพื่อใช้จัดส่งสินค้าและติดต่อเรื่องออเดอร์เท่านั้น",
        "การชำระเงินทำผ่าน Stripe ร้านไม่เห็นและไม่เก็บข้อมูลบัตรหรือบัญชีธนาคารของคุณ",
        "[ใส่ระยะเวลาเก็บข้อมูล ช่องทางขอดู/แก้ไข/ลบข้อมูล และผู้ควบคุมข้อมูลตาม PDPA]",
      ],
    },
  } as const;
}

type Slug = keyof ReturnType<typeof policies>;

export function generateStaticParams() {
  return [{ slug: "shipping" }, { slug: "returns" }, { slug: "privacy" }];
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = policies()[slug as Slug];
  return p ? { title: p.title, alternates: { canonical: `/policies/${slug}` } } : { title: "ไม่พบหน้า" };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const p = policies()[slug as Slug];
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-4xl font-extrabold">{p.title}</h1>
      {p.body.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p>
        สอบถามเพิ่มเติม:{" "}
        <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
          LINE {LINE_ID}
        </a>
      </p>
    </article>
  );
}
