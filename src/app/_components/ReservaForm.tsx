"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";

export default function ReservaForm() {
  const [form, setForm] = useState({
    nombre: "", telefono: "", email: "", motivo: "", fecha: "", franja: "indistinto",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.telefono.trim()) {
      setError("Por favor, rellena nombre y teléfono.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Ha habido un problema. Llámanos directamente o inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <CheckCircle2 size={52} color="#0891B2" strokeWidth={1.5} />
        </div>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.75rem" }}>
          ¡Solicitud recibida!
        </h3>
        <p style={{ color: "#6b7280", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          Carmen te llamará en menos de 2 horas para confirmar tu cita. Revisa también tu teléfono por si llega un mensaje.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              style={inputStyle}
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Teléfono *</label>
            <input
              style={inputStyle}
              type="tel"
              placeholder="600 000 000"
              value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opcional)</span></label>
          <input
            style={inputStyle}
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div>
          <label style={labelStyle}>¿Qué te ocurre? <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opcional)</span></label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            placeholder="Cuéntanos brevemente tu problema o zona de dolor..."
            value={form.motivo}
            onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Fecha preferida <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opcional)</span></label>
            <input
              style={inputStyle}
              type="date"
              min={minDate}
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Franja horaria</label>
            <select
              style={inputStyle}
              value={form.franja}
              onChange={e => setForm(f => ({ ...f, franja: e.target.value }))}
            >
              <option value="indistinto">Indistinto</option>
              <option value="manana">Mañana (9h–14h)</option>
              <option value="tarde">Tarde (15h–20h)</option>
            </select>
          </div>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.875rem", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: sending ? "#9ca3af" : AQUA,
            color: "white",
            fontWeight: 700,
            fontSize: "1.0625rem",
            border: "none",
            borderRadius: "0.625rem",
            cursor: sending ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
            letterSpacing: "0.01em",
          }}
          onMouseOver={e => { if (!sending) (e.target as HTMLButtonElement).style.backgroundColor = AQUA_DARK; }}
          onMouseOut={e => { if (!sending) (e.target as HTMLButtonElement).style.backgroundColor = AQUA; }}
        >
          {sending ? "Enviando..." : "Solicitar cita ahora →"}
        </button>

        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "0.25rem" }}>
          Sin compromiso. Sin listas de espera. Confirmación en menos de 2 horas.
        </p>
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.375rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: "1.5px solid #DDD8CE",
  borderRadius: "0.5rem",
  fontSize: "0.9375rem",
  outline: "none",
  backgroundColor: "white",
  boxSizing: "border-box",
};
