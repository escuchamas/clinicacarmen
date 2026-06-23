"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, CalendarDays, Activity, BarChart3, Settings } from "lucide-react";

const AQUA = "#9B7B68";

const TABS = [
  { href: "/pacientes", icon: Users, label: "Pacientes" },
  { href: "/calendario", icon: CalendarDays, label: "Calendario" },
  { href: "/pilates", icon: Activity, label: "Pilates" },
  { href: "/finanzas", icon: BarChart3, label: "Finanzas" },
  { href: "/ajustes", icon: Settings, label: "Ajustes" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [impagos, setImpagos] = useState(0);

  useEffect(() => {
    fetch("/api/impagos")
      .then((r) => r.json())
      .then((d) => setImpagos(d.total ?? 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
      style={{ backgroundColor: "white", borderTop: "1px solid #DDD8CE", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const hasbadge = href === "/finanzas" && impagos > 0;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative"
              style={{ textDecoration: "none", color: active ? AQUA : "#9ca3af" }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                {hasbadge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      minWidth: "15px",
                      height: "15px",
                      borderRadius: "9999px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      lineHeight: 1,
                    }}
                  >
                    {impagos > 99 ? "99+" : impagos}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
