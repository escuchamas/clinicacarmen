import type { Metadata } from "next";
import { Cormorant_Garamond, Raleway } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carmen Gómez · Clínica de Fisioterapia",
  description: "Fisioterapia manual y Pilates terapéutico en Campillos, Málaga.",
  icons: {
    icon: "/logo-vertical.jpeg",
    apple: "/logo-vertical.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`h-full ${cormorant.variable} ${raleway.variable}`}>
      <body className="min-h-full" style={{ backgroundColor: "#F5EFE9" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
