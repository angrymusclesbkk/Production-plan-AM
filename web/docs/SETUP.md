# คู่มือเปิดเว็บ Angry Muscles

เว็บสร้างเสร็จแล้ว (Phase 0–5 ใน `docs/PROMPTS.md`) และทดสอบครบทุกขั้นในโหมดทดสอบแล้ว
เหลือแค่ **สมัครบัญชี 4 ที่ แล้วเอาค่ามาใส่** — ทำตามลำดับนี้ ใช้เวลาประมาณ 1–2 ชั่วโมง (ไม่รวมรอ Stripe ยืนยันธุรกิจ)

> ทุก key ให้ใส่ใน Vercel เท่านั้น ห้ามส่งในแชท ห้ามใส่ในโค้ด

---

## 1. Supabase — ฐานข้อมูล + ล็อกอินแอดมิน

1. สมัครที่ supabase.com → **New project**
   - Region: กด **Need a specific region?** แล้วเลือก **Southeast Asia (Singapore)** (ใกล้ลูกค้าไทยที่สุด และตรงกับ Vercel ที่ตั้งไว้ `sin1`)
   - Data access: ติ๊ก **Enable Data API** (ต้องมี) · ช่อง Grant API access อัตโนมัติ ไม่ต้องติ๊ก (ไฟล์ SQL ให้สิทธิ์เองแบบระบุชัด) · ช่อง Enable RLS อัตโนมัติ ติ๊กหรือไม่ก็ได้
   - ตั้ง Database password แล้วจดเก็บไว้
2. เมนูซ้าย **SQL Editor** → **New query**
   - เปิดไฟล์ `supabase/migrations/0001_init.sql` คัดลอกทั้งหมดไปวาง → กด **Run**
   - New query อีกอัน → วางทั้งไฟล์ `supabase/seed.sql` → **Run** (นำเข้าสินค้า 9 รุ่น 55 ตัวเลือก)
3. เมนู **Authentication → Users → Add user → Create new user**
   - ใส่อีเมลแอดมิน + รหัสผ่าน · ติ๊ก **Auto Confirm User**
   - ทำซ้ำถ้ามีแอดมินหลายคน
4. เมนู **Project Settings → API** จดค่า 3 ตัว:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**ลับมาก**)

## 2. Stripe — รับเงิน PromptPay

1. สมัครที่ stripe.com ประเทศ **Thailand** → กรอกข้อมูลธุรกิจและบัญชีธนาคารให้ครบ (Stripe ต้องตรวจก่อนรับเงินจริงได้)
2. **Settings → Payment methods** → เปิด **PromptPay** และ **Cards**
   (สำคัญ: เว็บจะแสดงเฉพาะวิธีจ่ายที่เปิดไว้ตรงนี้)
3. เริ่มจาก **โหมดทดสอบ** (สวิตช์ Test mode มุมขวาบน) ก่อน
   - **Developers → API keys** → คัดลอก Secret key (`sk_test_...`) → `STRIPE_SECRET_KEY`
4. **Developers → Webhooks → Add endpoint**
   - Endpoint URL: `https://angrymuscles.com/api/stripe/webhook`
   - เลือก 4 event: `checkout.session.completed` · `checkout.session.async_payment_succeeded` · `checkout.session.async_payment_failed` · `checkout.session.expired`
   - กดเข้า endpoint ที่สร้าง → **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`
5. ยังไม่ได้ยืนยัน: QR PromptPay หมดอายุกี่นาที — ดูในเอกสาร Stripe เรื่อง PromptPay ตอนทดสอบ ถ้าต้องการให้ปรับข้อความบอกลูกค้า

## 3. Resend — อีเมลยืนยันออเดอร์

1. สมัครที่ resend.com → **Domains → Add domain** → `angrymuscles.com`
2. เอาค่า DNS ที่ Resend ให้ ไปใส่ที่ผู้ให้บริการโดเมน แล้วรอจนขึ้น Verified
3. **API Keys → Create** → `RESEND_API_KEY`
4. `RESEND_FROM` = `Angry Muscles <orders@angrymuscles.com>`

ถ้ายังไม่ทำข้อนี้ เว็บยังขายได้ปกติ แค่ลูกค้าจะไม่ได้อีเมล (ระบบไม่ล้ม)

## 4. Vercel — เปิดเว็บ

1. สมัคร vercel.com ด้วยบัญชี GitHub → **Add New → Project** → เลือก repo `Production-plan-AM`
2. **Root Directory** ตั้งเป็น `web` (สำคัญ — โค้ดเว็บอยู่ในโฟลเดอร์นี้)
3. **Environment Variables** ใส่ทุกค่าตาม `.env.example`:
   `NEXT_PUBLIC_SITE_URL`, ค่า Supabase 3 ตัว, `ADMIN_EMAILS`, ค่า Stripe 2 ตัว, ค่า Resend, `SHIPPING_FEE`, `FREE_SHIPPING_MIN`
   **ห้ามใส่** `ADMIN_LOCAL_PASSWORD`
4. กด **Deploy**
5. **Settings → Domains** → เพิ่ม `angrymuscles.com` และ `www.angrymuscles.com` (ตั้งให้ www เด้งไปหน้าไม่มี www) → ทำตาม DNS ที่ Vercel บอก

> แก้ค่าส่งหรือ env ใด ๆ ทีหลัง ต้องกด **Redeploy** ใน Vercel ค่าใหม่ถึงจะมีผล

## 5. ทดสอบก่อนเปิดขาย (Stripe ยังอยู่โหมดทดสอบ)

1. เข้า `https://angrymuscles.com/admin` → ล็อกอินด้วยอีเมลจากข้อ 1.3
2. สั่งซื้อ 1 ชิ้นจากหน้าร้าน → ในหน้า Stripe ทดสอบ จ่ายด้วยบัตรทดสอบ `4242 4242 4242 4242` (วันหมดอายุอนาคตใดก็ได้ CVC อะไรก็ได้)
3. เช็กว่า: หน้าออเดอร์ขึ้น "ชำระเงินเรียบร้อย" · ได้อีเมล · ออเดอร์โผล่ในแอดมิน
4. ลองกดเปลี่ยนสถานะสินค้าในแอดมิน แล้วดูหน้าร้านเปลี่ยนตาม

