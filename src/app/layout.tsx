import type { Metadata } from "next";
import { Archivo, DM_Mono } from "next/font/google";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  weight: "500",
  variable: "--font-dm-mono",
  subsets: ["latin"],
});

import "./globals.css";

export const metadata: Metadata = {
  title: "Amrit Mobiles & Electronics",
  description: "Mobile phones — shop online or order via WhatsApp.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${dmMono.variable} antialiased`} suppressHydrationWarning>
      <body className={archivo.className}>{children}</body>
    </html>
  );
}
