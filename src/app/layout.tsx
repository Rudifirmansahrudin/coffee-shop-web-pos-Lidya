import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { CosmosBackground } from "@/components/space/CosmosBackground";
import { SurfaceSetter } from "@/components/layout/SurfaceSetter";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Space Coffee and Matcha",
  description: "Coffee That Takes You Further",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${sora.variable} ${jakarta.variable}`}>
      <body
        suppressHydrationWarning
        className="bg-cream font-sans text-base text-ink antialiased"
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <SurfaceSetter />
          <CosmosBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}