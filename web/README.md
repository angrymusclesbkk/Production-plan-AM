# Angry Muscles — เว็บร้านค้า

Next.js + Supabase + Stripe (PromptPay) + Resend · โฮสต์บน Vercel

- **เปิดเว็บจริง: อ่าน [`docs/SETUP.md`](docs/SETUP.md)**
- กฎของโปรเจกต์ (Claude Code อ่านเอง): [`CLAUDE.md`](CLAUDE.md)
- สเปก: [`docs/SPEC.md`](docs/SPEC.md)

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | เปิดเว็บในเครื่อง |
| `npm run build` | build แบบเว็บจริง |
| `npm run lint` | ตรวจโค้ด |
| `npm run seed` | นำเข้าสินค้าเข้า Supabase (ทางเลือกแทน `supabase/seed.sql`) |
| `npx tsx scripts/make-seed-sql.ts` | สร้าง `supabase/seed.sql` ใหม่หลังแก้ `data/products.json` |
