import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/lib/card";
import { formatTHB } from "@/lib/format";

const CAT_BG: Record<string, string> = {
  run: "var(--color-cat-run)",
  pilates: "var(--color-cat-pilates)",
  daily: "var(--color-cat-daily)",
  apparel: "var(--color-cat-apparel)",
};

export function ProductCard({ p, priority = false }: { p: CardData; priority?: boolean }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
    >
      <div className="relative aspect-square border-b-[2.5px] border-ink" style={{ background: p.bg ?? CAT_BG[p.category] ?? "white" }}>
        {p.image && (
          <Image
            src={p.image}
            alt={`${p.name} — ${p.subtitle}`}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-4"
            priority={priority}
          />
        )}
        {p.badge && (
          <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-bold">
            {p.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-lg font-extrabold leading-tight">{p.name}</h3>
        <p className="text-sm text-muted">{p.subtitle}</p>
        <p className="mt-auto pt-2 font-display text-xl font-extrabold">{formatTHB(p.price)}</p>
      </div>
    </Link>
  );
}
