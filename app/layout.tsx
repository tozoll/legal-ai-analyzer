import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LexAI — AI-Powered Contract Analyzer",
  description: "Upload your contracts and get instant, comprehensive legal analysis powered by Claude AI.",
  keywords: ["contract analysis", "legal AI", "document review", "AI lawyer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
