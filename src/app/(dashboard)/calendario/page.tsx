"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cita, EstadoCita, ESTADO_CITA_LABELS, ESTADO_CITA_COLORS, ClasePilates } from "@/lib/types";
import { AlertCircle } from "lucide-react";

const AQUA = "#0891B2";
const PURPLE = "#7C3AED";
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

type EventoDia = { tipo: "fisio"; cita: Cita } | { tipo: "pilates"; clase: ClasePilates };

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clases, setClases] = useState<ClasePilates[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pacientes, setPacientes] = useState<{ id: string; nombre: string; apellidos: string }[]>([]);
  const [form, setForm] = useState<NuevaCitaForm>({ pacienteId: "", fecha: "", hora: "10:00", duracion: 60, motivo: "", notas: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCitas, resClases] = await Promise.all([
        fetch(`/api/citas?year=${year}&month=${month}`),
        fetch(`/api/clases?year=${year}&month=${month}`),
      ]);
      const [dataCitas, dataClases] = await Promise.all([
        resCitas.ok ? resCitas.json() : [],
        resClases.ok ? resClases.json() : [],
      ]);
      setCitas(Array.isArray(dataCitas) ? dataCitas : []);
      setClases(Array.isArray(dataClases) ? dataClases : []);
    } catch (e) {
      console.error("Error cargando calendario:", e);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetch("/api/pacientes").then(r => r.json()).then(d => setPacientes(Array.isArray(d) ? d : []));
  }, []);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1);
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

  function eventosDelDia(day: number): EventoDia[] {
    const ds = dateStr(day);
    const ev: EventoDia[] = [];
    citas.filter(c => c.fecha === ds).forEach(c => ev.push({ tipo: "fisio", cita: c }));
    clases.filter(c => c.fecha === ds && c.estado === "activa").forEach(c => ev.push({ tipo: "pilates", clase: c }));
    return ev.sort((a, b) => {
      const horaA = a.tipo === "fisio" ? a.cita.hora : a.clase.horaInicio;
      const horaB = b.tipo === "fisio" ? b.cita.hora : b.clase.horaInicio;
      return horaA.localeCompare(horaB);
    });
  }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
  }

  function is24hWarning(cita: Cita): boolean {
    const citaDate = new Date(`${cita.fecha}T${cita.hora}:00`);
    const horasRestantes = (citaDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return horasRestantes < 24 && horasRestantes > 0 && cita.estado === "confirmada";
  }

  async function saveCita() {
    if (!form.pacienteId || !form.fecha || !form.hora) return;
    setSaving(true);
    const res = await fetch("/api/citas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { await fetchData(); setShowForm(false); setForm({ pacienteId: "", fecha: "", hora: "10:00", duracion: 60, motivo: "", notas: "" }); }
    setSaving(false);
  }

  async function cambiarEstado(id: string, estado: EstadoCita) {
    await fetch("/api/citas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "estado", id, estado }) });
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
  }

  async function eliminarCita(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return;
    await fetch("/api/citas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setCitas(prev => prev.filter(c => c.id !== id));
    if (selectedDay && citas.filter(c => c.id !== id && c.fecha === selectedDay).length === 0 && clases.filter(c => c.fecha === selectedDay).length === 0) setSelectedDay(null);
  }

  const days = getDaysInMonth();
  const eventosDia: EventoDia[] = selectedDay
    ? [...citas.filter(c => c.fecha === selectedDay).map(c => ({ tipo: "fisio" as const, cita: c })),
       ...clases.filter(c => c.fecha === selectedDay && c.estado === "activa").map(c => ({ tipo: "pilates" as const, clase: c }))]
       .sort((a, b) => (a.tipo === "fisio" ? a.cita.hora : a.clase.horaInicio).localeCompare(b.tipo === "fisio" ? b.cita.hora : b.clase.horaInicio))
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Modal nueva cita */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-base mb-1" style={{ color: "#1a1a1a" }}>Nueva cita · {form.fecha}</h3>
            <p className="text-xs mb-4 flex items-center gap-1" style={{ color: "#f59e0b" }}>
              <AlertCircle size={12} /> Política: cancelación con 24h de antelación mínima
            </p>
            <div className="space-y-3">
              <div>
                <label className="label">Paciente *</label>
                <select className="input-field" value={form.pacienteId} onChange={e => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
                  <option value="">Selecciona un paciente...</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>)}
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
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            {citas.length} citas · {clases.filter(c => c.estado === "activa").length} clases de pilates
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(f => ({ ...f, fecha: dateStr(today.getDate()) })); setShowForm(true); }}>
          + Nueva cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendario */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="btn-ghost p-2">‹</button>
            <h2 className="font-bold text-base" style={{ color: "#1a1a1a" }}>{MESES[month - 1]} {year}</h2>
            <button onClick={nextMonth} className="btn-ghost p-2">›</button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-bold py-1" style={{ color: "#9ca3af" }}>{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: AQUA, borderTopColor: "transparent" }} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i} />;
                const ds = dateStr(day);
                const eventos = eventosDelDia(day);
                const selected = selectedDay === ds;
                const hoy = isToday(day);
                const tieneFisio = eventos.some(e => e.tipo === "fisio");
                const tienePilates = eventos.some(e => e.tipo === "pilates");
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(selected ? null : ds)}
                    className="rounded-lg p-1 min-h-[52px] flex flex-col items-center transition-all"
                    style={{
                      backgroundColor: selected ? AQUA : hoy ? "#ECFEFF" : "transparent",
                      border: selected ? `2px solid ${AQUA}` : hoy ? "2px solid #A5F3FC" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span className="text-xs font-medium mb-1" style={{ color: selected ? "white" : hoy ? AQUA : "#374151" }}>
                      {day}
                    </span>
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {tieneFisio && eventos.filter(e => e.tipo === "fisio").slice(0, 2).map((e, ei) => (
                        <span key={`f${ei}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected ? "white" : ESTADO_CITA_COLORS[(e as { tipo: "fisio"; cita: Cita }).cita.estado] }} />
                      ))}
                      {tienePilates && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected ? "white" : PURPLE }} />
                      )}
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
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PURPLE }} />
              <span className="text-xs" style={{ color: "#6b7280" }}>Pilates</span>
            </div>
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
              {eventosDia.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "#9ca3af" }}>No hay eventos este día</p>
              ) : (
                <div className="space-y-3">
                  {eventosDia.map((ev, i) => ev.tipo === "fisio"
                    ? <CitaCard key={i} cita={ev.cita} warn24h={is24hWarning(ev.cita)} onEstado={cambiarEstado} onDelete={eliminarCita} />
                    : <PilatesCard key={i} clase={ev.clase} />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>Selecciona un día</p>
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>para ver o añadir eventos</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista combinada del mes */}
      {(citas.length > 0 || clases.length > 0) && (
        <div className="card p-5 mt-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: "#1a1a1a" }}>Todos los eventos de {MESES[month - 1]}</h3>
          <div className="space-y-2">
            {[
              ...citas.map(c => ({ fecha: c.fecha, hora: c.hora, tipo: "fisio" as const, data: c })),
              ...clases.filter(c => c.estado === "activa").map(c => ({ fecha: c.fecha, hora: c.horaInicio, tipo: "pilates" as const, data: c })),
            ].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)).map((ev, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.tipo === "pilates" ? PURPLE : ESTADO_CITA_COLORS[(ev.data as Cita).estado ?? "pendiente"] }} />
                <span className="text-sm font-medium w-20 flex-shrink-0" style={{ color: "#6b7280" }}>
                  {new Date(ev.fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} {ev.hora}
                </span>
                {ev.tipo === "fisio"
                  ? <Link href={`/pacientes/${(ev.data as Cita).pacienteId}`} className="text-sm font-medium flex-1 truncate" style={{ color: AQUA, textDecoration: "none" }}>{(ev.data as Cita).pacienteNombre}</Link>
                  : <span className="text-sm font-medium flex-1 truncate" style={{ color: PURPLE }}>{(ev.data as ClasePilates).titulo}</span>
                }
                <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium" style={{
                  backgroundColor: ev.tipo === "pilates" ? "#EDE9FE" : "#f3f4f6",
                  color: ev.tipo === "pilates" ? PURPLE : "#6b7280",
                }}>
                  {ev.tipo === "pilates" ? `${(ev.data as ClasePilates).inscritosCount}/${(ev.data as ClasePilates).capacidad} plazas` : (ev.data as Cita).motivo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CitaCard({ cita, warn24h, onEstado, onDelete }: {
  cita: Cita; warn24h: boolean;
  onEstado: (id: string, estado: EstadoCita) => void;
  onDelete: (id: string) => void;
}) {
  const esPrimeraVisita = cita.motivo === "Primera visita";
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: esPrimeraVisita ? "#fff7ed" : "#fafafa", border: warn24h ? "1px solid #fcd34d" : esPrimeraVisita ? "1px solid #fed7aa" : "1px solid #DDD8CE" }}>
      {esPrimeraVisita && (
        <div className="flex items-center gap-1 text-xs mb-2 font-semibold" style={{ color: "#ea580c" }}>
          ★ Primera visita — revisar cuestionario en notas
        </div>
      )}
      {warn24h && (
        <div className="flex items-center gap-1 text-xs mb-2" style={{ color: "#d97706" }}>
          <AlertCircle size={11} /> Menos de 24h para la cita — política de cancelación activa
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            <Link href={`/pacientes/${cita.pacienteId}`} style={{ color: AQUA, textDecoration: "none" }}>{cita.pacienteNombre}</Link>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{cita.hora} · {cita.duracion} min</p>
          {cita.motivo && <p className="text-xs mt-1 truncate" style={{ color: "#374151" }}>{cita.motivo}</p>}
        </div>
        <button onClick={() => onDelete(cita.id)} style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer" }}>✕</button>
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {(["pendiente","confirmada","completada","cancelada"] as EstadoCita[]).map(e => (
          <button key={e} onClick={() => onEstado(cita.id, e)} className="text-xs px-2 py-0.5 rounded-full transition-all"
            style={{ backgroundColor: cita.estado === e ? ESTADO_CITA_COLORS[e] : "#f3f4f6", color: cita.estado === e ? "white" : "#6b7280", border: "none", cursor: "pointer", fontWeight: cita.estado === e ? 600 : 400 }}>
            {ESTADO_CITA_LABELS[e]}
          </button>
        ))}
      </div>
    </div>
  );
}

function PilatesCard({ clase }: { clase: ClasePilates }) {
  const plazasLibres = clase.capacidad - clase.inscritosCount;
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: "#F5F3FF", border: `1px solid #DDD6FE` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: PURPLE }}>Pilates</span>
          </div>
          <p className="font-semibold text-sm truncate" style={{ color: "#1a1a1a" }}>{clase.titulo}</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{clase.horaInicio} – {clase.horaFin}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold" style={{ color: PURPLE }}>{clase.inscritosCount}/{clase.capacidad}</p>
          <p className="text-xs" style={{ color: plazasLibres === 0 ? "#ef4444" : "#9ca3af" }}>
            {plazasLibres === 0 ? "Completa" : `${plazasLibres} libres`}
          </p>
        </div>
      </div>
    </div>
  );
}
