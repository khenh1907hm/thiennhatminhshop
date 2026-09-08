import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ZaloFloat from "@/components/ui/ZaloFloat";
import SitePopup from "@/components/ui/SitePopup";
import AuthProvider from "@/components/providers/AuthProvider";

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
  title: "Thiên Nhật Minh - Sản Phẩm Thiết Bị Điện Chuyên Nghiệp",
  description: "Đơn vị cung cấp giải pháp điện công nghiệp hàng đầu khu vực.",
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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body text-on-surface">
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
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
