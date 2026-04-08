import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Career Ops -- AI Job Search Command Center",
  description:
    "AI-powered job search pipeline: offer evaluation, CV generation, portal scanning, and application tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className="min-h-full flex font-sans"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <Sidebar />
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
