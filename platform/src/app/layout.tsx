import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const display = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-display-loaded",
  weight: ["300", "400", "500", "600", "700"],
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-body-loaded",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "رواق | منصة إدارة وتشغيل وحدات الضيافة",
    template: "%s | رواق",
  },
  description:
    "منصة سعودية متكاملة لإدارة وحدات الضيافة: تقويم موحد، حجوزات، مزامنة iCal، صفحة حجز مباشر لكل وحدة، وبوابة مالك.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
