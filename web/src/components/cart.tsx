"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  sku: string;
  slug: string;
  name: string;
  color: string;
  size: string; // label ที่แสดง เช่น "22–26 cm"
  price: number;
  image: string | null;
  unit: string;
  qty: number;
};

type Ctx = {
  lines: CartLine[];
  ready: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (line: CartLine) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  removeMany: (skus: string[]) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "am_cart_v1";
export const MAX_QTY = 10;

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function write(lines: CartLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* private mode — ตะกร้าอยู่แค่ในหน้านี้ */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- อ่าน localStorage ได้หลัง hydrate เท่านั้น
    setLines(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (l: CartLine[]) => CartLine[]) => {
    setLines((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      ready,
      open,
      setOpen,
      add: (line) =>
        update((prev) => {
          const i = prev.findIndex((l) => l.sku === line.sku);
          if (i === -1) return [...prev, { ...line, qty: Math.min(line.qty, MAX_QTY) }];
          const copy = [...prev];
          copy[i] = { ...line, qty: Math.min(copy[i].qty + line.qty, MAX_QTY) };
          return copy;
        }),
      setQty: (sku, qty) =>
        update((prev) => prev.map((l) => (l.sku === sku ? { ...l, qty: Math.max(1, Math.min(qty, MAX_QTY)) } : l))),
      remove: (sku) => update((prev) => prev.filter((l) => l.sku !== sku)),
      removeMany: (skus) => update((prev) => prev.filter((l) => !skus.includes(l.sku))),
      clear: () => update(() => []),
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
    }),
    [lines, ready, open, update],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart ต้องอยู่ใน CartProvider");
  return c;
}
