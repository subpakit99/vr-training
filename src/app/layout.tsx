import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/lib/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VR Container Training",
  description: "ระบบจัดการอบรมพนักงาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <Sidebar />
            <main className="flex-1 max-h-screen overflow-y-auto w-full pt-16 md:pt-0">
              {children}
            </main>
            <AIChat />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
