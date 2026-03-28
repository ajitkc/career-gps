import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Career GPS — Navigate Your Future",
  description:
    "AI-powered career guidance for students and early professionals. Get personalized roadmaps, burnout monitoring, and actionable next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} dark`}>
      <body className="min-h-screen bg-surface text-on-surface font-body antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
