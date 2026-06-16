"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cita, EstadoCita, ESTADO_CITA_LABELS, ESTADO_CITA_COLORS } from "@/lib/types";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_SEMANA = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

interface NuevaCitaForm {
  pacienteId: string;
  fecha: string;
  hora: string;
  duracion: number;
  motivo: string;
  notas: string;
}

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pacientes, setPacientes] = useState<{ id: string; nombre: string; apellidos: string }[]>([]);
  const [form, setForm] = useState<NuevaCitaForm>({ pacienteId: "", fecha: "", hora: "10:00", duracion: 60, motivo: "", notas: "" });
  const [saving, setSaving] = useState(false);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/citas?year=${year}&month=${month}`);
    const data = await res.json();
    setCitas(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  useEffect(() => {
    fetch("/api/pacientes").then(r => r.json()).then(d => setPacientes(Array.isArray(d) ? d : []));
  }, []);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  function getDaysInMonth() {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const total = new Date(year, month, 0).getDate();
    const days: (number | null)[] = Array(offset).fill(null);
    for (let i = 1; i <= total; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function dateStr(day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function citasDelDia(day: number) {
    return citas.filter(c => c.fecha === dateStr(day));
  }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
  }

  function openForm(day: number) {
    setForm(f => ({ ...f, fecha: dateStr(day) }));
    setShowForm(true);
  }

  async function saveCita() {
    if (!form.pacienteId || !form.fecha || !form.hora) return;
    setSaving(true);
    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchCitas();
      setShowForm(false);
      setForm({ pacienteId: "", fecha: "", hora: "10:00", duracion: 60, motivo: "", notas: "" });
    }
    setSaving(false);
  }

  async function cambiarEstado(id: string, estado: EstadoCita) {
    await fetch("/api/citas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "estado", id, estado }),
    });
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
  }

  async function eliminarCita(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return;
    await fetch("/api/citas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setCitas(prev => prev.filter(c => c.id !== id));
    if (selectedDay) {
      const quedanCitas = citas.filter(c => c.id !== id && c.fecha === selectedDay);
      if (quedanCitas.length === 0) setSelectedDay(null);
    }
  }

  const days = getDaysInMonth();
  const citasDia = selectedDay ? citas.filter(c => c.fecha === selectedDay) : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Modal nueva cita */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-base mb-4" style={{ color: "#1a1a1a" }}>Nueva cita · {form.fecha}</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Paciente *</label>
                <select className="input-field" value={form.pacienteId} onChange={e => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
                  <option value="">Selecciona un paciente...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Hora *</label>
                  <input className="input-field" type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Duración (min)</label>
                  <select className="input-field" value={form.duracion} onChange={e => setForm(f => ({ ...f, duracion: parseInt(e.target.value) }))}>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Motivo</label>
                <input className="input-field" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Motivo de la cita..." />
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea className="textarea-field" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Notas adicionales..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-primary flex-1 justify-center" onClick={saveCita} disabled={saving || !form.pacienteId}>
                {saving ? "Guardando..." : "Guardar cita"}
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Calendario</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>{citas.length} citas este mes</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(f => ({ ...f, fecha: dateStr(today.getDate()) })); setShowForm(true); }}>
          + Nueva cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendario */}
        <div className="lg:col-span-2 card p-4">
          {/* Navegación mes */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="btn-ghost p-2">‹</button>
            <h2 className="font-bold text-base" style={{ color: "#1a1a1a" }}>
              {MESES[month - 1]} {year}
            </h2>
            <button onClick={nextMonth} className="btn-ghost p-2">›</button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-bold py-1" style={{ color: "#9ca3af" }}>{d}</div>
            ))}
          </div>

          {/* Grid de días */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0891B2", borderTopColor: "transparent" }} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i} />;
                const ds = dateStr(day);
                const citasHoy = citasDelDia(day);
                const selected = selectedDay === ds;
                const hoy = isToday(day);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(selected ? null : ds)}
                    className="rounded-lg p-1 min-h-[52px] flex flex-col items-center transition-all"
                    style={{
                      backgroundColor: selected ? "#0891B2" : hoy ? "#ECFEFF" : "transparent",
                      border: selected ? "2px solid #0891B2" : hoy ? "2px solid #f5b5a3" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span className="text-xs font-medium mb-1" style={{ color: selected ? "white" : hoy ? "#0891B2" : "#374151" }}>
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {citasHoy.slice(0, 3).map(c => (
                        <span
                          key={c.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: selected ? "white" : ESTADO_CITA_COLORS[c.estado] }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3" style={{ borderTop: "1px solid #DDD8CE" }}>
            {(Object.entries(ESTADO_CITA_COLORS) as [EstadoCita, string][]).map(([estado, color]) => (
              <div key={estado} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs" style={{ color: "#6b7280" }}>{ESTADO_CITA_LABELS[estado]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="card p-4">
          {selectedDay ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm" style={{ color: "#1a1a1a" }}>
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <button className="btn-ghost text-xs py-1 px-2" onClick={() => { setForm(f => ({ ...f, fecha: selectedDay })); setShowForm(true); }}>
                  + Añadir
                </button>
              </div>
              {citasDia.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "#9ca3af" }}>No hay citas este día</p>
              ) : (
                <div className="space-y-3">
                  {citasDia.map(cita => (
                    <CitaCard key={cita.id} cita={cita} onEstado={cambiarEstado} onDelete={eliminarCita} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>Selecciona un día</p>
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>para ver o añadir citas</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista citas del mes */}
      {citas.length > 0 && (
        <div className="card p-5 mt-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: "#1a1a1a" }}>Todas las citas de {MESES[month - 1]}</h3>
          <div className="space-y-2">
            {citas.map(cita => (
              <div key={cita.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ESTADO_CITA_COLORS[cita.estado] }} />
                <span className="text-sm font-medium w-20 flex-shrink-0" style={{ color: "#6b7280" }}>
                  {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} {cita.hora}
                </span>
                <Link href={`/pacientes/${cita.pacienteId}`} className="text-sm font-medium flex-1 truncate" style={{ color: "#0891B2", textDecoration: "none" }}>
                  {cita.pacienteNombre}
                </Link>
                <span className="text-xs flex-shrink-0" style={{ color: "#9ca3af" }}>{cita.motivo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CitaCard({ cita, onEstado, onDelete }: {
  cita: Cita;
  onEstado: (id: string, estado: EstadoCita) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: "#fafafa", border: "1px solid #DDD8CE" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "#1a1a1a" }}>
            <Link href={`/pacientes/${cita.pacienteId}`} style={{ color: "#0891B2", textDecoration: "none" }}>
              {cita.pacienteNombre}
            </Link>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
            {cita.hora} · {cita.duracion} min
          </p>
          {cita.motivo && <p className="text-xs mt-1 truncate" style={{ color: "#374151" }}>{cita.motivo}</p>}
        </div>
        <button onClick={() => onDelete(cita.id)} className="text-xs flex-shrink-0" style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer" }}>✕</button>
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {(["pendiente","confirmada","completada","cancelada"] as EstadoCita[]).map(e => (
          <button
            key={e}
            onClick={() => onEstado(cita.id, e)}
            className="text-xs px-2 py-0.5 rounded-full transition-all"
            style={{
              backgroundColor: cita.estado === e ? ESTADO_CITA_COLORS[e] : "#f3f4f6",
              color: cita.estado === e ? "white" : "#6b7280",
              border: "none",
              cursor: "pointer",
              fontWeight: cita.estado === e ? 600 : 400,
            }}
          >
            {ESTADO_CITA_LABELS[e]}
          </button>
        ))}
      </div>
    </div>
  );
}
