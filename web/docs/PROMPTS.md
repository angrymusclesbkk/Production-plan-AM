# คำสั่งสำหรับ Claude Code ทีละขั้น

คัดลอกข้อความในกรอบไปวางใน Claude Code ทีละ Phase · รอให้จบและลองเปิดดูก่อน แล้วค่อยไป Phase ถัดไป

---

## Phase 0 — เริ่มโปรเจกต์

```
อ่าน CLAUDE.md, docs/SPEC.md และ data/products.json ให้ครบก่อน
จากนั้นสร้างโปรเจกต์ Next.js (App Router, TypeScript, Tailwind, ESLint) ในโฟลเดอร์นี้ โดยเก็บไฟล์ที่มีอยู่ (data/, docs/, design/, public/images/, CLAUDE.md) ไว้เหมือนเดิม
ตั้งค่าฟอนต์ Kanit + Anuphan และสีแบรนด์ตาม CLAUDE.md ให้ใช้ได้ทั้งโปรเจกต์
ตั้ง git และ .gitignore (ต้องมี .env*) แล้วรัน dev server ให้ดู แล้วบอกฉันว่าเปิดดูที่ไหน
```

## Phase 1 — หน้าร้าน (ยังไม่รับเงิน)

```
ทำหน้าเว็บตาม docs/SPEC.md โดยอ่านข้อมูลจาก data/products.json โดยตรง (ยังไม่ต่อฐานข้อมูล)
- หน้าแรก, /products, /products/[slug], /size-guide และลิ้นชักตะกร้า (เก็บใน localStorage)
- ดูหน้าตาและข้อความจาก design/prototype.dc.html แต่หน้าสินค้าต้องเป็นหน้าแยก ไม่ใช่ป๊อปอัป
- สถานะการขาย: ใส่ตะกร้าได้เฉพาะ on_sale · preorder และ unavailable ใช้ปุ่ม LINE ตาม CLAUDE.md หัวข้อสถานะการขาย
- รุ่นที่ published = false ไม่ต้องขึ้นเว็บและไม่ต้องอยู่ใน sitemap
- ปุ่ม "ไปชำระเงิน" ตอนนี้ให้พาไปหน้า /checkout ที่เขียนว่า "เร็ว ๆ นี้" ก่อน
- ทำ metadata, sitemap.xml, robots.txt และ JSON-LD ของสินค้าไปด้วยเลย
- footer ทุกหน้ามีลิงก์ TikTok / Instagram / Shopee อ่านจาก social ใน data/products.json
เช็กบนจอมือถือ (390px) และจอคอม เสร็จแล้วรัน build + lint ให้ผ่าน
```

ตอนจบ Phase นี้ ถ้าอยากให้คนเห็นก่อน ให้สั่งต่อว่า:

```
ช่วยพาฉัน deploy ขึ้น Vercel ทีละขั้น ตั้งแต่สมัคร GitHub/Vercel จนได้ลิงก์เว็บ
แล้วสอนวิธีผูกโดเมน angrymuscles.com (ตั้ง redirect www → ไม่มี www) และตั้ง NEXT_PUBLIC_SITE_URL=https://angrymuscles.com ใน Vercel
```

## Phase 2 — ฐานข้อมูลและสถานะการขาย

```
ต่อ Supabase ตาม docs/SPEC.md หัวข้อฐานข้อมูล
- สร้างตาราง products, variants, orders, order_items, availability_log พร้อม Row Level Security
- variants ใช้คอลัมน์ availability (enum on_sale/preorder/unavailable) ไม่มีคอลัมน์ stock · products มีคอลัมน์ published
- เขียนสคริปต์ seed จาก data/products.json
- ให้หน้าเว็บอ่านสินค้าและสถานะการขายจากฐานข้อมูลแทนไฟล์ json (ยังแสดงผลแบบ server-side เพื่อ SEO)
บอกขั้นตอนสมัคร Supabase และ key ที่ต้องเอามาใส่ใน .env.local ทีละข้อ
```

## Phase 3 — ชำระเงินด้วย PromptPay

