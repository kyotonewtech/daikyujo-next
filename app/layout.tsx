import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, Shippori_Mincho } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  display: "block",
});

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "600"],
  display: "block",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  variable: "--font-shippori",
  weight: ["400", "500", "600", "700", "800"],
  display: "block",
});

export const metadata: Metadata = {
  title: "園山大弓場 | 京都・東山 160年の歴史",
  description: "京都・東山にある創業文久二年の弓道場。初心者から経験者まで、伝統的な弓術体験を提供します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className={`${notoSans.variable} ${notoSerif.variable} ${shipporiMincho.variable} font-sans bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}