import { getCatalog } from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Availability } from "@/lib/types";

const FEED_AVAILABILITY: Record<Availability, string> = {
  on_sale: "in_stock",
  preorder: "preorder",
  unavailable: "out_of_stock",
};

function x(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

/**
 * Product feed ของ Google Merchant Center — หนึ่ง item ต่อ variant (docs/SPEC.md)
 * variant ที่ยังไม่มีรูปจะไม่ใส่ใน feed (Google ไม่รับสินค้าที่ไม่มีรูป และห้ามใช้รูปสีอื่นแทน)
 */
export async function GET() {
  const products = await getCatalog();
  const items: string[] = [];
  for (const p of products) {
    for (const v of p.variants) {
      if (!v.image) continue;
      const size = p.sizes.find((s) => s.code === v.size)?.label ?? v.size;
      items.push(`<item>
<g:id>${x(v.sku)}</g:id>
<g:item_group_id>${x(p.slug)}</g:item_group_id>
<g:title>${x(`${p.name} ${v.color} ${size}`)}</g:title>
<g:description>${x([p.subtitle, ...p.features].join(" · "))}</g:description>
<g:link>${x(`${SITE_URL}/products/${p.slug}`)}</g:link>
<g:image_link>${x(SITE_URL + v.image)}</g:image_link>
<g:price>${p.price}.00 THB</g:price>
<g:availability>${FEED_AVAILABILITY[v.availability]}</g:availability>
<g:condition>new</g:condition>
<g:brand>${x(SITE_NAME)}</g:brand>
<g:color>${x(v.color)}</g:color>
<g:size>${x(size)}</g:size>
<g:identifier_exists>no</g:identifier_exists>
</item>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${x(SITE_NAME)}</title>
<link>${x(SITE_URL)}</link>
<description>${x(SITE_NAME)} product feed</description>
${items.join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
