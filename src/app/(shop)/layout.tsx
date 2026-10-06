import { Header } from "@/frontend/components/layout/Header";
import { BottomNav } from "@/frontend/components/layout/BottomNav";
import { CinematicFooter } from "@/frontend/components/motion/CinematicFooter";
import { SmoothScrollProvider } from "@/frontend/components/motion/SmoothScrollProvider";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-[96px] pb-20 md:pb-0">{children}</main>
        <CinematicFooter />
        <BottomNav />
      </div>
    </SmoothScrollProvider>
  );
}
