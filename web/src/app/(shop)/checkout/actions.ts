"use server";

import { z } from "zod";
import { MAX_QTY_PER_LINE } from "@/lib/site";
import { placeOrder, quoteCart, type PlaceOrderResult, type Quote } from "@/lib/orders";

const cartSchema = z
  .array(z.object({ sku: z.string().min(1).max(64), qty: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
  .max(50);

export async function getQuoteAction(items: unknown): Promise<Quote | null> {
  const parsed = cartSchema.safeParse(items);
  if (!parsed.success) return null;
  return quoteCart(parsed.data);
}

export async function placeOrderAction(input: unknown): Promise<PlaceOrderResult> {
  return placeOrder(input);
}
