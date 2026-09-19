import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/app-shell/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { GuidedTourBar } from "@/components/demo-guide/guided-tour-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RailSync — Maintenance planning",
  description: "Plan railway maintenance together. Review tasks, share track closure times, and approve a weekly plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full">
        <TooltipProvider>
          <Sidebar />
          <div className="app-workspace">
            <GuidedTourBar />
            <main id="main-content" className="min-w-0 flex-1">
              {children}
            </main>
          </div>
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
