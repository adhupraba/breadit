import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/Toaster";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Breadit",
  description: "A Reddit clone built with Next.js, TypeScript and Go.",
};

export default function RootLayout({ children, authModal }: { children: React.ReactNode; authModal: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white text-slate-900 antialiased light">
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Providers>
          {/* @ts-ignore */}
          <Navbar />
          {authModal}
          <div className="container max-w-7xl mx-auto h-full pt-12">{children}</div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
