import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Customer Journey Analytics | Meta Ads + GHL Dashboard",
  description: "Real-time customer journey tracking from Meta ads through deal closure with cost attribution and conversion analytics.",
  keywords: ["customer journey", "meta ads", "gohighlevel", "analytics", "dashboard", "conversion tracking"],
  authors: [{ name: "GHL Analytics Team" }],
  robots: "noindex, nofollow", // Private dashboard
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}