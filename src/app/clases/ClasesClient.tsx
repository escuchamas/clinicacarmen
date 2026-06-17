"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, X, CheckCircle2, MessageCircle } from "lucide-react";
import { ClasePilates } from "@/lib/types";

const AQUA = "#0891B2";
const CREAM = "#F2EDE3";
const PURPLE = "#7C3AED";
const DARK = "#111827";
const WA_URL = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, tengo una consulta sobre las clases de pilates.")}`;

interface ModalState {
  claseId: string;
  titulo: string;
  fecha: string;
  hora: string;
  accion: "inscribir" | "cancelar";
  horaInicio?: string;
}

export default function ClasesClient({ clases }: { clases: ClasePilates[] }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState<{ claseId: string; accion: "inscribir" | "cancelar"; penalizada?: boolean } | null>(null);

  function abrirModal(clase: ClasePilates, accion: "inscribir" | "cancelar") {
    setModal({
      claseId: clase.id,
      titulo: clase.titulo,
      fecha: new Date(clase.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
      hora: `${clase.horaInicio} – ${clase.horaFin}`,
      accion,
      horaInicio: clase.horaInicio,
    });
    setDni("");
    setTelefono("");
    setError("");
  }

  function cerrarModal() {
    setModal(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setError("");
    setLoading(true);

    const method = modal.accion === "inscribir" ? "POST" : "DELETE";
    const res = await fetch(`/api/clases/${modal.claseId}/inscribirse`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: dni.trim(), telefono: telefono.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Ha ocurrido un error."); return; }

    setExito({ claseId: modal.claseId, accion: modal.accion, penalizada: data.penalizada });
    cerrarModal();
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: DARK, minHeight: "100vh", backgroundColor: CREAM }}>

      {/* Modal de verificación */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: "1.0625rem", marginBottom: "0.25rem" }}>
                  {modal.accion === "inscribir" ? "Reservar plaza" : "Cancelar inscripción"}
                </p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", textTransform: "capitalize" }}>{modal.titulo} · {modal.fecha}</p>
              </div>
              <button onClick={cerrarModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              Introduce tu DNI y teléfono para verificar tu identidad.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
              <div>
                <label style={labelSt}>DNI / NIE</label>
                <input style={inputSt} placeholder="12345678A" value={dni} onChange={e => setDni(e.target.value)} required />
              </div>
              <div>
                <label style={labelSt}>Teléfono</label>
                <input style={inputSt} placeholder="600 000 000" value={telefono} onChange={e => setTelefono(e.target.value)} required />
              </div>
              {error && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.875rem", color: "#991b1b" }}>
                  {error}
                </div>
              )}
              {modal.accion === "cancelar" && (
                <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.8125rem", color: "#92400e" }}>
                  Si cancelas con menos de 8h de antelación, la clase se descontará igualmente.
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: "0.875rem", backgroundColor: loading ? "#9ca3af" : modal.accion === "cancelar" ? "#ef4444" : PURPLE, color: "white", fontWeight: 700, fontSize: "0.9375rem", border: "none", borderRadius: "0.625rem", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Verificando..." : modal.accion === "inscribir" ? "Confirmar reserva" : "Cancelar inscripción"}
                </button>
                <button type="button" onClick={cerrarModal}
                  style={{ padding: "0.875rem 1.25rem", backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 600, fontSize: "0.9375rem", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>
                  Volver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>M</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: DARK }}>Millennialfisio</span>
          </Link>
          <Link href="/mi-cuenta" style={{ color: PURPLE, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
            Mis clases →
          </Link>
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
          <p style={{ fontSize: "1.0625rem", color: "#4b5563", lineHeight: 1.65, maxWidth: 520, margin: "0 auto 1.25rem" }}>
            Grupos reducidos. Clases dirigidas por Carmen, fisioterapeuta especializada. Reserva tu plaza online con solo tu DNI y teléfono.
          </p>
          <div style={{ padding: "0.75rem 1.25rem", backgroundColor: "#FEF3C7", borderRadius: "0.75rem", display: "inline-block", fontSize: "0.875rem", color: "#92400E" }}>
            Política de cancelación: avisa con al menos <strong>8 horas</strong> de antelación o la clase se descuenta igualmente.
          </div>
        </div>
      </section>

      {/* Feedback tras acción */}
      {exito && (
        <div style={{ maxWidth: 800, margin: "1rem auto 0", padding: "0 1.5rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", borderRadius: "0.875rem",
            backgroundColor: exito.penalizada ? "#fffbeb" : "#f0fdf4",
            border: `1px solid ${exito.penalizada ? "#fcd34d" : "#86efac"}`,
            color: exito.penalizada ? "#92400e" : "#166534",
          }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
              {exito.accion === "inscribir"
                ? "¡Plaza reservada! Te esperamos en clase."
                : exito.penalizada
                  ? "Cancelación registrada. La clase se ha descontado por política de cancelación."
                  : "Inscripción cancelada correctamente."}
            </span>
            <button onClick={() => setExito(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6 }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Listado de clases */}
      <section style={{ padding: "2.5rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        {clases.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>No hay clases programadas</p>
            <p style={{ color: "#6b7280" }}>Vuelve pronto o contáctanos para más información.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {clases.map(clase => {
              const plazasLibres = clase.capacidad - clase.inscritosCount;
              const completa = plazasLibres <= 0;
              const fechaObj = new Date(clase.fecha + "T12:00:00");
              const inscrita = exito?.claseId === clase.id && exito.accion === "inscribir";
              const cancelada = exito?.claseId === clase.id && exito.accion === "cancelar";

              return (
                <div key={clase.id} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #e5e7eb", borderLeft: `4px solid ${PURPLE}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: PURPLE, marginBottom: "0.25rem" }}>
                        {fechaObj.toLocaleDateString("es-ES", { weekday: "long" })}
                      </p>
                      <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>{clase.titulo}</h3>
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

                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                      {inscrita ? (
                        <>
                          <span style={{ backgroundColor: "#EDE9FE", color: PURPLE, fontSize: "0.8125rem", fontWeight: 700, padding: "0.375rem 0.875rem", borderRadius: 999 }}>Inscrita ✓</span>
                          <button onClick={() => abrirModal(clase, "cancelar")}
                            style={{ fontSize: "0.8125rem", color: "#ef4444", background: "none", border: "1px solid #fca5a5", borderRadius: "0.5rem", padding: "0.375rem 0.75rem", cursor: "pointer" }}>
                            Cancelar
                          </button>
                        </>
                      ) : cancelada ? (
                        <span style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", fontSize: "0.8125rem", fontWeight: 600, padding: "0.375rem 0.875rem", borderRadius: 999 }}>Cancelada</span>
                      ) : completa ? (
                        <span style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", fontSize: "0.875rem", fontWeight: 600, padding: "0.625rem 1.25rem", borderRadius: "0.5rem" }}>Completa</span>
                      ) : (
                        <button onClick={() => abrirModal(clase, "inscribir")}
                          style={{ backgroundColor: PURPLE, color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}>
                          Reservar plaza →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "2.5rem", padding: "1.75rem", backgroundColor: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>¿Tienes alguna duda?</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Escríbele a Carmen directamente por WhatsApp.</p>
          </div>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#16a34a", color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.75rem 1.5rem", borderRadius: "0.625rem", textDecoration: "none", flexShrink: 0 }}>
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </section>

      <footer style={{ backgroundColor: DARK, color: "white", padding: "2rem 1.5rem", marginTop: "2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 700 }}>Millennialfisio · Campillos, Málaga</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Inicio</Link>
            <Link href="/mi-cuenta" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Mis clases</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const labelSt: React.CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" };
const inputSt: React.CSSProperties = { width: "100%", padding: "0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.9375rem", outline: "none", backgroundColor: "white", boxSizing: "border-box" };
