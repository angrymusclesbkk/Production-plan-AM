import type { OrderStatus } from "./types";

/** ข้อความสถานะที่ลูกค้าเห็น */
export const CUSTOMER_STATUS: Record<OrderStatus, { title: string; tone: "wait" | "ok" | "bad" }> = {
  pending: { title: "กำลังรอยืนยันการชำระเงิน", tone: "wait" },
  paid: { title: "ชำระเงินเรียบร้อย", tone: "ok" },
  packed: { title: "กำลังแพ็กของ", tone: "ok" },
  shipped: { title: "ส่งของแล้ว", tone: "ok" },
  payment_failed: { title: "การชำระเงินไม่สำเร็จ", tone: "bad" },
  expired: { title: "หมดเวลาชำระเงิน", tone: "bad" },
  cancelled: { title: "ยกเลิกแล้ว", tone: "bad" },
  needs_attention: { title: "ทีมงานกำลังตรวจสอบออเดอร์นี้", tone: "wait" },
};

/** ชื่อสถานะในหน้าแอดมิน */
export const ADMIN_STATUS: Record<OrderStatus, string> = {
  pending: "รอจ่าย",
  paid: "จ่ายแล้ว",
  packed: "แพ็กแล้ว",
  shipped: "ส่งแล้ว",
  payment_failed: "จ่ายไม่สำเร็จ",
  expired: "หมดเวลา",
  cancelled: "ยกเลิก",
  needs_attention: "ต้องตรวจ",
};
