import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { shippingConfig } from "@/lib/site";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const shipping = shippingConfig();
  return (
    <CartProvider>
      <a href="#main" className="btn btn-white sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
        ข้ามไปเนื้อหา
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer shipping={shipping} />
    </CartProvider>
  );
}
