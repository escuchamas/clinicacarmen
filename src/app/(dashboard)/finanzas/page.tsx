"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Coste, CategoriaCoste, CATEGORIA_COSTE_LABELS, Cita, PagoEstado, PAGO_LABELS, PAGO_COLORS } from "@/lib/types";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split("-");
  const mes = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][parseInt(m) - 1];
  return `${parseInt(d)} ${mes} ${y}`;
}

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

  // Impagos
  const [impagos, setImpagos] = useState<Cita[]>([]);
  const [loadingImpagos, setLoadingImpagos] = useState(true);
  const [marcando, setMarcando] = useState<string | null>(null);

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

  const fetchImpagos = useCallback(async () => {
    setLoadingImpagos(true);
    try {
      const res = await fetch("/api/citas?impagadas=1");
      const data = await res.json();
      setImpagos(Array.isArray(data) ? data : []);
    } catch {
      setImpagos([]);
    }
    setLoadingImpagos(false);
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);
  useEffect(() => { fetchImpagos(); }, [fetchImpagos]);

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

  async function marcarPago(citaId: string, pagoEstado: PagoEstado) {
    setMarcando(citaId);
    await fetch("/api/citas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pago", id: citaId, pagoEstado }),
    });
    await fetchImpagos();
    setMarcando(null);
  }

  const totalCostes = datos.costes.reduce((sum, c) => sum + c.importe, 0);
  const totalIngresos = datos.ingresos.total;
  const balance = totalIngresos - totalCostes;

  const costesPorCategoria = Object.entries(CATEGORIA_COSTE_LABELS).map(([cat, label]) => ({
    cat: cat as CategoriaCoste,
    label,
    total: datos.costes.filter(c => c.categoria === cat).reduce((s, c) => s + c.importe, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const sinPagar = impagos.filter(c => c.pagoEstado === "sin_pagar");
  const parciales = impagos.filter(c => c.pagoEstado === "parcial");

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

      {/* ── Cobros pendientes ───────────────────────────────────────────── */}
      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #DDD8CE" }}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm" style={{ color: "#1a1a1a" }}>Cobros pendientes</h3>
            {!loadingImpagos && impagos.length > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                minWidth: "20px", height: "20px", borderRadius: "9999px",
                backgroundColor: "#ef4444", color: "white",
                fontSize: "0.65rem", fontWeight: 700, padding: "0 5px",
              }}>
                {impagos.length}
              </span>
            )}
          </div>
          {!loadingImpagos && impagos.length === 0 && (
            <span className="text-xs font-medium" style={{ color: "#10b981" }}>✓ Todo al día</span>
          )}
        </div>

        {loadingImpagos ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#0D9488", borderTopColor: "transparent" }} />
          </div>
        ) : impagos.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm" style={{ color: "#9ca3af" }}>No hay cobros pendientes</p>
          </div>
        ) : (
          <>
            {/* Subgrupo sin pagar */}
            {sinPagar.length > 0 && (
              <>
                <div className="px-5 py-2" style={{ backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
                  <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>SIN COBRAR · {sinPagar.length}</span>
                </div>
                {sinPagar.map(cita => (
                  <ImpagaRow key={cita.id} cita={cita} marcando={marcando} onMarcar={marcarPago} />
                ))}
              </>
            )}
            {/* Subgrupo parcial */}
            {parciales.length > 0 && (
              <>
                <div className="px-5 py-2" style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", borderTop: sinPagar.length > 0 ? "1px solid #DDD8CE" : undefined }}>
                  <span className="text-xs font-semibold" style={{ color: "#d97706" }}>PAGO PARCIAL · {parciales.length}</span>
                </div>
                {parciales.map(cita => (
                  <ImpagaRow key={cita.id} cita={cita} marcando={marcando} onMarcar={marcarPago} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Selector de mes */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={prevMonth} className="btn-ghost px-3">‹</button>
        <h2 className="font-bold text-lg" style={{ color: "#1a1a1a" }}>{MESES[month - 1]} {year}</h2>
        <button onClick={nextMonth} className="btn-ghost px-3">›</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0D9488", borderTopColor: "transparent" }} />
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
              color={balance >= 0 ? "#0D9488" : "#ef4444"}
              highlight
            />
          </div>

          {/* Barra visual */}
          {(totalIngresos > 0 || totalCostes > 0) && (
            <div className="card p-4 mb-5">
              <p className="text-xs font-bold mb-3" style={{ color: "#6b7280" }}>DISTRIBUCIÓN</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                <div style={{ width: `${totalIngresos > 0 ? (totalIngresos / (totalIngresos + totalCostes)) * 100 : 0}%`, backgroundColor: "#10b981" }} />
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

function ImpagaRow({ cita, marcando, onMarcar }: {
  cita: Cita;
  marcando: string | null;
  onMarcar: (id: string, estado: PagoEstado) => void;
}) {
  const busy = marcando === cita.id;
  return (
    <div
      className="flex items-center gap-3 px-5 py-3"
      style={{ borderBottom: "1px solid #f9fafb" }}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/pacientes/${cita.pacienteId}`}
          className="text-sm font-semibold hover:underline truncate block"
          style={{ color: "#1a1a1a", textDecoration: "none" }}
        >
          {cita.pacienteNombre ?? "Paciente"}
        </Link>
        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
          {formatFecha(cita.fecha)} · {cita.hora.slice(0, 5)}
          {cita.motivo ? ` · ${cita.motivo}` : ""}
        </p>
      </div>

      {/* Badge estado pago */}
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
        style={{
          backgroundColor: PAGO_COLORS[cita.pagoEstado] + "22",
          color: PAGO_COLORS[cita.pagoEstado],
        }}
      >
        {PAGO_LABELS[cita.pagoEstado]}
      </span>

      {/* Acciones */}
      <div className="flex gap-1.5 flex-shrink-0">
        {cita.pagoEstado !== "parcial" && (
          <button
            onClick={() => onMarcar(cita.id, "parcial")}
            disabled={busy}
            className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#fffbeb",
              color: "#d97706",
              border: "1px solid #fde68a",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Parcial
          </button>
        )}
        <button
          onClick={() => onMarcar(cita.id, "pagado")}
          disabled={busy}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            border: "1px solid #bbf7d0",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "..." : "Cobrado"}
        </button>
      </div>
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
