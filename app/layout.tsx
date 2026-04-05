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
  title: "Doopydupe — Find the dupe",
  description: "Fashion dupe finder. Paste any product link — get material info, sizing, and similar items from cheaper brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <nav className="border-b-2 border-black px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-black tracking-tight">
            <span className="text-accent">dooby</span>dupe
          </a>
          <div className="flex items-center gap-6">
            <a
              href="/compare"
              className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
            >
              Compare
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
