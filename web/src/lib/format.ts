/** ใช้ได้ทั้งฝั่ง server และ client */
export function formatTHB(n: number) {
  return "฿" + n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 4) return phone;
  return `${d.slice(0, 2)}x-xxx-${d.slice(-4)}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
}
