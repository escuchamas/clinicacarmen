"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Calendar, Clock, User, CreditCard, MessageCircle, Lock } from "lucide-react";

const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";
const CREAM = "#F2EDE3";
const DARK = "#111827";
const WA_NUM = "34608622236";
const WA_URL = `https://wa.me/${WA_NUM}?text=${encodeURIComponent("Hola Carmen, me gustaría pedir cita. Soy nuevo paciente y me gustaría información sobre la primera visita.")}`;

type Step = "identificar" | "gestionar" | "cuestionario" | "fecha" | "hora" | "confirmar" | "exito" | "cancelada";

interface Cuestionario {
  nombre: string;
  apellidos: string;
  email: string;
  motivo: string;
  dolorActual: "Sí" | "No" | "";
  dolorDesde: string;
  fisioPrevia: "Sí" | "No" | "";
  otrasNotas: string;
}

interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
}

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function PedirCitaPage() {
  const [step, setStep] = useState<Step>("identificar");
  const [dniInput, setDniInput] = useState("");
  const [telInput, setTelInput] = useState("");
  const [loadingId, setLoadingId] = useState(false);
  const [errorId, setErrorId] = useState("");
  const [errorDni, setErrorDni] = useState("");
  const [errorTel, setErrorTel] = useState("");
  const [paciente, setPaciente] = useState<Paciente | null>(null);

  const hoy = new Date();
  const [calYear, setCalYear] = useState(hoy.getFullYear());
  const [calMonth, setCalMonth] = useState(hoy.getMonth());
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");

  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState("");
  const [citaExistente, setCitaExistente] = useState<{ citaId: string; fecha: string; hora: string } | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState("");

  const [esPrimeraVisita, setEsPrimeraVisita] = useState(false);
  const [cuestionario, setCuestionario] = useState<Cuestionario>({ nombre: "", apellidos: "", email: "", motivo: "", dolorActual: "", dolorDesde: "", fisioPrevia: "", otrasNotas: "" });
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  function validarDocumento(val: string): string {
    const v = val.trim().toUpperCase().replace(/\s/g, "");
    if (!v) return "El documento es obligatorio";
    // DNI: 8 dígitos + letra
    if (/^[0-9]{8}[A-Z]$/.test(v)) return "";
    // NIE: X/Y/Z + 7 dígitos + letra
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(v)) return "";
    // NIF empresa: letra + 7 dígitos + letra/dígito
    if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[A-Z0-9]$/.test(v)) return "";
    // Pasaporte u otro doc extranjero: 6-20 alfanumérico
    if (/^[A-Z0-9]{6,20}$/.test(v)) return "";
    return "Formato no válido — Ej: 12345678A · X1234567A";
  }

  function validarTelefono(val: string): string {
    // Quitar espacios, guiones, puntos, paréntesis
    const v = val.trim().replace(/[\s\-\.\(\)]/g, "");
    if (!v) return "El teléfono es obligatorio";
    // + opcional seguido de 6-15 dígitos (cubre España sin/con +34, internacionales)
    if (/^\+?\d{6,15}$/.test(v)) return "";
    return "Teléfono no válido — Ej: 600 000 000 · +34 600 000 000";
  }

  async function handleIdentificar(e: React.FormEvent) {
    e.preventDefault();
    const eDni = validarDocumento(dniInput);
    const eTel = validarTelefono(telInput);
    setErrorDni(eDni);
    setErrorTel(eTel);
    if (eDni || eTel) return;
    setErrorId("");
    setLoadingId(true);
    const res = await fetch("/api/reservar/identificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: dniInput.trim(), telefono: telInput.trim() }),
    });
    const data = await res.json();
    setLoadingId(false);
    if (!res.ok) {
      if (res.status === 404) {
        setEsPrimeraVisita(true);
        setErrorId("primera_visita");
      } else {
        setErrorId(data.error);
      }
      return;
    }
    setPaciente(data);
    if (data.citaActiva) {
      setCitaExistente(data.citaActiva);
      setStep("gestionar");
    } else {
      setStep("fecha");
    }
  }

  async function handleSelectFecha(dia: number) {
    const fecha = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    setFechaSeleccionada(fecha);
    setHoraSeleccionada("");
    setLoadingSlots(true);
    setStep("hora");
    const res = await fetch(`/api/reservar/disponibilidad?fecha=${fecha}`);
    const data = await res.json();
    setSlots(data.disponibles ?? []);
    setLoadingSlots(false);
  }

  async function handleConfirmar() {
    if (!paciente || !fechaSeleccionada || !horaSeleccionada) return;
    setConfirmando(true);
    setErrorConfirmar("");
    const res = await fetch("/api/reservar/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pacienteId: paciente.id,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        duracion: 60,
        motivo: motivo.trim() || "Reserva online",
        notas: "Reserva online — pago pendiente de confirmar",
      }),
    });
    setConfirmando(false);
    if (!res.ok) {
      const data = await res.json();
      if (data.error === "ya_tiene_cita") {
        setCitaExistente({ citaId: data.citaId, fecha: data.fecha, hora: data.hora });
        return;
      }
      setErrorConfirmar(data.error ?? "Error al confirmar la cita. Inténtalo de nuevo.");
      return;
    }
    setStep("exito");
  }

  async function handleCancelarCita(rebooked: boolean) {
    if (!paciente || !citaExistente) return;
    setCancelando(true);
    setErrorCancelar("");
    const res = await fetch("/api/reservar/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacienteId: paciente.id, citaId: citaExistente.citaId }),
    });
    setCancelando(false);
    if (!res.ok) {
      const data = await res.json();
      setErrorCancelar(data.error === "menos_24h"
        ? "No se puede modificar con menos de 24 horas de antelación."
        : (data.error ?? "Error al cancelar. Inténtalo de nuevo."));
      return;
    }
    setCitaExistente(null);
    if (rebooked) {
      setFechaSeleccionada("");
      setHoraSeleccionada("");
      setStep("fecha");
    } else {
      setStep("cancelada");
    }
  }

  async function handleConfirmarPrimeraVisita() {
    if (!fechaSeleccionada || !horaSeleccionada) return;
    setEnviando(true);
    setErrorEnvio("");
    const res = await fetch("/api/reservar/primera-visita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: dniInput.trim(),
        telefono: telInput.trim(),
        nombre: cuestionario.nombre.trim(),
        apellidos: cuestionario.apellidos.trim(),
        email: cuestionario.email.trim() || null,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        cuestionario,
      }),
    });
    setEnviando(false);
    if (!res.ok) {
      const data = await res.json();
      setErrorEnvio(data.error ?? "Error al enviar la solicitud. Inténtalo de nuevo.");
      return;
    }
    setStep("exito");
  }

  const horasHastaCita = citaExistente
    ? (new Date(`${citaExistente.fecha}T${citaExistente.hora}`).getTime() - Date.now()) / (1000 * 60 * 60)
    : null;
  const puedeAutogestionar = horasHastaCita !== null && horasHastaCita >= 24;

  const cells = buildCalendar(calYear, calMonth);
  const todayStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  const maxDate = new Date(hoy); maxDate.setDate(hoy.getDate() + 60);

  function isFechaDisponible(dia: number) {
    const d = new Date(calYear, calMonth, dia);
    const str = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return d >= hoy && d <= maxDate && str >= todayStr;
  }

  const fechaLabel = fechaSeleccionada
    ? new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    : "";

  const stepNum = step === "identificar" ? 1 : step === "fecha" ? 2 : step === "hora" ? 3 : step === "confirmar" ? 4 : 4;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: DARK, minHeight: "100vh", backgroundColor: CREAM }}>

      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>M</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: DARK }}>Millennialfisio</span>
          </Link>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#16a34a", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Progreso */}
        {step !== "exito" && step !== "gestionar" && step !== "cancelada" && step !== "cuestionario" && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {(esPrimeraVisita ? [1, 2, 3, 4] : [1, 2, 3, 4]).map(n => (
                <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: n <= stepNum ? (esPrimeraVisita ? "#16a34a" : AQUA) : "#e5e7eb", transition: "background 0.3s" }} />
              ))}
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
              Paso {stepNum} de 4 · {esPrimeraVisita
                ? ["Identificación", "Elige fecha", "Elige hora", "Confirmar solicitud"][stepNum - 1]
                : ["Identificación", "Elige fecha", "Elige hora", "Confirmar y pagar"][stepNum - 1]}
            </p>
          </div>
        )}

        {/* ── PASO 1: IDENTIFICACIÓN ─────────────────────── */}
        {step === "identificar" && (
          <div>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Pedir cita online</h1>
            <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
              Usa los datos con los que estás registrado en la clínica.{" "}
              <span style={{ color: "#9ca3af" }}>Para menores de edad, introduce el DNI del paciente y el teléfono del tutor.</span>
            </p>

            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: "1.5rem" }}>
              <form onSubmit={handleIdentificar} style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={labelSt}>DNI / NIE del paciente</label>
                  <input
                    style={{ ...inputSt, ...(errorDni ? { borderColor: "#ef4444", backgroundColor: "#fef2f2" } : {}) }}
                    placeholder="12345678A"
                    value={dniInput}
                    onChange={e => { setDniInput(e.target.value); if (errorDni) setErrorDni(""); }}
                    onBlur={() => setErrorDni(validarDocumento(dniInput))}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  {errorDni
                    ? <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.3rem", fontWeight: 500 }}>⚠ {errorDni}</p>
                    : <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>DNI, NIE, pasaporte u otro documento. En caso de menor, el del niño o niña.</p>
                  }
                </div>
                <div>
                  <label style={labelSt}>Teléfono de contacto</label>
                  <input
                    style={{ ...inputSt, ...(errorTel ? { borderColor: "#ef4444", backgroundColor: "#fef2f2" } : {}) }}
                    placeholder="600 000 000"
                    type="tel"
                    value={telInput}
                    onChange={e => { setTelInput(e.target.value); if (errorTel) setErrorTel(""); }}
                    onBlur={() => setErrorTel(validarTelefono(telInput))}
                  />
                  {errorTel
                    ? <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.3rem", fontWeight: 500 }}>⚠ {errorTel}</p>
                    : <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>Puedes incluir el prefijo del país: +34, +44… Habitualmente el del tutor para menores.</p>
                  }
                </div>
                {errorId && errorId !== "primera_visita" && (
                  <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "0.625rem", padding: "0.875rem", fontSize: "0.875rem", color: "#991b1b" }}>
                    {errorId}
                  </div>
                )}
                {errorId === "primera_visita" && (
                  <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "0.75rem", padding: "1.125rem" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#15803d", marginBottom: "0.25rem" }}>¿Primera vez en la clínica?</p>
                    <p style={{ fontSize: "0.8125rem", color: "#166534", marginBottom: "1rem", lineHeight: 1.5 }}>
                      No encontramos tu DNI. Si es tu primera visita, rellena un breve cuestionario y Carmen te confirmará la cita.
                    </p>
                    <button type="button" onClick={() => setStep("cuestionario")}
                      style={{ width: "100%", padding: "0.75rem", backgroundColor: "#16a34a", color: "white", fontWeight: 700, fontSize: "0.9375rem", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
                      Solicitar primera visita →
                    </button>
                  </div>
                )}
                <button type="submit" disabled={loadingId} style={btnAqua(loadingId)}>
                  {loadingId ? "Buscando..." : "Continuar →"}
                </button>
              </form>
            </div>

            {/* Nota primera visita */}
            <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#9ca3af", lineHeight: 1.5 }}>
              ¿Primera vez? Introduce tu DNI igualmente — si no te encontramos, te guiamos para reservar tu primera cita.
            </p>
          </div>
        )}

        {/* ── CUESTIONARIO PRIMERA VISITA ───────────────── */}
        {step === "cuestionario" && (
          <div>
            <button onClick={() => { setStep("identificar"); setErrorId(""); setEsPrimeraVisita(false); }} style={backBtn}>
              <ChevronLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>Primera visita</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9375rem", marginBottom: "1.75rem", lineHeight: 1.5 }}>
              Cuéntanos un poco sobre ti para que Carmen pueda preparar tu consulta.
            </p>

            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "grid", gap: "1.125rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelSt}>Nombre *</label>
                  <input style={inputSt} value={cuestionario.nombre} onChange={e => setCuestionario(q => ({ ...q, nombre: e.target.value }))} placeholder="Nombre" />
                </div>
                <div>
                  <label style={labelSt}>Apellidos *</label>
                  <input style={inputSt} value={cuestionario.apellidos} onChange={e => setCuestionario(q => ({ ...q, apellidos: e.target.value }))} placeholder="Apellidos" />
                </div>
              </div>

              <div>
                <label style={labelSt}>Email <span style={{ fontWeight: 400, color: "#9ca3af" }}>(opcional)</span></label>
                <input style={inputSt} type="email" value={cuestionario.email} onChange={e => setCuestionario(q => ({ ...q, email: e.target.value }))} placeholder="correo@ejemplo.com" />
              </div>

              <div>
                <label style={labelSt}>¿Cuál es el motivo de tu consulta? *</label>
                <textarea style={{ ...inputSt, resize: "vertical", minHeight: "4.5rem" }} value={cuestionario.motivo} onChange={e => setCuestionario(q => ({ ...q, motivo: e.target.value }))} placeholder="Ej: dolor lumbar, cervicales, lesión de rodilla..." />
              </div>

              <div>
                <label style={labelSt}>¿Tienes dolor actualmente?</label>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {(["Sí", "No"] as const).map(op => (
                    <button key={op} type="button" onClick={() => setCuestionario(q => ({ ...q, dolorActual: op, dolorDesde: op === "No" ? "" : q.dolorDesde }))}
                      style={{ flex: 1, padding: "0.625rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.9375rem", border: `2px solid ${cuestionario.dolorActual === op ? AQUA : "#e5e7eb"}`, backgroundColor: cuestionario.dolorActual === op ? AQUA : "white", color: cuestionario.dolorActual === op ? "white" : DARK, cursor: "pointer" }}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {cuestionario.dolorActual === "Sí" && (
                <div>
                  <label style={labelSt}>¿Desde cuándo aproximadamente?</label>
                  <select style={inputSt} value={cuestionario.dolorDesde} onChange={e => setCuestionario(q => ({ ...q, dolorDesde: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    <option value="Menos de 1 semana">Menos de 1 semana</option>
                    <option value="1–4 semanas">1–4 semanas</option>
                    <option value="1–3 meses">1–3 meses</option>
                    <option value="Más de 3 meses">Más de 3 meses</option>
                    <option value="Más de 1 año">Más de 1 año</option>
                  </select>
                </div>
              )}

              <div>
                <label style={labelSt}>¿Has recibido fisioterapia anteriormente?</label>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {(["Sí", "No"] as const).map(op => (
                    <button key={op} type="button" onClick={() => setCuestionario(q => ({ ...q, fisioPrevia: op }))}
                      style={{ flex: 1, padding: "0.625rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.9375rem", border: `2px solid ${cuestionario.fisioPrevia === op ? AQUA : "#e5e7eb"}`, backgroundColor: cuestionario.fisioPrevia === op ? AQUA : "white", color: cuestionario.fisioPrevia === op ? "white" : DARK, cursor: "pointer" }}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelSt}>¿Algo más que quieras contarnos? <span style={{ fontWeight: 400, color: "#9ca3af" }}>(opcional)</span></label>
                <textarea style={{ ...inputSt, resize: "vertical", minHeight: "3.5rem" }} value={cuestionario.otrasNotas} onChange={e => setCuestionario(q => ({ ...q, otrasNotas: e.target.value }))} placeholder="Operaciones, alergias, medicación relevante..." />
              </div>
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <button onClick={() => {
                if (!cuestionario.nombre || !cuestionario.apellidos || !cuestionario.motivo) return;
                setStep("fecha");
              }}
                disabled={!cuestionario.nombre || !cuestionario.apellidos || !cuestionario.motivo}
                style={btnAqua(!cuestionario.nombre || !cuestionario.apellidos || !cuestionario.motivo)}>
                Elegir fecha y hora →
              </button>
            </div>
          </div>
        )}

        {/* ── GESTIONAR CITA EXISTENTE ──────────────────── */}
        {step === "gestionar" && citaExistente && (
          <div>
            <button onClick={() => { setStep("identificar"); setCitaExistente(null); }} style={backBtn}>
              <ChevronLeft size={16} /> Volver
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
              <User size={20} color={AQUA} />
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>{paciente?.nombre} {paciente?.apellidos}</span>
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1.75rem" }}>Tu próxima cita</h2>

            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.5rem" }}>
                <ResumenItem icon={<Calendar size={15} color={AQUA} />} label="Fecha"
                  value={new Date(citaExistente.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
                <ResumenItem icon={<Clock size={15} color={AQUA} />} label="Hora"
                  value={`${citaExistente.hora} — ${horaFin(citaExistente.hora)}`} />
              </div>

              {puedeAutogestionar ? (
                <>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                    Puedes cambiar la fecha o cancelarla desde aquí.
                  </p>
                  {errorCancelar && (
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.8125rem", color: "#991b1b", marginBottom: "1rem" }}>
                      {errorCancelar}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: "0.625rem" }}>
                    <button onClick={() => handleCancelarCita(true)} disabled={cancelando} style={btnAqua(cancelando)}>
                      {cancelando ? "Un momento..." : "Cambiar fecha y hora →"}
                    </button>
                    <button onClick={() => handleCancelarCita(false)} disabled={cancelando}
                      style={{ width: "100%", padding: "0.875rem", backgroundColor: "white", color: "#dc2626", fontWeight: 700, fontSize: "0.9375rem", border: "1.5px solid #fca5a5", borderRadius: "0.625rem", cursor: cancelando ? "not-allowed" : "pointer", opacity: cancelando ? 0.6 : 1 }}>
                      Cancelar cita
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a", borderRadius: "0.625rem", padding: "0.875rem", fontSize: "0.875rem", color: "#92400e", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                    Tu cita es en menos de 24 horas. Para modificarla, escríbele a Carmen directamente.
                  </div>
                  <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent("Hola Carmen, necesito modificar mi cita de mañana.")}`}
                    target="_blank" rel="noopener noreferrer" style={{ ...btnAqua(false), display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textDecoration: "none", backgroundColor: "#16a34a" }}>
                    <MessageCircle size={18} /> Escribir a Carmen
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PASO 2: FECHA ─────────────────────────────── */}
        {step === "fecha" && (
          <div>
            <button onClick={() => setStep("identificar")} style={backBtn}>
              <ChevronLeft size={16} /> Volver
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
              <User size={20} color={AQUA} />
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>{paciente?.nombre} {paciente?.apellidos}</span>
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1.75rem" }}>Elige una fecha</h2>

            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              {/* Nav mes */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <button
                  onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  disabled={calYear === hoy.getFullYear() && calMonth === hoy.getMonth()}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0.375rem", borderRadius: "0.375rem", color: "#6b7280", opacity: (calYear === hoy.getFullYear() && calMonth === hoy.getMonth()) ? 0.3 : 1 }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontWeight: 800, fontSize: "0.9375rem" }}>{MESES[calMonth]} {calYear}</span>
                <button
                  onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0.375rem", borderRadius: "0.375rem", color: "#6b7280", transform: "rotate(180deg)" }}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* Días semana */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.5rem" }}>
                {DIAS.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", padding: "0.375rem 0" }}>{d}</div>
                ))}
              </div>

              {/* Días */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
                {cells.map((dia, i) => {
                  if (!dia) return <div key={i} />;
                  const disponible = isFechaDisponible(dia);
                  const str = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                  const esHoy = str === todayStr;
                  const seleccionado = str === fechaSeleccionada;
                  return (
                    <button key={i} onClick={() => disponible && handleSelectFecha(dia)} disabled={!disponible}
                      style={{
                        aspectRatio: "1", borderRadius: "0.5rem", border: seleccionado ? `2px solid ${AQUA}` : esHoy ? `2px solid ${AQUA}40` : "2px solid transparent",
                        backgroundColor: seleccionado ? AQUA : disponible ? "white" : "transparent",
                        color: seleccionado ? "white" : disponible ? DARK : "#d1d5db",
                        fontWeight: esHoy ? 800 : 500, fontSize: "0.875rem",
                        cursor: disponible ? "pointer" : "default",
                        transition: "all 0.15s",
                      }}>
                      {dia}
                    </button>
                  );
                })}
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#9ca3af", marginTop: "1rem" }}>Disponibilidad para los próximos 60 días · Lunes a domingo 9:00–18:00</p>
          </div>
        )}

        {/* ── PASO 3: HORA ──────────────────────────────── */}
        {step === "hora" && (
          <div>
            <button onClick={() => setStep("fecha")} style={backBtn}>
              <ChevronLeft size={16} /> Volver
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
              <Calendar size={16} color={AQUA} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", textTransform: "capitalize" }}>{fechaLabel}</span>
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1.75rem" }}>Elige una hora</h2>

            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              {loadingSlots ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${AQUA}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                </div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ fontWeight: 700, marginBottom: "0.375rem" }}>Sin huecos disponibles</p>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Prueba con otro día.</p>
                  <button onClick={() => setStep("fecha")} style={{ ...btnAqua(false), marginTop: "1.25rem", display: "inline-block", width: "auto", padding: "0.625rem 1.5rem" }}>
                    Elegir otra fecha
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.625rem", marginBottom: "1.5rem" }}>
                    {slots.map(slot => (
                      <button key={slot} onClick={() => setHoraSeleccionada(slot)}
                        style={{
                          padding: "0.75rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.9375rem",
                          border: `2px solid ${horaSeleccionada === slot ? AQUA : "#e5e7eb"}`,
                          backgroundColor: horaSeleccionada === slot ? AQUA : "white",
                          color: horaSeleccionada === slot ? "white" : DARK,
                          cursor: "pointer", transition: "all 0.15s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                        }}>
                        <Clock size={14} strokeWidth={2} />{slot}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => horaSeleccionada && setStep("confirmar")} disabled={!horaSeleccionada}
                    style={btnAqua(!horaSeleccionada)}>
                    Continuar →
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PASO 4: CONFIRMAR Y PAGAR ─────────────────── */}
        {step === "confirmar" && (
          <div>
            <button onClick={() => setStep("hora")} style={backBtn}>
              <ChevronLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1.75rem" }}>
              {esPrimeraVisita ? "Confirmar solicitud" : "Confirmar y pagar"}
            </h2>

            {/* Resumen */}
            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #e5e7eb", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "1rem" }}>Resumen de la cita</p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <ResumenItem icon={<User size={15} color={AQUA} />} label="Paciente"
                  value={esPrimeraVisita ? `${cuestionario.nombre} ${cuestionario.apellidos}` : `${paciente?.nombre} ${paciente?.apellidos}`} />
                <ResumenItem icon={<Calendar size={15} color={AQUA} />} label="Fecha" value={fechaLabel} />
                <ResumenItem icon={<Clock size={15} color={AQUA} />} label="Hora"
                  value={`${horaSeleccionada} — ${horaFin(horaSeleccionada, esPrimeraVisita ? 30 : 60)}`} />
              </div>
              {!esPrimeraVisita && (
                <div style={{ borderTop: "1px solid #f3f4f6", marginTop: "1rem", paddingTop: "1rem" }}>
                  <label style={{ ...labelSt, marginBottom: "0.5rem" }}>Motivo de la cita (opcional)</label>
                  <input style={inputSt} placeholder="Ej: dolor de espalda, cervicales..." value={motivo} onChange={e => setMotivo(e.target.value)} />
                </div>
              )}
            </div>

            {esPrimeraVisita ? (
              /* Primera visita: no hay pago, mensaje de confirmación */
              <>
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "1.25rem", padding: "1.25rem", marginBottom: "1rem" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#15803d", marginBottom: "0.375rem" }}>Cita de evaluación — 30 min</p>
                  <p style={{ fontSize: "0.875rem", color: "#166534", lineHeight: 1.6 }}>
                    Carmen revisará tu cuestionario y te confirmará la cita por WhatsApp o teléfono en las próximas horas.
                  </p>
                </div>
                {errorEnvio && (
                  <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "0.625rem", padding: "0.875rem", fontSize: "0.875rem", color: "#991b1b", marginBottom: "1rem" }}>
                    {errorEnvio}
                  </div>
                )}
                <button onClick={handleConfirmarPrimeraVisita} disabled={enviando} style={btnAqua(enviando)}>
                  {enviando ? "Enviando..." : "Enviar solicitud →"}
                </button>
              </>
            ) : (
              /* Paciente existente: shell de pago */
              <>
                <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af" }}>Pago con tarjeta</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Lock size={12} color="#9ca3af" />
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600 }}>Powered by Stripe</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "0.875rem", opacity: 0.45, pointerEvents: "none" }}>
                    <div>
                      <label style={labelSt}>Número de tarjeta</label>
                      <div style={{ ...inputSt, display: "flex", alignItems: "center", gap: "0.5rem", color: "#9ca3af" }}>
                        <CreditCard size={16} />
                        <span>1234 5678 9012 3456</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div><label style={labelSt}>Caducidad</label><div style={{ ...inputSt, color: "#9ca3af" }}>MM / AA</div></div>
                      <div><label style={labelSt}>CVC</label><div style={{ ...inputSt, color: "#9ca3af" }}>···</div></div>
                    </div>
                  </div>
                  <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", backgroundColor: "#FEF3C7", borderRadius: "0.625rem", fontSize: "0.8125rem", color: "#92400E", display: "flex", gap: "0.5rem" }}>
                    <span>⚙️</span>
                    <span>El sistema de pago se activará próximamente. Tu cita quedará <strong>confirmada</strong> y el pago se realiza en consulta.</span>
                  </div>
                </div>

                <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 900, fontSize: "1.375rem", color: AQUA }}>45,00 €</span>
                  </div>
                  {errorConfirmar && (
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "0.625rem", padding: "0.875rem", fontSize: "0.875rem", color: "#991b1b", marginBottom: "1rem" }}>
                      {errorConfirmar}
                    </div>
                  )}
                  <button onClick={handleConfirmar} disabled={confirmando} style={btnAqua(confirmando)}>
                    {confirmando ? "Enviando..." : "Confirmar cita →"}
                  </button>
                  <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                    <Lock size={11} /> Conexión segura · Tus datos están protegidos
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ÉXITO ─────────────────────────────────────── */}
        {step === "exito" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <CheckCircle2 size={64} color={esPrimeraVisita ? "#16a34a" : AQUA} strokeWidth={1.5} style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "1.625rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {esPrimeraVisita ? "¡Solicitud enviada!" : "¡Cita confirmada!"}
            </h2>
            {esPrimeraVisita ? (
              <>
                <p style={{ color: "#4b5563", lineHeight: 1.65, marginBottom: "0.5rem" }}>
                  <strong>{cuestionario.nombre}</strong>, hemos recibido tu solicitud para el <strong style={{ textTransform: "capitalize" }}>{fechaLabel}</strong> a las <strong>{horaSeleccionada}</strong>.
                </p>
                <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
                  Carmen revisará tu cuestionario y te contactará en breve para confirmar la cita. Si tienes prisa, puedes escribirle directamente.
                </p>
              </>
            ) : (
              <>
                <p style={{ color: "#4b5563", lineHeight: 1.65, marginBottom: "0.5rem" }}>
                  <strong>{paciente?.nombre}</strong>, tu cita del <strong style={{ textTransform: "capitalize" }}>{fechaLabel}</strong> a las <strong>{horaSeleccionada}</strong> está <strong style={{ color: AQUA }}>confirmada</strong>.
                </p>
                <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
                  El pago se realizará en consulta. Si necesitas cancelar, hazlo con al menos 24 horas de antelación.
                </p>
              </>
            )}
            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#16a34a", color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.75rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                <MessageCircle size={18} /> Escribir a Carmen
              </a>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", backgroundColor: "white", color: DARK, fontWeight: 600, fontSize: "0.9375rem", padding: "0.75rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none", border: "1.5px solid #e5e7eb" }}>
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
        {/* ── CITA CANCELADA ────────────────────────────── */}
        {step === "cancelada" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <CheckCircle2 size={64} color="#6b7280" strokeWidth={1.5} style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "1.625rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>Cita cancelada</h2>
            <p style={{ color: "#4b5563", lineHeight: 1.65, marginBottom: "2.5rem" }}>
              Tu cita ha sido cancelada correctamente. Si quieres reservar una nueva, puedes hacerlo en cualquier momento.
            </p>
            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setCitaExistente(null); setFechaSeleccionada(""); setHoraSeleccionada(""); setStep("fecha"); }}
                style={{ ...btnAqua(false), width: "auto", padding: "0.75rem 1.75rem" }}>
                Reservar nueva cita
              </button>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", backgroundColor: "white", color: DARK, fontWeight: 600, fontSize: "0.9375rem", padding: "0.75rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none", border: "1.5px solid #e5e7eb" }}>
                Volver al inicio
              </Link>
            </div>
          </div>
        )}

      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ResumenItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: "0.9375rem", fontWeight: 600, textAlign: "right", textTransform: "capitalize" }}>{value}</span>
      </div>
    </div>
  );
}

function horaFin(hora: string, duracionMin = 60) {
  const [h, m] = hora.split(":").map(Number);
  const totalMin = h * 60 + m + duracionMin;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}

const labelSt: React.CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" };
const inputSt: React.CSSProperties = { width: "100%", padding: "0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.9375rem", outline: "none", backgroundColor: "white", boxSizing: "border-box" };
const btnAqua = (disabled: boolean): React.CSSProperties => ({ width: "100%", padding: "1rem", backgroundColor: disabled ? "#9ca3af" : AQUA, color: "white", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: "0.625rem", cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.15s" });
const backBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: "#6b7280", fontSize: "0.875rem", cursor: "pointer", marginBottom: "1.25rem", padding: 0, fontWeight: 500 };
