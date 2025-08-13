import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/ui/layout/Navbar";
import Footer from "@/components/ui/layout/Footer";
import { NotificationContainer } from "@/components/ui/feedback/NotificationContainer";
import { ErrorBoundary } from "@/components/ui/feedback/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Timetable App",
  description: "Create and manage your class timetable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900`}
      >
        <ErrorBoundary>
          <Navbar />
          <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
            {children}
          </main>
          <Footer />
          {/* Global notification container */}
          <NotificationContainer position="top-right" />
        </ErrorBoundary>
      </body>
    </html>
  );
}
