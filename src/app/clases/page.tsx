import { getClasesPilates } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClasePilates } from "@/lib/types";
import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";

const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";
const CREAM = "#F2EDE3";
const PURPLE = "#7C3AED";
const DARK = "#111827";

export default async function ClasesPage() {
  const session = await auth();
  const user = session?.user as { role?: string; pacienteId?: string } | undefined;
  const isPatient = user?.role === "patient";
  const pacienteId = user?.pacienteId;

  const clases = await getClasesPilates();
  const proximas = clases.filter(c => c.estado === "activa");

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: DARK, minHeight: "100vh", backgroundColor: CREAM }}>

      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1rem" }}>M</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: DARK }}>Millennialfisio</span>
          </Link>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {isPatient ? (
              <Link href="/mi-cuenta" style={{ backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: "0.5rem", textDecoration: "none" }}>
                Mi cuenta
              </Link>
            ) : (
              <Link href="/acceso" style={{ backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: "0.5rem", textDecoration: "none" }}>
                Acceder / Registrarse
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ backgroundColor: "white", padding: "3rem 1.5rem 2.5rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", backgroundColor: "#EDE9FE", color: PURPLE, fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.35rem 1rem", borderRadius: 999, marginBottom: "1.25rem" }}>
            Clases de Pilates · Millennialfisio
          </span>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
            Pilates con Carmen en Campillos
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "#4b5563", lineHeight: 1.65, maxWidth: 520, margin: "0 auto" }}>
            Grupos reducidos. Clases dirigidas por Carmen, fisioterapeuta especializada. Apúntate online y cancela con antelación si no puedes asistir.
          </p>
          <div style={{ marginTop: "1.25rem", padding: "0.75rem 1.25rem", backgroundColor: "#FEF3C7", borderRadius: "0.75rem", display: "inline-block", fontSize: "0.875rem", color: "#92400E" }}>
            Política de cancelación: avisa con al menos <strong>8 horas</strong> de antelación o la clase se descuenta igualmente.
          </div>
        </div>
      </section>

      {/* Clases */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        {proximas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>No hay clases programadas</p>
            <p style={{ color: "#6b7280" }}>Vuelve pronto o contáctanos para más información.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {proximas.map(clase => (
              <ClaseCard key={clase.id} clase={clase} isPatient={isPatient} pacienteId={pacienteId} />
            ))}
          </div>
        )}

        {!isPatient && proximas.length > 0 && (
          <div style={{ marginTop: "2.5rem", padding: "2rem", backgroundColor: AQUA, borderRadius: "1.25rem", textAlign: "center" }}>
            <p style={{ color: "white", fontWeight: 700, fontSize: "1.0625rem", marginBottom: "1rem" }}>
              Regístrate para reservar tu plaza en segundos
            </p>
            <Link href="/acceso" style={{ display: "inline-block", backgroundColor: "white", color: AQUA, fontWeight: 800, fontSize: "0.9375rem", padding: "0.75rem 2rem", borderRadius: "0.625rem", textDecoration: "none" }}>
              Crear cuenta →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: DARK, color: "white", padding: "2rem 1.5rem", marginTop: "2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 700 }}>Millennialfisio · Campillos, Málaga</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Inicio</Link>
            <Link href="/#reservar" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Fisioterapia</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ClaseCard({ clase, isPatient, pacienteId }: { clase: ClasePilates; isPatient: boolean; pacienteId?: string }) {
  const plazasLibres = clase.capacidad - clase.inscritosCount;
  const completa = plazasLibres <= 0;
  const fechaObj = new Date(clase.fecha + "T12:00:00");

  return (
    <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #e5e7eb", borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: PURPLE, marginBottom: "0.375rem" }}>
            {fechaObj.toLocaleDateString("es-ES", { weekday: "long" })}
          </p>
          <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", marginBottom: "0.5rem", color: DARK }}>{clase.titulo}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#6b7280" }}>
              <Calendar size={14} />
              {fechaObj.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#6b7280" }}>
              <Clock size={14} />
              {clase.horaInicio} – {clase.horaFin}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: completa ? "#ef4444" : "#6b7280" }}>
              <Users size={14} />
              {completa ? "Completa" : `${plazasLibres} plazas libres`}
            </span>
          </div>
          {clase.notas && <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>{clase.notas}</p>}
        </div>

        <div style={{ flexShrink: 0 }}>
          {isPatient ? (
            completa ? (
              <span style={{ display: "inline-block", padding: "0.625rem 1.25rem", backgroundColor: "#f3f4f6", color: "#9ca3af", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                Completa
              </span>
            ) : (
              <Link
                href={`/mi-cuenta?inscribirse=${clase.id}`}
                style={{ display: "inline-block", backgroundColor: PURPLE, color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}
              >
                Reservar plaza →
              </Link>
            )
          ) : (
            <Link
              href="/acceso"
              style={{ display: "inline-block", backgroundColor: completa ? "#f3f4f6" : PURPLE, color: completa ? "#9ca3af" : "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}
            >
              {completa ? "Completa" : "Acceder para reservar →"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
