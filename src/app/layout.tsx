import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumen Leads | AI-Powered Insurance Qualification",
  description: "THE LIGHT YOU WERE LOOKING FOR.",
  icons: {
    icon: '/neon-lighthouse.jpg',
  },
};

import Header from "@/components/Header";
import ReferralTracker from "@/components/ReferralTracker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="bg-gradient"></div>
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <Header />
        {children}
      </body>
    </html>
  );
}
