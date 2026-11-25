import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Availability, LogEntry, NewOrder, Order, OrderItem, OrderStatus, Product, Variant } from "../types";
import type { OrderPatch, Store } from "./types";

let client: SupabaseClient | null = null;

/** client ฝั่ง server ด้วย service role (ข้าม RLS) — ห้ามส่งไป browser */
function db() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function check<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase ${what}: ${res.error.message}`);
  return res.data;
}

type ProductRow = Omit<Product, "variants"> & { sort: number; variants: (Variant & { sort: number })[] };
type OrderRow = Omit<Order, "items"> & { order_items: OrderItem[] };

function toProduct(r: ProductRow): Product {
  const { variants, sort: _sort, ...rest } = r;
  void _sort;
  return {
    ...rest,
    features: rest.features ?? [],
    sizes: rest.sizes ?? [],
    variants: [...variants]
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort: _s, ...v }) => {
        void _s;
        return v;
      }),
  };
}

function toOrder(r: OrderRow): Order {
  const { order_items, ...rest } = r;
  return { ...rest, items: order_items ?? [] };
}

const ORDER_SELECT = "*, order_items(sku, product_slug, name, color, size, qty, unit_price)";

async function writeLog(entries: Omit<LogEntry, "at">[]) {
  if (entries.length) check(await db().from("availability_log").insert(entries), "log");
}

export const supabaseStore: Store = {
  kind: "supabase",

  async getProducts() {
    const rows = check(
      await db().from("products").select("*, variants(*)").order("sort"),
      "getProducts",
    ) as ProductRow[];
    return rows.map(toProduct);
  },

  async setPublished(slug, published, admin) {
    const cur = check(await db().from("products").select("published").eq("slug", slug).single(), "read product");
    check(await db().from("products").update({ published }).eq("slug", slug), "setPublished");
    await writeLog([
      { sku: slug, field: "published", from_value: String(cur?.published), to_value: String(published), admin_email: admin },
    ]);
  },

  async setPrice(slug, price, admin) {
    const cur = check(await db().from("products").select("price").eq("slug", slug).single(), "read product");
    check(await db().from("products").update({ price }).eq("slug", slug), "setPrice");
    await writeLog([
      { sku: slug, field: "price", from_value: String(cur?.price), to_value: String(price), admin_email: admin },
    ]);
  },

  async setAvailability(skus, value: Availability, admin) {
    const current = check(
      await db().from("variants").select("sku, availability").in("sku", skus),
      "read variants",
    ) as { sku: string; availability: Availability }[];
    const found = new Map(current.map((r) => [r.sku, r.availability]));
    const missing = skus.filter((s) => !found.has(s));
    const updated = skus.filter((s) => found.has(s));
    if (updated.length) {
      check(await db().from("variants").update({ availability: value }).in("sku", updated), "setAvailability");
    }
    await writeLog(
      updated
        .filter((s) => found.get(s) !== value)
        .map((s) => ({ sku: s, field: "availability", from_value: found.get(s)!, to_value: value, admin_email: admin })),
    );
    return { updated, missing };
  },

  async getLogs(limit) {
    return check(
      await db().from("availability_log").select("sku, field, from_value, to_value, admin_email, at").order("at", { ascending: false }).limit(limit),
      "getLogs",
    ) as LogEntry[];
  },

  async createOrder(o: NewOrder) {
    const { items, ...orderFields } = o;
    const row = check(await db().from("orders").insert(orderFields).select("id").single(), "createOrder") as { id: string };
    check(
      await db()
        .from("order_items")
        .insert(items.map((i) => ({ ...i, order_id: row.id }))),
      "createOrder items",
    );
    return (await this.getOrderById(row.id))!;
  },

  async getOrderById(id) {
    const r = check(await db().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle(), "getOrderById");
    return r ? toOrder(r as OrderRow) : null;
  },
  async getOrderByToken(token) {
    const r = check(await db().from("orders").select(ORDER_SELECT).eq("view_token", token).maybeSingle(), "getOrderByToken");
    return r ? toOrder(r as OrderRow) : null;
  },
  async getOrderBySession(sessionId) {
    const r = check(
      await db().from("orders").select(ORDER_SELECT).eq("stripe_session_id", sessionId).maybeSingle(),
      "getOrderBySession",
    );
    return r ? toOrder(r as OrderRow) : null;
  },

  async transitionOrder(id, from: OrderStatus[], patch: OrderPatch) {
    // UPDATE ... WHERE id = ? AND status IN (...) — ทำในคำสั่งเดียว กันสอง webhook ชนกัน
    const r = check(
      await db().from("orders").update(patch).eq("id", id).in("status", from).select("id").maybeSingle(),
      "transitionOrder",
    );
    return r ? this.getOrderById(id) : null;
  },

  async updateOrder(id, patch) {
    check(await db().from("orders").update(patch).eq("id", id), "updateOrder");
    return this.getOrderById(id);
  },

  async listOrders({ status, limit = 200 }) {
    let q = db().from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(limit);
    if (status) q = q.eq("status", status);
    return (check(await q, "listOrders") as OrderRow[]).map(toOrder);
  },
};
