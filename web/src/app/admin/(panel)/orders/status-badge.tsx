import { ADMIN_STATUS } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

const TONE: Record<OrderStatus, string> = {
  paid: "bg-ok text-white",
  packed: "bg-cat-pilates",
  shipped: "bg-cat-apparel",
  needs_attention: "bg-red text-white",
  pending: "bg-cat-daily",
  expired: "bg-white text-muted",
  payment_failed: "bg-white text-muted",
  cancelled: "bg-white text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block w-fit rounded-full border-2 border-ink px-3 py-0.5 font-display text-sm font-bold ${TONE[status]}`}>
      {ADMIN_STATUS[status]}
    </span>
  );
}