## 6. เปิดขายจริง

1. Stripe ปิด Test mode → เอา `sk_live_...` และสร้าง webhook ใหม่ในโหมด Live → ใส่ 2 ค่าใหม่ใน Vercel → Redeploy
2. สั่งจริง 1 ออเดอร์ด้วย PromptPay แล้วคืนเงินใน Stripe Dashboard
3. ทำ checklist Phase 6 ใน `docs/PROMPTS.md` (โดยเฉพาะหน้านโยบายที่ยังมี `[placeholder]`)
4. Google: ยืนยันเว็บใน Google Search Console → ส่ง `https://angrymuscles.com/sitemap.xml` · สมัคร Google Merchant Center → ใส่ feed `https://angrymuscles.com/feeds/google-merchant.xml`

---

## ยังรอข้อมูลจากเจ้าของร้าน

| เรื่อง | ใส่ที่ไหน |
|---|---|
| อัตราค่าส่ง / ส่งฟรีเมื่อยอดเท่าไหร่ | env `SHIPPING_FEE`, `FREE_SHIPPING_MIN` ใน Vercel (**ถ้าไม่ใส่ เว็บจะไม่เปิดรับเงิน**) |
| นโยบายเปลี่ยน/คืน · ขนส่ง · ระยะส่ง · PDPA | แก้ใน `src/app/(shop)/policies/[slug]/page.tsx` (ให้ Claude Code แก้ได้) |
| รูปผ้าโพกหัว `AMHP` ชมพู, `AMMB` ดำ | วางไฟล์ใน `public/images/products/` แล้วใส่ชื่อไฟล์ใน `data/products.json` |
| ตรวจ SKU ที่เหลือกับ MyOrder | RUN, OG, ผ้าโพกหัว, MAX REP, X’MAS (34 รหัส) |

## ข้อควรรู้

- **หน้าร้านอัปเดตตามแอดมินภายในไม่กี่วินาที** ถ้ากดเปลี่ยนรัว ๆ หลายอย่าง หน้ารวมสินค้าอาจช้าสุดราว 1 นาที แต่หน้าชำระเงินตรวจสถานะสดทุกครั้ง ลูกค้าจะจ่ายเงินของที่ปิดขายไปแล้วไม่ได้
- **ออเดอร์เป็น "จ่ายแล้ว" ได้จาก Stripe เท่านั้น** แอดมินกดเองไม่ได้ ออเดอร์ที่ยังรอจ่ายแก้ไม่ได้ (กันกรณียกเลิกแล้วลูกค้าจ่ายทีหลัง)
- **ยกเลิกออเดอร์ที่จ่ายแล้ว** ต้องไปกดคืนเงินเองใน Stripe Dashboard
- feed Google: ตัวเลือกที่ยังไม่มีรูปจะไม่อยู่ใน feed · ตัวเลือก "รอพรีออเดอร์" Google อาจขอวันที่ของเข้า (availability date) เพิ่ม

## ทดสอบในเครื่อง (ไม่บังคับ)

ไม่ต้องมีบัญชีใดเลย:

```bash
cd web
cp .env.example .env.local   # แล้วใส่ ADMIN_EMAILS, ADMIN_LOCAL_PASSWORD และ SHIPPING_FEE (ช่อง Supabase/Stripe เว้นว่างไว้)
npm install
npm run dev
```

เปิด http://localhost:3000 · ข้อมูลเก็บใน `.data/` · การจ่ายเงินพาไปหน้าจำลอง (ไม่มีเงินจริง)
