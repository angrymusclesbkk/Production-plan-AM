import type { Availability, LogEntry, NewOrder, Order, OrderStatus, Product } from "../types";

export type OrderPatch = Partial<
  Pick<
    Order,
    "status" | "stripe_session_id" | "stripe_payment_intent_id" | "tracking_no" | "carrier" | "note" | "paid_at"
  >
>;

export interface Store {
  kind: "local" | "supabase";
  /** ทุกรุ่น รวมที่ปิดอยู่ — ใช้ฝั่ง server เท่านั้น */
  getProducts(): Promise<Product[]>;
  setPublished(slug: string, published: boolean, admin: string): Promise<void>;
  setPrice(slug: string, price: number, admin: string): Promise<void>;
  setAvailability(
    skus: string[],
    value: Availability,
    admin: string,
  ): Promise<{ updated: string[]; missing: string[] }>;
  getLogs(limit: number): Promise<LogEntry[]>;

  createOrder(o: NewOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | null>;
  getOrderByToken(token: string): Promise<Order | null>;
  getOrderBySession(sessionId: string): Promise<Order | null>;
  /**
   * เปลี่ยนสถานะแบบมีเงื่อนไข: อัปเดตเฉพาะเมื่อสถานะปัจจุบันอยู่ใน `from`
   * คืนออเดอร์ที่อัปเดตแล้ว หรือ null ถ้าไม่ได้อัปเดต (กันประมวลผล webhook ซ้ำ)
   */
  transitionOrder(id: string, from: OrderStatus[], patch: OrderPatch): Promise<Order | null>;
  updateOrder(id: string, patch: OrderPatch): Promise<Order | null>;
  listOrders(opts: { status?: OrderStatus; limit?: number }): Promise<Order[]>;
}
