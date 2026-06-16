"use client";

import { useState, useEffect, useCallback } from "react";
import { Coste, CategoriaCoste, CATEGORIA_COSTE_LABELS } from "@/lib/types";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface FinanzasMes {
  costes: Coste[];
  ingresos: { total: number; sesiones: number };
}

export default function FinanzasPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [datos, setDatos] = useState<FinanzasMes>({ costes: [], ingresos: { total: 0, sesiones: 0 } });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fecha: today.toISOString().split("T")[0], concepto: "", importe: "", categoria: "otro" as CategoriaCoste, notas: "" });
  const [saving, setSaving] = useState(false);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/costes?year=${year}&month=${month}`);
      const data = await res.json();
      setDatos({
        costes: Array.isArray(data?.costes) ? data.costes : [],
        ingresos: data?.ingresos ?? { total: 0, sesiones: 0 },
      });
    } catch {
      setDatos({ costes: [], ingresos: { total: 0, sesiones: 0 } });
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  async function saveCoste() {
    if (!form.concepto || !form.importe) return;
    setSaving(true);
    const res = await fetch("/api/costes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchDatos();
      setShowForm(false);
      setForm({ fecha: today.toISOString().split("T")[0], concepto: "", importe: "", categoria: "otro", notas: "" });
    }
    setSaving(false);
  }

  async function deleteCoste(id: string) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await fetch("/api/costes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    await fetchDatos();
  }

  const totalCostes = datos.costes.reduce((sum, c) => sum + c.importe, 0);
  const totalIngresos = datos.ingresos.total;
  const balance = totalIngresos - totalCostes;

  const costesPorCategoria = Object.entries(CATEGORIA_COSTE_LABELS).map(([cat, label]) => ({
    cat: cat as CategoriaCoste,
    label,
    total: datos.costes.filter(c => c.categoria === cat).reduce((s, c) => s + c.importe, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Modal nuevo gasto */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-base mb-4" style={{ color: "#1a1a1a" }}>Registrar gasto</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fecha</label>
                  <input className="input-field" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Importe (€) *</label>
                  <input className="input-field" type="number" min="0" step="0.01" value={form.importe} onChange={e => setForm(f => ({ ...f, importe: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="label">Concepto *</label>
                <input className="input-field" value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} placeholder="Descripción del gasto..." />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select className="input-field" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaCoste }))}>
                  {Object.entries(CATEGORIA_COSTE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea className="textarea-field" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Notas adicionales..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-primary flex-1 justify-center" onClick={saveCoste} disabled={saving || !form.concepto || !form.importe}>
                {saving ? "Guardando..." : "Guardar gasto"}
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Finanzas</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>Resumen mensual · no sustituye la contabilidad oficial</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Registrar gasto</button>
      </div>

      {/* Selector de mes */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={prevMonth} className="btn-ghost px-3">‹</button>
        <h2 className="font-bold text-lg" style={{ color: "#1a1a1a" }}>{MESES[month - 1]} {year}</h2>
        <button onClick={nextMonth} className="btn-ghost px-3">›</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0891B2", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KpiCard
              label="Ingresos estimados"
              value={`${totalIngresos.toFixed(2)} €`}
              sub={`${datos.ingresos.sesiones} sesiones confirmadas/completadas`}
              color="#10b981"
            />
            <KpiCard
              label="Gastos registrados"
              value={`${totalCostes.toFixed(2)} €`}
              sub={`${datos.costes.length} concepto${datos.costes.length !== 1 ? "s" : ""}`}
              color="#ef4444"
            />
            <KpiCard
              label="Balance estimado"
              value={`${balance >= 0 ? "+" : ""}${balance.toFixed(2)} €`}
              sub={balance >= 0 ? "Resultado positivo" : "Resultado negativo"}
              color={balance >= 0 ? "#0891B2" : "#ef4444"}
              highlight
            />
          </div>

          {/* Barra visual */}
          {(totalIngresos > 0 || totalCostes > 0) && (
            <div className="card p-4 mb-5">
              <p className="text-xs font-bold mb-3" style={{ color: "#6b7280" }}>DISTRIBUCIÓN</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                <div style={{ width: `${totalIngresos > 0 ? (Math.min(totalIngresos, totalIngresos) / (totalIngresos + totalCostes)) * 100 : 0}%`, backgroundColor: "#10b981" }} />
                <div style={{ width: `${totalCostes > 0 ? (totalCostes / (totalIngresos + totalCostes)) * 100 : 0}%`, backgroundColor: "#ef4444" }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: "#10b981" }}>Ingresos {totalIngresos.toFixed(0)} €</span>
                <span className="text-xs" style={{ color: "#ef4444" }}>Gastos {totalCostes.toFixed(0)} €</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Lista de gastos */}
            <div className="lg:col-span-2">
              <div className="card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #DDD8CE" }}>
                  <h3 className="font-bold text-sm" style={{ color: "#1a1a1a" }}>Gastos del mes</h3>
                </div>
                {datos.costes.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm" style={{ color: "#9ca3af" }}>No hay gastos registrados este mes</p>
                  </div>
                ) : (
                  <div>
                    {datos.costes.map(coste => (
                      <div key={coste.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid #f9fafb" }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#1a1a1a" }}>{coste.concepto}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                            {coste.fecha} · {CATEGORIA_COSTE_LABELS[coste.categoria]}
                          </p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0" style={{ color: "#ef4444" }}>
                          -{coste.importe.toFixed(2)} €
                        </p>
                        <button onClick={() => deleteCoste(coste.id)} style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>×</button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-5 py-3 font-bold" style={{ backgroundColor: "#fafafa" }}>
                      <span className="text-sm" style={{ color: "#1a1a1a" }}>Total gastos</span>
                      <span className="text-sm" style={{ color: "#ef4444" }}>-{totalCostes.toFixed(2)} €</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel derecho */}
            <div className="space-y-4">
              {/* Ingresos por sesiones */}
              <div className="card p-4">
                <p className="section-title">Ingresos por sesiones</p>
                <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
                  Tarifa: 35 € / 30 min · Solo citas confirmadas o completadas
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#6b7280" }}>Sesiones</span>
                    <span className="font-medium" style={{ color: "#1a1a1a" }}>{datos.ingresos.sesiones}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#6b7280" }}>Total estimado</span>
                    <span className="font-bold" style={{ color: "#10b981" }}>{totalIngresos.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Gastos por categoría */}
              {costesPorCategoria.length > 0 && (
                <div className="card p-4">
                  <p className="section-title">Gastos por categoría</p>
                  <div className="space-y-2">
                    {costesPorCategoria.map(({ cat, label, total }) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span style={{ color: "#6b7280" }}>{label}</span>
                        <span className="font-medium" style={{ color: "#ef4444" }}>{total.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, color, highlight }: {
  label: string; value: string; sub: string; color: string; highlight?: boolean;
}) {
  return (
    <div className="card p-4" style={highlight ? { border: `2px solid ${color}` } : {}}>
      <p className="text-xs font-medium mb-2" style={{ color: "#9ca3af" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{sub}</p>
    </div>
  );
}
