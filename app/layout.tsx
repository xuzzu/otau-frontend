import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/lib/api/QueryProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Otaū — A House of Furniture",
  description:
    "Furnish the rooms before you walk into them. A Kazakhstan furniture marketplace that designs your apartment for you.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="otau bg-cream text-ink min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
