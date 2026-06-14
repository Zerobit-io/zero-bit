import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TrustlessWorkProvider } from "@/providers/TrustlessWorkProvider";
import { Toaster } from "@/components/ui/sonner"

// @ts-ignore: allow side-effect import of global css
import "./globals.css";

import { ClientProviders } from "@/providers/ClientProviders";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZeroBit | Stellar P2P Marketplace",
  description: "Buy, sell and trade peer-to-peer on the Stellar blockchain. ZeroBit protects every deal with trustless escrow — no middlemen, instant settlement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientProviders>
            <TrustlessWorkProvider>
              {children}
              <Toaster richColors position="top-right" />
            </TrustlessWorkProvider>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}