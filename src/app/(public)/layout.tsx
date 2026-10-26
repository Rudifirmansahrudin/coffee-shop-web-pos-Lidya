import { BottomNav } from "@/components/layout/BottomNav";
import { CartFab } from "@/components/layout/CartFab";
import { Footer } from "@/components/layout/Footer";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { TopNav } from "@/components/layout/TopNav";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PageViewTracker />
      <MobileTopBar />
      <div className="hidden md:block">
        <TopNav />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
      <CartFab />
    </div>
  );
}