import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StagewiseToolbarClient from "../components/StagewiseToolbarClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeCrypto - Learn Crypto & Investing Like a Pro",
  description: "Master cryptocurrency and investing with interactive lessons, fun challenges, and real-world practice. Start your crypto journey today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StagewiseToolbarClient />
        {children}
      </body>
    </html>
  );
}
