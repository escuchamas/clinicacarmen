"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AQUA = "#0D9488";

const TABS = [
  { href: "/pacientes", label: "Pacientes" },
  { href: "/calendario", label: "Calendario" },
  { href: "/pilates", label: "Pilates" },
  { href: "/finanzas", label: "Finanzas" },
  { href: "/leads", label: "Leads" },
  { href: "/ajustes", label: "Ajustes" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [impagos, setImpagos] = useState(0);

  useEffect(() => {
    fetch("/api/impagos")
      .then((r) => r.json())
      .then((d) => setImpagos(d.total ?? 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {TABS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        const hasbadge = href === "/finanzas" && impagos > 0;
        return (
          <Link
            key={href}
            href={href}
            style={{ textDecoration: "none" }}
            className="relative text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <span
              style={{
                color: active ? AQUA : "#6b7280",
                backgroundColor: active ? "#ccfbf1" : "transparent",
                borderRadius: "0.5rem",
                padding: "0.375rem 0.75rem",
                fontWeight: active ? 600 : 500,
                display: "inline-block",
                transition: "all 0.15s",
              }}
            >
              {label}
              {hasbadge && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "6px",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9999px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0 4px",
                    verticalAlign: "middle",
                    lineHeight: 1,
                  }}
                >
                  {impagos > 99 ? "99+" : impagos}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
