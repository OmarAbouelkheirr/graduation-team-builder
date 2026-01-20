import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "./_components/NavBar";
import { MaintenanceCheck } from "./_components/MaintenanceCheck";
import { ToastProvider } from "./_components/ToastProvider";
import { SiteFooter } from "./_components/SiteFooter";
import { DynamicTitle } from "./_components/DynamicTitle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniConnect - Graduation Project Team Matching Platform",
  description:
    "A simple platform for matching graduation project students and forming suitable teams based on track, skills, and experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-100 text-zinc-900`}
      >
        <DynamicTitle />
        <ToastProvider>
          <MaintenanceCheck>
            <div className="app-shell min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
              <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
                <NavBar />
              </header>

              <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

              <SiteFooter />
            </div>
          </MaintenanceCheck>
        </ToastProvider>
      </body>
    </html>
  );
}
