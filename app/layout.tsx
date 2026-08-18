import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { siteConfig } from "@/config/site";
import "./globals.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} antialiased`}
      >
        <Providers>
          <SiteHeader />
          {children}
          <CartDrawer />
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
