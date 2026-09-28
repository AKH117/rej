import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "رِجَالٌ صَدَقُوا | درع العفة وسباق الصادقين",
  description: "المنظومة الإيمانية الذكية لكسر قيد الإباحية والعادة السرية وإحياء الرجولة الحقة في الأمة.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070a10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#070a10] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        <main className="max-w-md mx-auto min-h-screen relative flex flex-col px-4 py-3 sm:max-w-lg md:max-w-xl">
          {children}
        </main>
      </body>
    </html>
  );
}
