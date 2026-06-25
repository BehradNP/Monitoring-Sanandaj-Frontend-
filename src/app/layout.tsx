import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const iranYekan = localFont({
  src: [
    {
      path: "../assets/fonts/iran-yekan/YekanBakh-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/iran-yekan/YekanBakh-SemiBold.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/iran-yekan/YekanBakh-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سیستم مانیتورینگ شهرداری سنندج",
  description: "داشبورد مدیریت و کنترل",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={iranYekan.variable}>
      <body className="min-h-screen font-sans bg-slate-50">
        {children}
      </body>
    </html>
  );
}
