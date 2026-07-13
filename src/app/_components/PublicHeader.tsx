import Link from "next/link";

const BRAND = "#8E7D6B";

export default function PublicHeader({ activePath }: { activePath?: string }) {
  const links = [
    { href: "/#servicios", label: "Servicios" },
    { href: "/#pilates",   label: "Pilates"   },
    { href: "/blog",       label: "Blog"       },
    { href: "/contacto",   label: "Contacto"   },
  ];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#F2ECE6", borderBottom: "1px solid #DCC8B2", padding: "0 1.5rem" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <Link href="/">
          <img src="/logo-vianova.jpeg" alt="ViaNova · Clínica de Fisioterapia" style={{ height: 40, width: "auto", display: "block", flexShrink: 0 }} />
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1, justifyContent: "center" }} className="hidden sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              style={{ fontWeight: activePath === href ? 700 : 500, color: activePath === href ? BRAND : undefined }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link href="/pedir-cita" style={{ flexShrink: 0, backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.5rem 1.25rem", borderRadius: "0.5rem", textDecoration: "none" }}>
          Reservar cita →
        </Link>
      </div>
    </header>
  );
}
