import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { ShopGrid } from "@/components/shop-grid";
import { SizeFinder } from "@/components/size-finder";
import { ChatIcon } from "@/components/icons";
import { getCatalog } from "@/lib/catalog";
import { toCard } from "@/lib/card";
import { faqItems } from "@/lib/faq";
import { CATEGORIES, LINE_URL, SITE_NAME, SITE_URL, SOCIAL, TAGLINE } from "@/lib/site";

export default async function Home() {
  const products = (await getCatalog()).map(toCard);
  const faq = faqItems();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/images/brand/logo-red.webp`,
          sameAs: [SOCIAL.tiktok, SOCIAL.instagram, SOCIAL.shopee],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="space-y-5">
          <p className="eyebrow italic">{TAGLINE}</p>
          <h1 className="text-5xl font-extrabold leading-[1.05] sm:text-6xl">
            ถุงเท้าสายเทรน
            <br />
            <span className="text-red">กวนแต่ซัพพอร์ตจริง</span>
          </h1>
          <p className="max-w-md text-lg">พื้นหนานุ่มเต็มฝ่าเท้า กระชับ ไม่ร่น ไม่เลื่อน ใส่วิ่ง ยกเวท HYROX หรือพิลาทิสก็ได้</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-ink text-lg">
              ช้อปเลย
            </Link>
            <Link href="/size-guide" className="btn btn-white text-lg">
              หาไซส์ของคุณ
            </Link>
          </div>
        </div>
        <div className="card relative aspect-square overflow-hidden">
          <Image
            src="/images/brand/hero-run-flatlay.webp"
            alt="ถุงเท้า Angry RUN หลายสีวางเรียงกัน"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Shop</p>
        <h2 className="mb-2 text-4xl font-extrabold">เลือกตามกีฬาที่เล่น</h2>
        <p className="mb-6 text-muted">กดที่สินค้าเพื่อเลือกสีและไซส์ สีหรือไซส์ไหนสั่งในเว็บไม่ได้ กดปุ่ม LINE แจ้งทีมงานได้เลย</p>
        <ShopGrid products={products} categories={CATEGORIES} />

        <div className="card mt-10 flex flex-col gap-4 bg-cat-apparel p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-extrabold">สีที่ชอบหมด? ไม่ต้องรอเงียบ ๆ</h3>
            <p className="mt-1">เลือกสีและไซส์ในหน้าสินค้า แล้วกดปุ่ม LINE แจ้งรุ่น สี ไซส์ และจำนวนในแชท ทีมงานจะตอบเรื่องรอบผลิตและวันส่ง</p>
          </div>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line shrink-0">
            <ChatIcon /> ทัก LINE
          </a>
        </div>
      </section>

      {/* Size finder */}
      <section className="mt-10 bg-ink py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="eyebrow !text-pink">Size finder</p>
          <h2 className="mb-2 text-4xl font-extrabold">หาไซส์ของคุณใน 5 วินาที</h2>
          <p className="mb-8 max-w-xl text-white/85">
            ใส่ความยาวเท้าหรือเบอร์รองเท้า แล้วเราบอกว่าควรเลือกไซส์ไหน วัดความยาวเท้าจากส้นเท้าถึงปลายนิ้วที่ยาวที่สุด
          </p>
          <SizeFinder />
        </div>
      </section>

      {/* Why RUN */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow">Why Angry RUN</p>
        <h2 className="mb-8 text-4xl font-extrabold">ทำมาให้เท้าเทรนได้นานกว่าเดิม</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card relative aspect-[2/3] overflow-hidden md:row-span-2 md:aspect-auto">
            <Image
              src="/images/brand/run-toe-detail.webp"
              alt="ปลายเท้าถุงเท้า Angry RUN สีขาวและดำ"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover"
            />
          </div>
          {[
            ["พื้นหนานุ่มเต็มฝ่าเท้า", "Full-Sole Cushion ลดแรงกระแทก เสริมปลายเท้าและส้นเท้า"],
            ["ตาข่ายระบายอากาศ", "ลดความอับชื้นระหว่างวิ่งยาวหรือเทรนหนัก"],
            ["ไม่ร่น ไม่ย้วย ไม่เลื่อน", "ทรงตามรูปเท้า กระชับระหว่างเคลื่อนไหว ช่วยให้รองเท้าสวมแน่นขึ้น"],
            ["ใส่ได้ทุกเพศ", "Unisex 9 สี เลือกตามความยาวเท้า 22–26 หรือ 26–30 ซม."],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <h3 className="mb-2 text-xl font-extrabold">{t}</h3>
              <p className="text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section id="team" className="mx-auto max-w-6xl scroll-mt-28 px-4">
        <div className="card flex flex-col gap-4 bg-pink p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Team order</p>
            <h2 className="text-3xl font-extrabold">สั่งให้ทั้งรันคลับ ยิม หรือสตูดิโอ</h2>
            <p className="mt-2">สั่งหลายคู่ คละสีคละไซส์ หรืออยากคุยเรื่องลายของทีม ทักทีมงานทาง LINE</p>
          </div>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line shrink-0">
            <ChatIcon /> คุยเรื่องออเดอร์ทีม
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-16">
        <p className="eyebrow">FAQ</p>
        <h2 className="mb-6 text-4xl font-extrabold">คำถามก่อนสั่ง</h2>
        <div className="space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                {f.q}
                <span aria-hidden className="text-2xl transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
