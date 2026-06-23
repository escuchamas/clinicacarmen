"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const AQUA = "#0D9488";

type LeadEstado = "nuevo" | "contactado" | "convertido" | "perdido";

interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
  origen: string;
  estado: LeadEstado;
  pacienteId: string | null;
  createdAt: string;
}

const ORIGEN_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  landing:    { label: "Landing page",       color: "#0D9488", bg: "#f0fdfa" },
  pedir_cita: { label: "Pedir cita (wizard)", color: "#7C3AED", bg: "#f5f3ff" },
};

const ESTADO_CONFIG: Record<LeadEstado, { label: string; color: string; bg: string }> = {
  nuevo:      { label: "Nuevo",      color: "#0D9488", bg: "#f0fdfa" },
  contactado: { label: "Contactado", color: "#d97706", bg: "#fffbeb" },
  convertido: { label: "Convertido", color: "#16a34a", bg: "#f0fdf4" },
  perdido:    { label: "Perdido",    color: "#9ca3af", bg: "#f9fafb" },
};

const ESTADOS: LeadEstado[] = ["nuevo", "contactado", "convertido", "perdido"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<LeadEstado | "todos">("todos");

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function cambiarEstado(id: string, estado: LeadEstado) {
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estado } : l));
  }

  const filtrados = filtro === "todos" ? leads : leads.filter(l => l.estado === filtro);

  // Stats
  const total = leads.length;
  const porOrigen = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => { acc[l.origen] = (acc[l.origen] ?? 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);
  const convertidos = leads.filter(l => l.estado === "convertido").length;
  const tasaConversion = total > 0 ? Math.round((convertidos / total) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-xl" style={{ color: "#1a1a1a" }}>Leads</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Solicitudes de cita recibidas por canal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs font-medium mb-1" style={{ color: "#6b7280" }}>Total leads</p>
          <p className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>{total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium mb-1" style={{ color: "#6b7280" }}>Tasa conversión</p>
          <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>{tasaConversion}%</p>
        </div>
        {porOrigen.map(([origen, count]) => {
          const cfg = ORIGEN_LABEL[origen] ?? { label: origen, color: "#6b7280", bg: "#f9fafb" };
          return (
            <div key={origen} className="card p-4">
              <p className="text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
                <span className="inline-block px-1.5 py-0.5 rounded text-xs mr-1" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
              </p>
              <p className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>{count}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                {leads.filter(l => l.origen === origen && l.estado === "convertido").length} convertidos
              </p>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["todos", ...ESTADOS] as const).map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className="text-sm px-3 py-1.5 rounded-lg font-medium"
            style={{
              backgroundColor: filtro === e ? (e === "todos" ? AQUA : ESTADO_CONFIG[e]?.bg ?? "#f0fdfa") : "white",
              color: filtro === e ? (e === "todos" ? "white" : ESTADO_CONFIG[e]?.color ?? AQUA) : "#6b7280",
              border: `1px solid ${filtro === e ? (e === "todos" ? AQUA : ESTADO_CONFIG[e]?.color ?? AQUA) : "#e2ddd3"}`,
              cursor: "pointer",
            }}
          >
            {e === "todos" ? "Todos" : ESTADO_CONFIG[e].label}
            <span className="ml-1.5 text-xs opacity-70">
              {e === "todos" ? total : leads.filter(l => l.estado === e).length}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: "#9ca3af" }}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            {total === 0 ? "Aún no hay solicitudes. Cuando alguien rellene un formulario aparecerá aquí." : "No hay leads con este filtro."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(lead => {
            const origenCfg = ORIGEN_LABEL[lead.origen] ?? { label: lead.origen, color: "#6b7280", bg: "#f9fafb" };
            const estadoCfg = ESTADO_CONFIG[lead.estado];
            return (
              <div key={lead.id} className="card p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: AQUA }}>
                    {lead.nombre.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>{lead.nombre}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: origenCfg.bg, color: origenCfg.color }}>
                        {origenCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "#6b7280" }}>
                      <a href={`tel:${lead.telefono}`} style={{ color: "#6b7280", textDecoration: "none" }}>{lead.telefono}</a>
                      {lead.email && <a href={`mailto:${lead.email}`} style={{ color: "#6b7280", textDecoration: "none" }}>{lead.email}</a>}
                      <span>{lead.createdAt}</span>
                    </div>
                    {lead.mensaje && (
                      <p className="text-xs mt-1 italic" style={{ color: "#9ca3af" }}>"{lead.mensaje}"</p>
                    )}
                    {lead.pacienteId && (
                      <Link href={`/pacientes/${lead.pacienteId}`} className="text-xs mt-1 inline-block" style={{ color: AQUA, textDecoration: "none" }}>
                        Ver paciente →
                      </Link>
                    )}
                  </div>

                  {/* Estado selector */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: estadoCfg.bg, color: estadoCfg.color }}>
                      {estadoCfg.label}
                    </span>
                    <select
                      value={lead.estado}
                      onChange={e => cambiarEstado(lead.id, e.target.value as LeadEstado)}
                      className="text-xs rounded-lg px-2 py-1"
                      style={{ border: "1px solid #e2ddd3", backgroundColor: "white", color: "#6b7280", cursor: "pointer" }}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
