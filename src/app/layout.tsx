import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ZaloFloat from "@/components/ui/ZaloFloat";
import SitePopup from "@/components/ui/SitePopup";
import AuthProvider from "@/components/providers/AuthProvider";
import MaterialSymbolsLoader from "@/components/providers/MaterialSymbolsLoader";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Thiên Nhật Minh Shop",
    template: "%s | Thiên Nhật Minh Shop",
  },
  description: "Thiên Nhật Minh Shop - Thiết bị điện công nghiệp chuyên nghiệp.",
  applicationName: "Thiên Nhật Minh Shop",
  openGraph: {
    title: "Thiên Nhật Minh Shop",
    description: "Thiết bị điện công nghiệp chuyên nghiệp.",
    siteName: "Thiên Nhật Minh Shop",
    locale: "vi_VN",
    type: "website",
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  verification: {
    google: "ZXx6ClR95-oLXenxw8h1Gxs4fhsgV4URiQLuSTY_WkU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body text-on-surface">
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <MaterialSymbolsLoader />
                {children}
                <ZaloFloat />
                <SitePopup />
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
