import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import Header from "@/components/Header";
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
            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
              <Header />
              <main className="flex-1 overflow-y-auto w-full">
                {children}
              </main>
            </div>
            <AIChat />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
