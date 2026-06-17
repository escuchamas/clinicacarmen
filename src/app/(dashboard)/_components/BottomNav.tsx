"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CalendarDays, Activity, BarChart3 } from "lucide-react";

const AQUA = "#0891B2";

const TABS = [
  { href: "/pacientes", icon: Users, label: "Pacientes" },
  { href: "/calendario", icon: CalendarDays, label: "Calendario" },
  { href: "/pilates", icon: Activity, label: "Pilates" },
  { href: "/finanzas", icon: BarChart3, label: "Finanzas" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
      style={{ backgroundColor: "white", borderTop: "1px solid #DDD8CE", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
              style={{ textDecoration: "none", color: active ? AQUA : "#9ca3af" }}
            >
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
              <span style={{ fontSize: "0.6875rem", fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
