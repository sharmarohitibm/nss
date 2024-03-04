import type { Metadata } from "next";
import { Navigation } from "@/shared/components";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  title: "NUHS Gen-AI POC",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen w-screen">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
