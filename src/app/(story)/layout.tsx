import type { Metadata } from "next";

import { SmoothScrollProvider } from "@/frontend/components/motion/SmoothScrollProvider";
import { StoreChatPicker } from "@/frontend/components/whatsapp/StoreChatPicker";
import { BRANCHES } from "@/shared/branches";

export const metadata: Metadata = {
  title: "Amrit Mobiles — Authorised phone dealer in Surat",
  description:
    `${BRANCHES.length} branches across Surat. Sealed stock opened at the counter, IMEI printed on your GST bill, 0% EMI approved in ten minutes, and your old phone valued on the spot.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Amrit Mobiles — Authorised phone dealer in Surat",
    description:
      `Sealed stock opened at the counter, IMEI on your GST bill, 0% EMI in ten minutes. ${BRANCHES.length} branches across Surat.`,
    type: "website",
    locale: "en_IN",
  },
};

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="flex min-h-screen flex-col bg-paper text-ink">
        <main className="flex-1">{children}</main>
      </div>
      <StoreChatPicker />
    </SmoothScrollProvider>
  );
}
