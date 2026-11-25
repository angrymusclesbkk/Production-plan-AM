"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { LINE_URL } from "@/lib/site-client";

type Mode = "cm" | "eu";

type Fit = { title: string; body: string; free: string };

/** กฎตาม docs/SPEC.md หัวข้อตัวช่วยหาไซส์ */
export function fitFor(mode: Mode, value: number): Fit | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (mode === "cm") {
    const free =
      value >= 24 && value <= 30
        ? "Free Size ใส่ได้ (รองรับเท้า 24–30 ซม.)"
        : "Free Size รองรับเท้า 24–30 ซม. — ความยาวนี้อาจไม่พอดี ทัก LINE ถามก่อนได้";
    if (value < 22) return { title: "เล็กกว่าไซส์ที่มี", body: "ทัก LINE ให้ทีมงานช่วยแนะนำ", free };
    if (value < 26) return { title: "22–26 cm", body: "เท้า 22–26 ซม. (EU 35–41)", free };
    if (value === 26)
      return { title: "ได้ทั้งสองไซส์", body: "ชอบกระชับ เลือก 22–26 cm · ชอบสบาย เลือก 26–30 cm", free };
    if (value <= 30) return { title: "26–30 cm", body: "เท้า 26–30 ซม. (EU 41–46)", free };
    return { title: "ใหญ่กว่าไซส์ที่มี", body: "ทัก LINE ให้ทีมงานช่วยแนะนำ", free };
  }
  const free = "Free Size ใส่ได้ถ้าเท้ายาว 24–30 ซม.";
  if (value < 35) return { title: "เล็กกว่าไซส์ที่มี", body: "ทัก LINE ให้ทีมงานช่วยแนะนำ", free };
  if (value <= 40) return { title: "22–26 cm", body: "เท้า 22–26 ซม. (EU 35–41)", free };
  if (value === 41)
    return { title: "ได้ทั้งสองไซส์", body: "ชอบกระชับ เลือก 22–26 cm · ชอบสบาย เลือก 26–30 cm", free };
  if (value <= 46) return { title: "26–30 cm", body: "เท้า 26–30 ซม. (EU 41–46)", free };
  return { title: "ใหญ่กว่าไซส์ที่มี", body: "ทัก LINE ให้ทีมงานช่วยแนะนำ", free };
}

export function SizeFinder({ showChartLink = true }: { showChartLink?: boolean }) {
  const [mode, setMode] = useState<Mode>("cm");
  const [raw, setRaw] = useState("");
  const id = useId();
  const fit = fitFor(mode, Number(raw.replace(",", ".")));

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-start">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="วิธีวัด">
          {(
            [
              ["cm", "ความยาวเท้า (ซม.)"],
              ["eu", "เบอร์รองเท้า EU"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setRaw("");
              }}
              className={`btn !py-1.5 text-sm ${mode === m ? "btn-red" : "btn-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label htmlFor={id} className="block font-display font-bold">
          {mode === "cm" ? "ความยาวเท้า (ซม.)" : "เบอร์รองเท้า EU"}
        </label>
        <input
          id={id}
          inputMode="decimal"
          className="field max-w-56 font-display text-2xl font-bold text-ink"
          placeholder={mode === "cm" ? "เช่น 25.5" : "เช่น 41"}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
      </div>
      <div className="card space-y-4 bg-pink p-6 text-ink" aria-live="polite">
        <p className="eyebrow !text-ink">RUN · PRIDE · X’MAS</p>
        <p className="font-display text-3xl font-extrabold">{fit ? fit.title : "ใส่ตัวเลขทางซ้าย"}</p>
        <p>{fit ? fit.body : "วัดจากส้นเท้าถึงปลายนิ้วที่ยาวที่สุด"}</p>
        <hr className="border-ink/20" />
        <p className="eyebrow !text-ink">OG · MAX REP · GRIP</p>
        <p>{fit ? fit.free : "Free Size รองรับเท้า 24–30 ซม."}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/products" className="btn btn-ink">
            ไปเลือกสินค้า
          </Link>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-white">
            ยังไม่แน่ใจ ถามทาง LINE
          </a>
        </div>
        {showChartLink && (
          <Link href="/size-guide" className="block font-semibold underline underline-offset-4">
            ดูตารางไซส์ RUN แบบเต็ม
          </Link>
        )}
      </div>
    </div>
  );
}
