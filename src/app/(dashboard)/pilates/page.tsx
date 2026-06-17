"use client";

import { useState, useEffect, useCallback } from "react";
import { ClasePilates, InscripcionPilates } from "@/lib/types";
import { Users, Clock, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const AQUA = "#0891B2";
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";

interface NuevaClaseForm {
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  notas: string;
}

interface ClaseConInscritos extends ClasePilates {
  inscritos?: InscripcionPilates[];
}

export default function PilatesPage() {
  const [clases, setClases] = useState<ClaseConInscritos[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [form, setForm] = useState<NuevaClaseForm>({
    titulo: "Pilates",
    fecha: "",
    horaInicio: "10:00",
    horaFin: "11:00",
    capacidad: 8,
    notas: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const fetchClases = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/clases");
    const data = await res.json();
    setClases(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClases(); }, [fetchClases]);

  async function loadInscritos(claseId: string) {
    if (expandedId === claseId) { setExpandedId(null); return; }
    const res = await fetch(`/api/clases/${claseId}`);
    const data = await res.json();
    setClases(prev => prev.map(c => c.id === claseId ? { ...c, inscritos: data.inscritos ?? [] } : c));
    setExpandedId(claseId);
  }

  async function saveClase() {
    if (!form.fecha || !form.horaInicio || !form.horaFin) return;
    setSaving(true);
    setErrorForm("");
    const res = await fetch("/api/clases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      await fetchClases();
      setShowForm(false);
      setForm({ titulo: "Pilates", fecha: "", horaInicio: "10:00", horaFin: "11:00", capacidad: 8, notas: "" });
    } else {
      const d = await res.json().catch(() => ({}));
      setErrorForm(d.error ?? "Error al crear la clase. Inténtalo de nuevo.");
    }
  }

  async function cancelarClase(id: string) {
    if (!confirm("¿Cancelar esta clase? Los inscritos perderán su plaza.")) return;
    await fetch(`/api/clases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "cancelada" }),
    });
    setClases(prev => prev.map(c => c.id === id ? { ...c, estado: "cancelada" } : c));
  }

  async function eliminarClase(id: string) {
    if (!confirm("¿Eliminar esta clase definitivamente?")) return;
    await fetch(`/api/clases/${id}`, { method: "DELETE" });
    setClases(prev => prev.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  const proximas = clases.filter(c => c.fecha >= today && c.estado === "activa");
  const pasadas = clases.filter(c => c.fecha < today || c.estado === "cancelada");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Modal nueva clase */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-base mb-4" style={{ color: "#1a1a1a" }}>Nueva clase de pilates</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Título *</label>
                <input className="input-field" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Pilates suelo · Nivel inicial" />
              </div>
              <div>
                <label className="label">Fecha *</label>
                <input className="input-field" type="date" min={today} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Hora inicio *</label>
                  <input className="input-field" type="time" value={form.horaInicio} onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Hora fin *</label>
                  <input className="input-field" type="time" value={form.horaFin} onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Plazas máximas</label>
                <input className="input-field" type="number" min={1} max={30} value={form.capacidad} onChange={e => setForm(f => ({ ...f, capacidad: parseInt(e.target.value) }))} />
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea className="textarea-field" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Notas adicionales..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                className="flex-1 font-semibold text-sm px-4 py-2.5 rounded-xl text-white transition-colors"
                style={{ backgroundColor: PURPLE }}
                onClick={saveClase}
                disabled={saving || !form.fecha}
              >
                {saving ? "Guardando..." : "Crear clase"}
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
            {errorForm && (
              <p className="text-sm mt-2" style={{ color: "#dc2626" }}>⚠ {errorForm}</p>
            )}
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Pilates</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>{proximas.length} clases próximas</p>
        </div>
        <button
          className="flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl text-white"
          style={{ backgroundColor: PURPLE }}
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} /> Nueva clase
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: PURPLE, borderTopColor: "transparent" }} />
        </div>
      ) : (
        <>
          {/* Próximas clases */}
          {proximas.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="font-medium mb-1" style={{ color: "#1a1a1a" }}>No hay clases programadas</p>
              <p className="text-sm" style={{ color: "#9ca3af" }}>Crea la primera clase con el botón superior</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {proximas.map(clase => (
                <ClaseCard
                  key={clase.id}
                  clase={clase}
                  expanded={expandedId === clase.id}
                  onToggle={() => loadInscritos(clase.id)}
                  onCancelar={() => cancelarClase(clase.id)}
                  onEliminar={() => eliminarClase(clase.id)}
                />
              ))}
            </div>
          )}

          {/* Pasadas / canceladas */}
          {pasadas.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "#9ca3af" }}>Anteriores y canceladas</h2>
              <div className="space-y-2">
                {pasadas.map(clase => (
                  <div key={clase.id} className="card p-3 flex items-center gap-3 opacity-60">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#374151" }}>{clase.titulo}</p>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        {new Date(clase.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                        {" · "}{clase.horaInicio}
                        {clase.estado === "cancelada" && <span style={{ color: "#ef4444" }}> · Cancelada</span>}
                      </p>
                    </div>
                    <span className="text-xs" style={{ color: "#9ca3af" }}>{clase.inscritosCount}/{clase.capacidad}</span>
                    <button onClick={() => eliminarClase(clase.id)} style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ClaseCard({ clase, expanded, onToggle, onCancelar, onEliminar }: {
  clase: ClaseConInscritos;
  expanded: boolean;
  onToggle: () => void;
  onCancelar: () => void;
  onEliminar: () => void;
}) {
  const plazasLibres = clase.capacidad - clase.inscritosCount;
  const porcentaje = (clase.inscritosCount / clase.capacidad) * 100;

  return (
    <div className="card overflow-hidden" style={{ borderLeft: `3px solid ${PURPLE}` }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-sm" style={{ color: "#1a1a1a" }}>{clase.titulo}</p>
            </div>
            <p className="text-xs mb-2" style={{ color: "#6b7280" }}>
              {new Date(clase.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              {" · "}
              <Clock size={11} style={{ display: "inline", marginBottom: 1 }} /> {clase.horaInicio} – {clase.horaFin}
            </p>
            {/* Barra de ocupación */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "#e5e7eb" }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${porcentaje}%`, backgroundColor: porcentaje >= 100 ? "#ef4444" : PURPLE }} />
              </div>
              <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#6b7280" }}>
                <Users size={11} /> {clase.inscritosCount}/{clase.capacidad}
                {plazasLibres === 0 && <span style={{ color: "#ef4444" }}> · Completa</span>}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onToggle}
              className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
              style={{ backgroundColor: "#EDE9FE", color: PURPLE, border: "none", cursor: "pointer" }}
            >
              Inscritos {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button onClick={onCancelar} className="text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "none", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={onEliminar} style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer" }}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
          {!clase.inscritos || clase.inscritos.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "#9ca3af" }}>Sin inscritos todavía</p>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
              {clase.inscritos.map(i => (
                <div key={i.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: i.estado === "penalizada" ? "#ef4444" : PURPLE }}>
                    {(i.pacienteNombre ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#1a1a1a" }}>{i.pacienteNombre}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{i.pacienteEmail}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{
                    backgroundColor: i.estado === "inscrita" ? PURPLE_LIGHT : i.estado === "penalizada" ? "#fef2f2" : "#f3f4f6",
                    color: i.estado === "inscrita" ? PURPLE : i.estado === "penalizada" ? "#ef4444" : "#9ca3af",
                  }}>
                    {i.estado === "inscrita" ? "Inscrita" : i.estado === "penalizada" ? "Penalizada" : "Cancelada"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
