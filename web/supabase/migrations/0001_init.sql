-- Angry Muscles — โครงสร้างฐานข้อมูล
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางทั้งไฟล์ → Run (รันครั้งเดียวตอนตั้งโปรเจกต์)
-- เว็บนี้ไม่นับสต็อก: variants ใช้ availability แทน (ห้ามเพิ่มคอลัมน์ stock)

create type public.availability as enum ('on_sale', 'preorder', 'unavailable');
create type public.order_status as enum (
  'pending', 'paid', 'payment_failed', 'expired', 'packed', 'shipped', 'cancelled', 'needs_attention'
);

create table public.products (
  slug        text primary key,
  name        text not null,
  subtitle    text not null default '',
  category    text not null,
  published   boolean not null default true,
  price       integer not null check (price > 0),       -- บาทเต็ม
  unit        text not null default 'ชิ้น',
  material    text,
  sizes       jsonb not null default '[]',
  size_note   text,
  size_chart  text,
  features    jsonb not null default '[]',
  image_bg    text,
  sort        integer not null default 0
);

create table public.variants (
  sku           text primary key,
  product_slug  text not null references public.products (slug) on update cascade on delete cascade,
  color         text not null,
  color_hex     text not null default '#000000',
  size          text not null,
  availability  public.availability not null default 'on_sale',
  image         text,
  note          text,
  sort          integer not null default 0
);
create index variants_product_idx on public.variants (product_slug);

create sequence public.order_number_seq;

create table public.orders (
  id                        uuid primary key default gen_random_uuid(),
  number                    text not null unique default ('AM-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  view_token                text not null unique,          -- สุ่ม ใช้ในลิงก์ดูออเดอร์ของลูกค้า
  status                    public.order_status not null default 'pending',
  customer_name             text not null,
  phone                     text not null,
  email                     text not null,
  address                   jsonb not null,
  subtotal                  integer not null check (subtotal >= 0),
  shipping_fee              integer not null check (shipping_fee >= 0),
  total                     integer not null check (total >= 0),
  stripe_session_id         text unique,
  stripe_payment_intent_id  text,
  tracking_no               text,
  carrier                   text,
  note                      text,
  created_at                timestamptz not null default now(),
  paid_at                   timestamptz,
  updated_at                timestamptz not null default now()
);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id            bigint generated always as identity primary key,
  order_id      uuid not null references public.orders (id) on delete cascade,
  sku           text not null,
  product_slug  text not null,
  name          text not null,
  color         text not null,
  size          text not null,
  qty           integer not null check (qty > 0),
  unit_price    integer not null check (unit_price >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.availability_log (
  id           bigint generated always as identity primary key,
  sku          text not null,
  field        text not null,
  from_value   text,
  to_value     text,
  admin_email  text not null,
  at           timestamptz not null default now()
);
create index availability_log_at_idx on public.availability_log (at desc);

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end
$$;
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();

-- สิทธิ์เข้าถึงตาราง (ใส่เองแบบระบุชัด — ไม่พึ่งตัวเลือก "Grant API access to new tables automatically")
-- server ใช้ service_role · ลูกค้า (anon) อ่านได้แค่ products/variants และถูกจำกัดต่อด้วย RLS ด้านล่าง
grant usage on schema public to anon, authenticated, service_role;
grant select on public.products, public.variants to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Row Level Security
-- ลูกค้า (anon key) อ่านได้แค่สินค้าที่เปิดขาย · ออเดอร์/log ไม่มี policy = เข้าถึงได้เฉพาะ server (service role)
alter table public.products          enable row level security;
alter table public.variants          enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.availability_log  enable row level security;

create policy "read published products" on public.products
  for select to anon, authenticated using (published);
create policy "read variants of published products" on public.variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.slug = product_slug and p.published));
