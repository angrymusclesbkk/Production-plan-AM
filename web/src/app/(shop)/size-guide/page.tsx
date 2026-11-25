import type { Metadata } from "next";
import Image from "next/image";
import { SizeFinder } from "@/components/size-finder";

export const metadata: Metadata = {
  title: "หาไซส์ถุงเท้าและเสื้อ — ตารางไซส์ RUN และเสื้อ",
  description: "ใส่ความยาวเท้าหรือเบอร์รองเท้า EU แล้วรู้ทันทีว่าควรเลือก 22–26 cm หรือ 26–30 cm พร้อมตารางไซส์เสื้อ Oversized และ Baby Tee",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <section>
        <p className="eyebrow">Size finder</p>
        <h1 className="mb-6 text-4xl font-extrabold">หาไซส์ของคุณ</h1>
        <SizeFinder showChartLink={false} />
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <figure className="card overflow-hidden">
          <Image src="/images/size-charts/run.webp" alt="ตารางไซส์ถุงเท้า Angry RUN 22–26 cm และ 26–30 cm" width={1100} height={1100} className="h-auto w-full" />
          <figcaption className="border-t-[2.5px] border-ink p-4 font-display font-bold">ตารางไซส์ RUN · X’MAS · PRIDE</figcaption>
        </figure>
        <figure className="card overflow-hidden">
          <Image src="/images/size-charts/tee.webp" alt="ตารางไซส์เสื้อ Oversized Tee และ Baby Tee" width={1100} height={1100} className="h-auto w-full" />
          <figcaption className="border-t-[2.5px] border-ink p-4 font-display font-bold">ตารางไซส์เสื้อ Oversized · Baby Tee</figcaption>
        </figure>
      </section>
      <section className="card p-6">
        <h2 className="mb-2 text-2xl font-extrabold">OG · MAX REP · GRIP — Free Size</h2>
        <p>รองรับความยาวเท้า 24–30 ซม. (วัดจากส้นเท้าถึงปลายนิ้วที่ยาวที่สุด)</p>
      </section>
    </div>
  );
}
