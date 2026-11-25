import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import seed from "../../../data/products.json";
import type { Availability, LogEntry, NewOrder, Order, OrderStatus, Product } from "../types";
import type { OrderPatch, Store } from "./types";

/**
 * ที่เก็บข้อมูลแบบไฟล์ สำหรับทดสอบบนเครื่องเท่านั้น
 * บน Vercel ห้ามใช้ (ไฟล์ไม่ถาวร) — ดู store/index.ts
 */
type Data = { products: Product[]; orders: Order[]; logs: LogEntry[]; seq: number };

const FILE = path.join(process.cwd(), ".data", "store.json");

function seedData(): Data {
  return {
    products: (seed.products as unknown as Product[]).map((p) => ({
      ...p,
      image_bg: p.image_bg ?? null,
      material: p.material ?? null,
      size_note: p.size_note ?? null,
      size_chart: p.size_chart ?? null,
    })),
    orders: [],
    logs: [],
    seq: 0,
  };
}

function load(): Data {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Data;
  } catch {
    const d = seedData();
    save(d);
    return d;
  }
}

function save(d: Data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2));
  fs.renameSync(tmp, FILE);
}

function log(d: Data, e: Omit<LogEntry, "at">) {
  d.logs.unshift({ ...e, at: new Date().toISOString() });
  d.logs = d.logs.slice(0, 500);
}

export const localStore: Store = {
  kind: "local",

  async getProducts() {
    return load().products;
  },

  async setPublished(slug, published, admin) {
    const d = load();
    const p = d.products.find((x) => x.slug === slug);
    if (!p) throw new Error("ไม่พบสินค้า " + slug);
    log(d, { sku: slug, field: "published", from_value: String(p.published), to_value: String(published), admin_email: admin });
    p.published = published;
    save(d);
  },

  async setPrice(slug, price, admin) {
    const d = load();
    const p = d.products.find((x) => x.slug === slug);
    if (!p) throw new Error("ไม่พบสินค้า " + slug);
    log(d, { sku: slug, field: "price", from_value: String(p.price), to_value: String(price), admin_email: admin });
    p.price = price;
    save(d);
  },

  async setAvailability(skus, value: Availability, admin) {
    const d = load();
    const updated: string[] = [];
    const missing: string[] = [];
    for (const sku of skus) {
      const v = d.products.flatMap((p) => p.variants).find((x) => x.sku === sku);
      if (!v) {
        missing.push(sku);
        continue;
      }
      if (v.availability !== value) {
        log(d, { sku, field: "availability", from_value: v.availability, to_value: value, admin_email: admin });
        v.availability = value;
      }
      updated.push(sku);
    }
    save(d);
    return { updated, missing };
  },

  async getLogs(limit) {
    return load().logs.slice(0, limit);
  },

  async createOrder(o: NewOrder) {
    const d = load();
    d.seq += 1;
    const order: Order = {
      ...o,
      id: randomUUID(),
      number: "AM-" + String(d.seq).padStart(6, "0"),
      status: "pending",
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      tracking_no: null,
      carrier: null,
      note: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    };
    d.orders.unshift(order);
    save(d);
    return order;
  },

  async getOrderById(id) {
    return load().orders.find((o) => o.id === id) ?? null;
  },
  async getOrderByToken(token) {
    return load().orders.find((o) => o.view_token === token) ?? null;
  },
  async getOrderBySession(sessionId) {
    return load().orders.find((o) => o.stripe_session_id === sessionId) ?? null;
  },

  async transitionOrder(id, from: OrderStatus[], patch: OrderPatch) {
    const d = load();
    const o = d.orders.find((x) => x.id === id);
    if (!o || !from.includes(o.status)) return null;
    Object.assign(o, patch);
    save(d);
    return o;
  },

  async updateOrder(id, patch) {
    const d = load();
    const o = d.orders.find((x) => x.id === id);
    if (!o) return null;
    Object.assign(o, patch);
    save(d);
    return o;
  },

  async listOrders({ status, limit = 200 }) {
    return load()
      .orders.filter((o) => !status || o.status === status)
      .slice(0, limit);
  },
};
