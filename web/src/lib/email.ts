import "server-only";
import { Resend } from "resend";
import { formatTHB } from "./format";
import { LINE_ID, LINE_URL, SITE_URL } from "./site";
import type { Order } from "./types";

/**
 * ส่งอีเมลผ่าน Resend — ถ้ายังไม่ตั้ง RESEND_API_KEY จะแค่เขียน log (ไม่ทำให้ระบบล้ม)
 * RESEND_FROM ต้องเป็นอีเมลบนโดเมนที่ยืนยันใน Resend แล้ว เช่น "Angry Muscles <orders@angrymuscles.com>"
 */
async function send(to: string | string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    console.info(`[email:skip] ยังไม่ตั้ง RESEND_API_KEY/RESEND_FROM — to=${to} subject="${subject}"`);
    return;
  }
  const { error } = await new Resend(key).emails.send({ from, to, subject, html });
  if (error) throw new Error(`Resend: ${error.message}`);
  console.info(`[email:sent] to=${to} subject="${subject}"`);
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function itemsTable(o: Order) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${esc(i.name)} · ${esc(i.color)} · ${esc(i.size)} × ${i.qty}</td><td style="text-align:right">${formatTHB(i.unit_price * i.qty)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding:6px 0;color:#5c544f">ค่าส่ง</td><td style="text-align:right;color:#5c544f">${o.shipping_fee ? formatTHB(o.shipping_fee) : "ฟรี"}</td></tr>
<tr><td style="padding:6px 0;font-weight:bold">รวม</td><td style="text-align:right;font-weight:bold">${formatTHB(o.total)}</td></tr></table>`;
}

function shopRecipients() {
  const list = (process.env.SHOP_NOTIFY_EMAIL || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

export async function sendPaidEmails(o: Order) {
  const link = `${SITE_URL}/order/${o.view_token}`;
  const a = o.address;
  const customerHtml = `<div style="font-family:sans-serif;max-width:560px;color:#17120f">
<h2>ได้รับชำระเงินแล้ว ขอบคุณที่สั่ง Angry Muscles</h2>
<p>เลขออเดอร์ <strong>${o.number}</strong></p>
${itemsTable(o)}
<p><strong>จัดส่งถึง</strong><br>${esc(o.customer_name)}<br>${esc(a.line1)} ${esc(a.district)} ${esc(a.province)} ${esc(a.postcode)}</p>
<p><a href="${link}" style="display:inline-block;background:#17120f;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">ดูสถานะออเดอร์</a></p>
<p style="color:#5c544f">มีคำถาม ทัก LINE <a href="${LINE_URL}">${LINE_ID}</a> พร้อมแจ้งเลขออเดอร์</p></div>`;

  const tasks: Promise<void>[] = [send(o.email, `ยืนยันการชำระเงิน ${o.number} — Angry Muscles`, customerHtml)];
  const shop = shopRecipients();
  if (shop) {
    tasks.push(
      send(
        shop,
        `ออเดอร์ใหม่ชำระแล้ว ${o.number} · ${formatTHB(o.total)}`,
        `<div style="font-family:sans-serif"><h2>ออเดอร์ใหม่ ${o.number}</h2>${itemsTable(o)}
<p>${esc(o.customer_name)} · ${esc(o.phone)} · ${esc(o.email)}<br>${esc(a.line1)} ${esc(a.district)} ${esc(a.province)} ${esc(a.postcode)}</p>
<p><a href="${SITE_URL}/admin/orders/${o.id}">เปิดในหน้าแอดมิน</a></p></div>`,
      ),
    );
  }
  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === "rejected") console.error("[email:error]", r.reason);
}

export async function sendAttentionEmail(o: Order, reason: string) {
  const shop = shopRecipients();
  if (!shop) {
    console.warn(`[attention] ${o.number}: ${reason} (ไม่มี SHOP_NOTIFY_EMAIL/ADMIN_EMAILS ให้แจ้ง)`);
    return;
  }
  try {
    await send(
      shop,
      `ต้องตรวจ: ออเดอร์ ${o.number}`,
      `<div style="font-family:sans-serif"><h2>ออเดอร์ ${o.number} ต้องตรวจ</h2><p>${esc(reason)}</p>
<p><a href="${SITE_URL}/admin/orders/${o.id}">เปิดในหน้าแอดมิน</a></p></div>`,
    );
  } catch (e) {
    console.error("[email:error]", e);
  }
}
