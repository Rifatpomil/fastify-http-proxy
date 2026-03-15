import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QueueFlow | AI Gateway Control Plane",
  description: "Manage your AI Infrastructure with QueueFlow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-[#0A0A0A] text-white min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
