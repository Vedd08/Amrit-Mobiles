import { SiteNav } from "@/frontend/components/layout/SiteNav";
import { BottomNav } from "@/frontend/components/layout/BottomNav";
import { CinematicFooter } from "@/frontend/components/motion/CinematicFooter";
import { SmoothScrollProvider } from "@/frontend/components/motion/SmoothScrollProvider";
import { StoreChatPicker } from "@/frontend/components/whatsapp/StoreChatPicker";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="flex min-h-screen flex-col">
        <SiteNav />
        <main className="flex-1 pt-[96px] pb-20 md:pb-0">{children}</main>
        <CinematicFooter />
        <BottomNav />
      </div>
      <StoreChatPicker />
    </SmoothScrollProvider>
  );
}
