import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "마음의 화분 | 감정 힐링 게임",
  description:
    "긍정의 말로 식물을 키우고, 부정의 감정을 비워내는 힐링 챗봇 게임",
  icons: {
    icon: [
      { url: "/icons/icons_192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icons_512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icons_192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

/** iOS Safari가 작은 입력창 포커스 시 자동 확대하는 것을 막음 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
