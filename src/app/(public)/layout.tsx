import { BottomNav } from "@/components/layout/BottomNav";
import { CartFab } from "@/components/layout/CartFab";
import { Footer } from "@/components/layout/Footer";
import { TopNav } from "@/components/layout/TopNav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
      <CartFab />
    </div>
  );
}