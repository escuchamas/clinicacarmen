"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, Users, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Suspense } from "react";

const AQUA = "#0891B2";
const CREAM = "#F2EDE3";
const PURPLE = "#7C3AED";
const DARK = "#111827";

interface ClaseConInscripcion {
  id: string;
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  inscritosCount: number;
  estado: string;
  notas: string;
  inscripcion?: { estado: string };
}

function MiCuentaContent() {
  const searchParams = useSearchParams();
  const inscribirseId = searchParams.get("inscribirse");

  const [clases, setClases] = useState<ClaseConInscripcion[]>([]);
  const [misInscripciones, setMisInscripciones] = useState<string[]>([]); // claseIds donde estoy inscrito
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error" | "warn"; texto: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [resClases, resMisClases] = await Promise.all([
      fetch("/api/clases"),
      fetch("/api/mi-cuenta/inscripciones"),
    ]);
    const [dataClases, dataMis] = await Promise.all([resClases.json(), resMisClases.json()]);
    setClases(Array.isArray(dataClases) ? dataClases : []);
    setMisInscripciones(Array.isArray(dataMis) ? dataMis.filter((i: { estado: string }) => i.estado === "inscrita").map((i: { claseId: string }) => i.claseId) : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-inscribir si viene de /clases?inscribirse=ID
  useEffect(() => {
    if (inscribirseId && !loading && !misInscripciones.includes(inscribirseId)) {
      handleInscribirse(inscribirseId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inscribirseId, loading]);

  async function handleInscribirse(claseId: string) {
    setActionLoading(claseId);
    setMensaje(null);
    const res = await fetch(`/api/clases/${claseId}/inscribirse`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMisInscripciones(prev => [...prev, claseId]);
      setMensaje({ tipo: "ok", texto: "¡Plaza reservada! Te esperamos en clase." });
    } else {
      setMensaje({ tipo: "error", texto: data.error ?? "Error al inscribirte." });
    }
    setActionLoading(null);
  }

  async function handleCancelar(claseId: string, horaInicio: string, fecha: string) {
    const claseDate = new Date(`${fecha}T${horaInicio}:00`);
    const horasRestantes = (claseDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const msg = horasRestantes < 8
      ? `Quedan menos de 8 horas para la clase. Si cancelas ahora, la clase se descontará igualmente (política de cancelación). ¿Continuar?`
      : `¿Cancelar tu plaza en esta clase?`;
    if (!confirm(msg)) return;

    setActionLoading(claseId);
    setMensaje(null);
    const res = await fetch(`/api/clases/${claseId}/inscribirse`, { method: "DELETE" });
    const data = await res.json();
    setMisInscripciones(prev => prev.filter(id => id !== claseId));
    if (data.penalizada) {
      setMensaje({ tipo: "warn", texto: "Cancelación registrada, pero la clase se ha descontado por no avisar con 8h de antelación." });
    } else {
      setMensaje({ tipo: "ok", texto: "Cancelación realizada correctamente." });
    }
    setActionLoading(null);
  }

  const proximas = clases.filter(c => c.fecha >= new Date().toISOString().split("T")[0] && c.estado === "activa");
  const misProximas = proximas.filter(c => misInscripciones.includes(c.id));
  const disponibles = proximas.filter(c => !misInscripciones.includes(c.id));

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: DARK, minHeight: "100vh", backgroundColor: CREAM }}>
      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>M</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: DARK }}>Millennialfisio</span>
          </Link>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/clases" style={{ color: AQUA, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>Ver todas las clases</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} style={{ color: "#6b7280", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Mi cuenta</h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Gestiona tus clases de pilates en Millennialfisio</p>

        {/* Mensaje feedback */}
        {mensaje && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 1.25rem", borderRadius: "0.75rem", marginBottom: "1.5rem",
            backgroundColor: mensaje.tipo === "ok" ? "#f0fdf4" : mensaje.tipo === "warn" ? "#fffbeb" : "#fef2f2",
            border: `1px solid ${mensaje.tipo === "ok" ? "#86efac" : mensaje.tipo === "warn" ? "#fcd34d" : "#fca5a5"}`,
            color: mensaje.tipo === "ok" ? "#166534" : mensaje.tipo === "warn" ? "#92400e" : "#991b1b",
          }}>
            {mensaje.tipo === "ok" ? <CheckCircle2 size={18} /> : mensaje.tipo === "warn" ? <AlertTriangle size={18} /> : <XCircle size={18} />}
            <span style={{ fontSize: "0.9375rem" }}>{mensaje.texto}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${PURPLE}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <>
            {/* Mis clases */}
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "1rem", color: DARK }}>Mis clases reservadas</h2>
              {misProximas.length === 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", border: "1px solid #e5e7eb", textAlign: "center" }}>
                  <p style={{ color: "#9ca3af" }}>No tienes clases reservadas. ¡Apúntate a alguna!</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {misProximas.map(clase => (
                    <div key={clase.id} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #e5e7eb", borderLeft: `4px solid ${PURPLE}`, display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{clase.titulo}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                            <Calendar size={12} />
                            {new Date(clase.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                            <Clock size={12} />
                            {clase.horaInicio} – {clase.horaFin}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <span style={{ backgroundColor: "#EDE9FE", color: PURPLE, fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: 999 }}>Inscrita</span>
                        <button
                          onClick={() => handleCancelar(clase.id, clase.horaInicio, clase.fecha)}
                          disabled={actionLoading === clase.id}
                          style={{ color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600, background: "none", border: "1px solid #fca5a5", borderRadius: "0.5rem", padding: "0.375rem 0.75rem", cursor: "pointer" }}
                        >
                          {actionLoading === clase.id ? "..." : "Cancelar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Clases disponibles */}
            <section>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "1rem", color: DARK }}>Clases disponibles</h2>
              {disponibles.length === 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", border: "1px solid #e5e7eb", textAlign: "center" }}>
                  <p style={{ color: "#9ca3af" }}>No hay más clases disponibles por el momento.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {disponibles.map(clase => {
                    const plazasLibres = clase.capacidad - clase.inscritosCount;
                    const completa = plazasLibres <= 0;
                    return (
                      <div key={clase.id} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <p style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{clase.titulo}</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                              <Calendar size={12} />
                              {new Date(clase.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                              <Clock size={12} />
                              {clase.horaInicio} – {clase.horaFin}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: completa ? "#ef4444" : "#6b7280" }}>
                              <Users size={12} />
                              {completa ? "Completa" : `${plazasLibres} plazas`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => !completa && handleInscribirse(clase.id)}
                          disabled={completa || actionLoading === clase.id}
                          style={{
                            backgroundColor: completa ? "#f3f4f6" : PURPLE,
                            color: completa ? "#9ca3af" : "white",
                            fontWeight: 700, fontSize: "0.875rem",
                            border: "none", borderRadius: "0.5rem",
                            padding: "0.625rem 1.25rem",
                            cursor: completa ? "not-allowed" : "pointer",
                          }}
                        >
                          {actionLoading === clase.id ? "..." : completa ? "Completa" : "Reservar plaza"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function MiCuentaPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Cargando...</div>}>
      <MiCuentaContent />
    </Suspense>
  );
}
