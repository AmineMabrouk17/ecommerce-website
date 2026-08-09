import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteHeader } from "@/components/site/header";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SiteHeader />
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
