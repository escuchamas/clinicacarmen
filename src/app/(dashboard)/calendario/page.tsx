"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cita, EstadoCita, ESTADO_CITA_LABELS, ESTADO_CITA_COLORS, ClasePilates, PagoEstado, PAGO_LABELS, PAGO_COLORS } from "@/lib/types";
import { AlertCircle, Banknote, CalendarDays, Lock, LockOpen, X } from "lucide-react";

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
  const [impagadas, setImpagadas] = useState<Cita[]>([]);
  const [showImpagadas, setShowImpagadas] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);
  const [diasBloqueados, setDiasBloqueados] = useState<{ id: string; fecha: string; horaInicio: string | null; horaFin: string | null; motivo: string }[]>([]);
  const [showBloqueos, setShowBloqueos] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");
  const [tipoBloqueo, setTipoBloqueo] = useState<"dia" | "horas">("dia");
  const [bloqueoHoraInicio, setBloqueoHoraInicio] = useState("09:00");
  const [bloqueoHoraFin, setBloqueoHoraFin] = useState("11:00");

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

  useEffect(() => {
    fetch("/api/citas?impagadas=1").then(r => r.ok ? r.json() : []).then(d => setImpagadas(Array.isArray(d) ? d : []));
  }, [citas]);

  useEffect(() => {
    fetch("/api/dias-bloqueados").then(r => r.ok ? r.json() : []).then(d => setDiasBloqueados(Array.isArray(d) ? d.map((b: { id: string; fecha: string; horaInicio?: string | null; horaFin?: string | null; motivo?: string }) => ({ id: b.id, fecha: b.fecha, horaInicio: b.horaInicio ?? null, horaFin: b.horaFin ?? null, motivo: b.motivo ?? "" })) : []));
  }, []);


  async function bloquearDia(fecha: string) {
    const body = tipoBloqueo === "dia"
      ? { fecha, motivo: motivoBloqueo.trim() }
      : { fecha, horaInicio: bloqueoHoraInicio, horaFin: bloqueoHoraFin, motivo: motivoBloqueo.trim() };
    const res = await fetch("/api/dias-bloqueados", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const d = await res.json();
      if (tipoBloqueo === "dia") {
        setDiasBloqueados(prev => [...prev.filter(b => b.fecha !== fecha || b.horaInicio !== null), { id: d.id, fecha, horaInicio: null, horaFin: null, motivo: motivoBloqueo.trim() }]);
      } else {
        setDiasBloqueados(prev => [...prev, { id: d.id, fecha, horaInicio: bloqueoHoraInicio, horaFin: bloqueoHoraFin, motivo: motivoBloqueo.trim() }]);
      }
      setMotivoBloqueo("");
    }
  }

  async function eliminarBloqueo(id: string) {
    await fetch("/api/dias-bloqueados", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDiasBloqueados(prev => prev.filter(b => b.id !== id));
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1);
    setSelectedDay(null); setShowAgenda(false);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1);
    setSelectedDay(null); setShowAgenda(false);
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
    return horasRestantes < 24 && horasRestantes > 0 && cita.estado === "agendada";
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

  async function cambiarPago(id: string, pagoEstado: PagoEstado) {
    await fetch("/api/citas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "pago", id, pagoEstado }) });
    setCitas(prev => prev.map(c => c.id === id ? { ...c, pagoEstado } : c));
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

      {/* Panel cobros pendientes */}
      {impagadas.length > 0 && (
        <div className="mb-5 rounded-xl overflow-hidden" style={{ border: "1.5px solid #fca5a5" }}>
          <button onClick={() => setShowImpagadas(v => !v)} className="w-full flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#fef2f2", border: "none", cursor: "pointer" }}>
            <div className="flex items-center gap-2">
              <Banknote size={16} color="#991b1b" strokeWidth={1.75} />
              <span className="font-bold text-sm" style={{ color: "#991b1b" }}>
                {impagadas.length} sesión{impagadas.length > 1 ? "es" : ""} sin cobrar (más de 24h)
              </span>
            </div>
            <span style={{ color: "#991b1b", fontSize: "0.8125rem" }}>{showImpagadas ? "▲ Ocultar" : "▼ Ver"}</span>
          </button>
          {showImpagadas && (
            <div style={{ backgroundColor: "white", borderTop: "1px solid #fca5a5" }}>
              {impagadas.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #fef2f2" }}>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: "#111827" }}>{c.pacienteNombre}</span>
                    <span className="text-xs ml-2" style={{ color: "#6b7280" }}>
                      {new Date(c.fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {c.hora}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => cambiarPago(c.id, "parcial")} className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: c.pagoEstado === "parcial" ? "#fef3c7" : "#f3f4f6", color: c.pagoEstado === "parcial" ? "#d97706" : "#6b7280", border: "none", cursor: "pointer" }}>
                      Parcial
                    </button>
                    <button onClick={() => cambiarPago(c.id, "pagado")} className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: "#d1fae5", color: "#065f46", border: "none", cursor: "pointer" }}>
                      ✓ Cobrado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>Calendario</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            {citas.length} citas · {clases.filter(c => c.estado === "activa").length} clases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBloqueos(v => !v)} className="btn-ghost flex items-center gap-1.5 text-sm" title="Gestionar días bloqueados">
            <Lock size={15} />
            <span className="hidden sm:inline">Disponibilidad</span>
          </button>
          <button className="btn-primary" onClick={() => { setForm(f => ({ ...f, fecha: dateStr(today.getDate()) })); setShowForm(true); }}>
            + Nueva cita
          </button>
        </div>
      </div>

      {/* Panel gestión de disponibilidad */}
      {showBloqueos && (
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: "#1a1a1a" }}>
              <Lock size={14} color="#0891B2" /> Gestionar disponibilidad
            </h3>
            <button onClick={() => setShowBloqueos(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={16} />
            </button>
          </div>

          <p className="text-xs mb-4" style={{ color: "#6b7280" }}>
            Los sábados y domingos están bloqueados por defecto. Bloquea días completos o rangos horarios concretos.
          </p>

          {/* Toggle tipo de bloqueo */}
          <div className="flex gap-1 mb-3 p-1 rounded-lg" style={{ backgroundColor: "#f3f4f6" }}>
            <button
              onClick={() => setTipoBloqueo("dia")}
              className="flex-1 text-xs py-1.5 rounded-md font-semibold transition-all"
              style={{ backgroundColor: tipoBloqueo === "dia" ? "white" : "transparent", color: tipoBloqueo === "dia" ? "#1a1a1a" : "#6b7280", border: "none", cursor: "pointer", boxShadow: tipoBloqueo === "dia" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
            >
              Día completo
            </button>
            <button
              onClick={() => setTipoBloqueo("horas")}
              className="flex-1 text-xs py-1.5 rounded-md font-semibold transition-all"
              style={{ backgroundColor: tipoBloqueo === "horas" ? "white" : "transparent", color: tipoBloqueo === "horas" ? "#1a1a1a" : "#6b7280", border: "none", cursor: "pointer", boxShadow: tipoBloqueo === "horas" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
            >
              Horas concretas
            </button>
          </div>

          {/* Formulario de bloqueo */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <input
                type="date"
                className="input-field text-sm flex-1"
                value={selectedDay ?? ""}
                onChange={e => setSelectedDay(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <input
                className="input-field text-sm flex-1"
                placeholder="Motivo (opcional)"
                value={motivoBloqueo}
                onChange={e => setMotivoBloqueo(e.target.value)}
              />
            </div>
            {tipoBloqueo === "horas" && (
              <div className="flex gap-2 items-center">
                <input type="time" className="input-field text-sm flex-1" value={bloqueoHoraInicio} onChange={e => setBloqueoHoraInicio(e.target.value)} />
                <span className="text-xs font-medium" style={{ color: "#6b7280", flexShrink: 0 }}>hasta</span>
                <input type="time" className="input-field text-sm flex-1" value={bloqueoHoraFin} onChange={e => setBloqueoHoraFin(e.target.value)} />
              </div>
            )}
            <button
              onClick={() => selectedDay && bloquearDia(selectedDay)}
              disabled={!selectedDay}
              className="btn-primary text-sm w-full justify-center"
            >
              <Lock size={13} style={{ display: "inline", marginRight: 4 }} />
              {tipoBloqueo === "dia" ? "Bloquear día completo" : "Bloquear rango horario"}
            </button>
          </div>

          {/* Lista de bloqueos */}
          {diasBloqueados.length === 0 ? (
            <p className="text-xs text-center py-3" style={{ color: "#9ca3af" }}>No hay bloqueos manuales</p>
          ) : (
            <div className="space-y-1">
              {diasBloqueados.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: b.horaInicio ? "#fffbeb" : "#fef2f2", border: `1px solid ${b.horaInicio ? "#fed7aa" : "#fca5a5"}` }}>
                  <div className="flex items-center gap-2 min-w-0">
                    {b.horaInicio ? <span style={{ fontSize: 12 }}>⏰</span> : <Lock size={12} color="#ef4444" />}
                    <span className="text-sm font-medium" style={{ color: "#111827" }}>
                      {new Date(b.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    {b.horaInicio && <span className="text-xs font-semibold" style={{ color: "#d97706" }}>{b.horaInicio}–{b.horaFin}</span>}
                    {b.motivo && <span className="text-xs truncate" style={{ color: "#9ca3af" }}>· {b.motivo}</span>}
                  </div>
                  <button onClick={() => eliminarBloqueo(b.id)} className="text-xs flex items-center gap-1 flex-shrink-0 ml-2" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                    <LockOpen size={12} /> Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom sheet móvil — resumen compacto del día */}
      {selectedDay && (
        <>
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={() => setSelectedDay(null)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-40 md:hidden"
            style={{
              backgroundColor: "white",
              borderRadius: "1.25rem 1.25rem 0 0",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)",
            }}
          >
            <div style={{ padding: "0.75rem 1rem 0.25rem" }}>
              <div style={{ width: "40px", height: "4px", backgroundColor: "#e5e7eb", borderRadius: "2px", margin: "0 auto 0.75rem" }} />
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm capitalize" style={{ color: "#1a1a1a" }}>
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <div className="flex items-center gap-1">
                  <button className="btn-ghost text-xs py-1 px-2" onClick={() => { setForm(f => ({ ...f, fecha: selectedDay })); setShowForm(true); }}>
                    + Añadir
                  </button>
                  <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.25rem 0.5rem", fontSize: "1.125rem", lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: "0.25rem 1rem 0.5rem" }}>
              {eventosDia.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "#9ca3af" }}>No hay eventos este día</p>
              ) : (
                eventosDia.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ padding: "0.5rem 0", borderBottom: i < eventosDia.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.tipo === "fisio" ? ESTADO_CITA_COLORS[ev.cita.estado] : PURPLE }} />
                    <span className="text-xs font-medium flex-shrink-0" style={{ color: "#9ca3af", minWidth: 36 }}>
                      {ev.tipo === "fisio" ? ev.cita.hora : ev.clase.horaInicio}
                    </span>
                    <span className="text-sm font-semibold flex-1 truncate" style={{ color: ev.tipo === "fisio" ? AQUA : PURPLE }}>
                      {ev.tipo === "fisio" ? ev.cita.pacienteNombre : ev.clase.titulo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                      style={{ backgroundColor: ev.tipo === "fisio" ? ESTADO_CITA_COLORS[ev.cita.estado] + "20" : "#EDE9FE", color: ev.tipo === "fisio" ? ESTADO_CITA_COLORS[ev.cita.estado] : PURPLE }}>
                      {ev.tipo === "fisio" ? ESTADO_CITA_LABELS[ev.cita.estado] : `${ev.clase.inscritosCount}/${ev.clase.capacidad}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Calendario */}
        <div className="md:col-span-2 card p-4">
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
                const diaSemana = new Date(ds + "T12:00:00").getDay();
                const esFinde = diaSemana === 0 || diaSemana === 6;
                const bloqueosDia = diasBloqueados.filter(b => b.fecha === ds);
                const estaBloqueadoDiaCompleto = bloqueosDia.some(b => !b.horaInicio);
                const tieneBloqueoHoras = !estaBloqueadoDiaCompleto && bloqueosDia.some(b => b.horaInicio);
                const noDisponible = esFinde || estaBloqueadoDiaCompleto;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(selected ? null : ds)}
                    className="rounded-lg p-1 min-h-[52px] flex flex-col items-center transition-all"
                    style={{
                      backgroundColor: selected ? AQUA : noDisponible ? "#f9fafb" : hoy ? "#ECFEFF" : "transparent",
                      border: selected ? `2px solid ${AQUA}` : estaBloqueadoDiaCompleto ? "2px solid #fca5a5" : tieneBloqueoHoras ? "2px solid #fed7aa" : hoy ? "2px solid #A5F3FC" : "2px solid transparent",
                      cursor: "pointer",
                      opacity: noDisponible ? 0.5 : 1,
                    }}
                  >
                    <span className="text-xs font-medium mb-1" style={{ color: selected ? "white" : noDisponible ? "#9ca3af" : hoy ? AQUA : "#374151" }}>
                      {day}
                    </span>
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {estaBloqueadoDiaCompleto && !selected && <Lock size={8} color="#ef4444" />}
                      {tieneBloqueoHoras && !selected && <span style={{ fontSize: 8, lineHeight: 1 }}>⏰</span>}
                      {!estaBloqueadoDiaCompleto && tieneFisio && eventos.filter(e => e.tipo === "fisio").slice(0, 2).map((e, ei) => (
                        <span key={`f${ei}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected ? "white" : ESTADO_CITA_COLORS[(e as { tipo: "fisio"; cita: Cita }).cita.estado] }} />
                      ))}
                      {!estaBloqueadoDiaCompleto && tienePilates && (
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

        {/* Panel lateral — md y superior */}
        <div className="hidden md:flex md:flex-col card overflow-hidden" style={{ maxHeight: "520px" }}>
          {selectedDay ? (
            <>
              <div className="flex items-center justify-between flex-shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <h3 className="font-bold text-sm capitalize" style={{ color: "#1a1a1a" }}>
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <button className="btn-ghost text-xs py-1 px-2" onClick={() => { setForm(f => ({ ...f, fecha: selectedDay })); setShowForm(true); }}>
                  + Añadir
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 1rem 1rem" }}>
                {eventosDia.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: "#9ca3af" }}>No hay eventos este día</p>
                ) : (
                  <div className="space-y-3">
                    {eventosDia.map((ev, i) => ev.tipo === "fisio"
                      ? <CitaCard key={i} cita={ev.cita} warn24h={is24hWarning(ev.cita)} onEstado={cambiarEstado} onPago={cambiarPago} onDelete={eliminarCita} />
                      : <PilatesCard key={i} clase={ev.clase} />
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 px-4">
              <CalendarDays size={36} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: "0.5rem" }} />
              <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>Selecciona un día</p>
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>para ver o añadir eventos</p>
            </div>
          )}
        </div>
      </div>

      {/* Agenda del mes — colapsable, oculta cuando hay día seleccionado */}
      {(citas.length > 0 || clases.length > 0) && !selectedDay && (
        <div className="card mt-5 overflow-hidden">
          <button
            onClick={() => setShowAgenda(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>
              Agenda de {MESES[month - 1]}
              <span className="ml-2 font-normal" style={{ color: "#9ca3af" }}>
                {citas.length + clases.filter(c => c.estado === "activa").length} eventos
              </span>
            </span>
            <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{showAgenda ? "▲ Ocultar" : "▼ Ver todos"}</span>
          </button>
          {showAgenda && (
            <div style={{ borderTop: "1px solid #f3f4f6", padding: "0 1.25rem 1.25rem" }}>
              {[
                ...citas.map(c => ({ fecha: c.fecha, hora: c.hora, tipo: "fisio" as const, data: c })),
                ...clases.filter(c => c.estado === "activa").map(c => ({ fecha: c.fecha, hora: c.horaInicio, tipo: "pilates" as const, data: c })),
              ].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)).map((ev, i) => (
                <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid #f9fafb" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.tipo === "pilates" ? PURPLE : ESTADO_CITA_COLORS[(ev.data as Cita).estado ?? "agendada"] }} />
                  <button
                    onClick={() => setSelectedDay(ev.fecha)}
                    className="text-sm font-medium w-20 flex-shrink-0 text-left"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                  >
                    {new Date(ev.fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} {ev.hora}
                  </button>
                  {ev.tipo === "fisio"
                    ? <Link href={`/pacientes/${(ev.data as Cita).pacienteId}`} className="text-sm font-medium flex-1 truncate" style={{ color: AQUA, textDecoration: "none" }}>{(ev.data as Cita).pacienteNombre}</Link>
                    : <span className="text-sm font-medium flex-1 truncate" style={{ color: PURPLE }}>{(ev.data as ClasePilates).titulo}</span>
                  }
                  <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: ev.tipo === "pilates" ? "#EDE9FE" : "#f3f4f6", color: ev.tipo === "pilates" ? PURPLE : "#6b7280" }}>
                    {ev.tipo === "pilates" ? `${(ev.data as ClasePilates).inscritosCount}/${(ev.data as ClasePilates).capacidad}` : (ev.data as Cita).motivo || ESTADO_CITA_LABELS[(ev.data as Cita).estado]}
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

function CitaCard({ cita, warn24h, onEstado, onPago, onDelete }: {
  cita: Cita; warn24h: boolean;
  onEstado: (id: string, estado: EstadoCita) => void;
  onPago: (id: string, pago: PagoEstado) => void;
  onDelete: (id: string) => void;
}) {
  const esPrimeraVisita = cita.motivo === "Primera visita";
  const esPasada = cita.fecha < new Date().toISOString().split("T")[0];
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

      {/* Estado de la cita */}
      <div className="flex gap-1 mt-2 flex-wrap">
        {(["agendada","vino","no_vino","cancelada"] as EstadoCita[]).map(e => (
          <button key={e} onClick={() => onEstado(cita.id, e)} className="text-xs px-2 py-0.5 rounded-full transition-all"
            style={{ backgroundColor: cita.estado === e ? ESTADO_CITA_COLORS[e] : "#f3f4f6", color: cita.estado === e ? "white" : "#6b7280", border: "none", cursor: "pointer", fontWeight: cita.estado === e ? 600 : 400 }}>
            {ESTADO_CITA_LABELS[e]}
          </button>
        ))}
      </div>

      {/* Control de cobro — solo visible en citas pasadas o completadas */}
      {(esPasada || cita.estado === "vino") && cita.estado !== "cancelada" && cita.estado !== "no_vino" && (
        <div className="flex gap-1 mt-2 flex-wrap items-center" style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.5rem" }}>
          <span className="text-xs font-semibold mr-1" style={{ color: "#9ca3af" }}>Cobro:</span>
          {(["sin_pagar","parcial","pagado"] as PagoEstado[]).map(p => (
            <button key={p} onClick={() => onPago(cita.id, p)} className="text-xs px-2 py-0.5 rounded-full transition-all"
              style={{ backgroundColor: cita.pagoEstado === p ? PAGO_COLORS[p] : "#f3f4f6", color: cita.pagoEstado === p ? "white" : "#6b7280", border: "none", cursor: "pointer", fontWeight: cita.pagoEstado === p ? 600 : 400 }}>
              {PAGO_LABELS[p]}
            </button>
          ))}
        </div>
      )}
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
