import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lepo.si"),
  title: {
    default: "Lepo · Rezerviraj termin za lepoto",
    template: "%s · Lepo",
  },
  description:
    "Lepo je vodilna platforma za rezervacijo terminov v vrhunskih salonih po Sloveniji. " +
    "Odkrij, rezerviraj in si privošči trenutek zase.",
  applicationName: "Lepo",
  keywords: ["frizer", "salon", "lepota", "rezervacija", "Slovenija", "Ljubljana"],
  authors: [{ name: "Lepo" }],
  openGraph: {
    type: "website",
    locale: "sl_SI",
    siteName: "Lepo",
    title: "Lepo · Atelier Slovenija",
    description: "Rezerviraj termin za lepoto v vrhunskih salonih po Sloveniji.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lepo · Atelier Slovenija",
    description: "Rezerviraj termin za lepoto v vrhunskih salonih po Sloveniji.",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0F0C" },
    { media: "(prefers-color-scheme: light)", color: "#E5E2D2" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
