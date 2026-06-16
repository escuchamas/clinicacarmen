import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica Carmen · Fisioterapia",
  description: "Sistema de gestión de historiales clínicos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full" style={{ backgroundColor: "#F2EDE3" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
