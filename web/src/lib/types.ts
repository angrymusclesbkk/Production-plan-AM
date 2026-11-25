export type Availability = "on_sale" | "preorder" | "unavailable";
export const AVAILABILITY_VALUES: Availability[] = ["on_sale", "preorder", "unavailable"];

export type SizeOption = { code: string; label: string; foot_cm?: string; eu?: string };

export type Variant = {
  sku: string;
  color: string;
  color_hex: string;
  size: string;
  availability: Availability;
  image: string | null;
};

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  published: boolean;
  price: number;
  unit: string;
  material: string | null;
  sizes: SizeOption[];
  size_note: string | null;
  size_chart: string | null;
  features: string[];
  image_bg: string | null;
  variants: Variant[];
};

export type Category = { id: string; label: string };

export type OrderStatus =
  | "pending"
  | "paid"
  | "payment_failed"
  | "expired"
  | "packed"
  | "shipped"
  | "cancelled"
  | "needs_attention";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "payment_failed",
  "expired",
  "packed",
  "shipped",
  "cancelled",
  "needs_attention",
];

export type Address = {
  line1: string;
  district: string;
  province: string;
  postcode: string;
};

export type OrderItem = {
  sku: string;
  product_slug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unit_price: number;
};

/** ยอดเงินทุกช่องเป็นบาทเต็ม (ไม่ใช่สตางค์) */
export type Order = {
  id: string;
  number: string;
  view_token: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  email: string;
  address: Address;
  subtotal: number;
  shipping_fee: number;
  total: number;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  tracking_no: string | null;
  carrier: string | null;
  note: string | null;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
};

export type NewOrder = Omit<
  Order,
  | "id"
  | "number"
  | "status"
  | "stripe_session_id"
  | "stripe_payment_intent_id"
  | "tracking_no"
  | "carrier"
  | "note"
  | "created_at"
  | "paid_at"
>;

export type LogEntry = {
  sku: string;
  field: string;
  from_value: string | null;
  to_value: string | null;
  admin_email: string;
  at: string;
};