```
ทำหน้า /checkout และระบบจ่ายเงินตาม docs/SPEC.md หัวข้อชำระเงิน ด้วย Stripe Checkout (promptpay + card, THB)
- server เช็กราคาและ availability จากฐานข้อมูลก่อนสร้าง session · ถ้ามีรายการที่ไม่ใช่ on_sale ให้ตัดออกและให้ลูกค้ายืนยันยอดใหม่ ห้ามสร้าง session
- webhook ตาม docs/SPEC.md หัวข้อ "ยืนยันว่าจ่ายแล้ว": ฟัง checkout.session.completed (เช็ก payment_status), async_payment_succeeded, async_payment_failed, expired · ตรวจลายเซ็น · idempotent · เทียบยอดเงิน · ส่งอีเมลด้วย Resend (ไม่มีการตัดสต็อก)
- ก่อนเขียนโค้ด ให้เปิดเอกสาร Stripe เรื่อง PromptPay และ Checkout fulfillment มาอ่านก่อน แล้วบอกฉันว่า QR หมดอายุกี่นาที และ PromptPay ยืนยันทันทีหรือแบบ async
- หน้า /order/[token] แสดงผลหลังจ่ายตาม SPEC (อ่านสถานะจากฐานข้อมูล ไม่เชื่อ redirect · token สุ่มเดาไม่ได้ ห้ามใช้เลขออเดอร์ใน URL)
- ลูกค้าสั่งได้โดยไม่ต้องสมัครสมาชิก แต่ต้องกรอกอีเมล (บังคับ) เพื่อรับอีเมลยืนยันและลิงก์ดูออเดอร์
- ค่าส่งทำเป็น config ไว้ (ตอนนี้ยังเป็น [ใส่อัตราค่าส่ง])
ทดสอบด้วยโหมดทดสอบของ Stripe ให้ครบ: จ่ายสำเร็จ · จ่ายไม่สำเร็จ · QR หมดอายุ · ส่ง webhook เดิมซ้ำ 2 ครั้ง (ต้องไม่ได้อีเมลซ้ำ) · เปิดหน้า /order/[token] เองโดยไม่จ่าย (ต้องไม่ขึ้นว่าจ่ายแล้ว) แล้วบอกวิธีทดสอบให้ฉันลองเอง
บอกขั้นตอนสมัคร Stripe (บัญชีธุรกิจไทย) และ Resend ทีละข้อ
```

## Phase 4 — หน้าแอดมิน

```
ทำหน้า /admin ตาม docs/SPEC.md หัวข้อแอดมิน
- ล็อกอินด้วย Supabase Auth เฉพาะอีเมลใน ADMIN_EMAILS
- ดูและเปลี่ยนสถานะออเดอร์ ใส่เลขพัสดุ export CSV
- แก้ราคา · สวิตช์เปิด/ปิดทั้งรุ่น · ตั้งสถานะการขายทีละตัวเลือก (พร้อมขาย / รอพรีออเดอร์ / ยังไม่พร้อมขาย) จัดกลุ่มตามสี มีปุ่มลัด "ตั้งทุกไซส์ของสีนี้" และ "ตั้งทั้งรุ่น"
- บันทึกทันทีเมื่อกด มีปุ่มเลิกทำ และเก็บ log ลง availability_log
- นำเข้าจาก CSV คอลัมน์ sku, availability
ใช้งานบนมือถือได้ด้วย
```

## Phase 5 — Google

```
เตรียมเว็บให้ Google
- ตรวจ metadata, JSON-LD (Product, Offer, Organization พร้อม sameAs ของ TikTok/IG/Shopee, FAQPage), sitemap, robots ให้ครบทุกหน้า
- ทำ /feeds/google-merchant.xml ตาม docs/SPEC.md
- ตรวจความเร็วหน้าเว็บบนมือถือ (รูป, ฟอนต์) ให้ผ่าน Core Web Vitals
จากนั้นสอนฉันทีละขั้น: ยืนยันเว็บใน Google Search Console + ส่ง sitemap และสมัคร Google Merchant Center + ใส่ feed
```

## Phase 6 — ก่อนเปิดขายจริง

```
ช่วยตรวจความพร้อมก่อนเปิดขาย:
- สลับ Stripe เป็นโหมดจริง ทดสอบจ่ายจริง 1 ออเดอร์แล้วคืนเงิน
- หน้านโยบาย (ค่าส่ง, เปลี่ยน/คืน, ความเป็นส่วนตัว) มีเนื้อหาจริงครบ ไม่เหลือ [placeholder]
- สถานะการขายทุกตัวเลือกตรงกับของจริง (ไล่ดูทั้ง 55 รายการในหน้าแอดมิน)
- ปุ่ม LINE ทุกปุ่มไป https://lin.ee/SNUS5D2
- ไม่มี key หรือ secret อยู่ในโค้ดหรือใน git
ทำเป็น checklist ให้ฉันติ๊ก
```
