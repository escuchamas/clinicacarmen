"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { EjercicioPostSesion } from "@/lib/types";

const EJERCICIO_EMPTY: EjercicioPostSesion = { nombre: "", dosis: "", indicaciones: "" };

export default function NuevaSesionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contenido, setContenido] = useState("");
  const [incluirInforme, setIncluirInforme] = useState(false);
  const [ejercicios, setEjercicios] = useState<EjercicioPostSesion[]>([
    { nombre: "Calentamiento", dosis: "", indicaciones: "" },
    { ...EJERCICIO_EMPTY },
    { ...EJERCICIO_EMPTY },
    { ...EJERCICIO_EMPTY },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateEjercicio(i: number, field: keyof EjercicioPostSesion, value: string) {
    setEjercicios((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function addEjercicio() {
    setEjercicios((prev) => [...prev, { ...EJERCICIO_EMPTY }]);
  }

  function removeEjercicio(i: number) {
    if (ejercicios.length <= 1) return;
    setEjercicios((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contenido.trim()) {
      setError("El contenido de la sesión es obligatorio");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const ejerciciosFiltrados = incluirInforme
        ? ejercicios.filter((e) => e.nombre.trim())
        : [];
      const res = await fetch(`/api/pacientes/${id}/sesiones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido,
          informe: { ejercicios: ejerciciosFiltrados },
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      router.push(`/pacientes/${id}`);
    } catch {
      setError("Error al guardar la sesión. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#2D7D5E", textDecoration: "none" }}>Pacientes</Link>
        <span>/</span>
        <Link href={`/pacientes/${id}`} style={{ color: "#2D7D5E", textDecoration: "none" }}>Paciente</Link>
        <span>/</span>
        <span>Nueva sesión</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tratamiento y evolución */}
        <div className="card p-6 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: "#1a1a1a" }}>
            <span>⚕️</span>
            Tratamiento y evolución
          </h2>
          <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
            Fecha de hoy: <strong>{new Date().toLocaleDateString("es-ES")}</strong>
          </p>
          <textarea
            className="textarea-field"
            rows={10}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Describe el tratamiento realizado hoy, la evolución del paciente, observaciones, cambios en el dolor, técnicas aplicadas..."
          />
          {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
        </div>

        {/* Informe post-sesión (opcional) */}
        <div className="card p-6 mb-4">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={incluirInforme}
              onChange={(e) => setIncluirInforme(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: "#2D7D5E" }}
            />
            <span className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>
              Incluir informe post-sesión (pauta de ejercicio)
            </span>
          </label>

          {incluirInforme && (
            <div>
              <p className="section-title mb-3">Pauta de ejercicio</p>
              <div className="space-y-2">
                {/* Cabecera tabla */}
                <div className="grid gap-2 text-xs font-bold uppercase tracking-wide" style={{ gridTemplateColumns: "100px 1fr 1fr 28px" }}>
                  <span style={{ color: "#6b7280" }}>Dosis</span>
                  <span style={{ color: "#6b7280" }}>Ejercicio</span>
                  <span style={{ color: "#6b7280" }}>Indicaciones</span>
                  <span />
                </div>

                {ejercicios.map((ej, i) => (
                  <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: "100px 1fr 1fr 28px" }}>
                    <input
                      className="input-field text-xs"
                      placeholder="Dosis"
                      value={ej.dosis}
                      onChange={(e) => updateEjercicio(i, "dosis", e.target.value)}
                    />
                    <input
                      className="input-field text-xs"
                      placeholder={i === 0 ? "Calentamiento" : "Ejercicio"}
                      value={ej.nombre}
                      onChange={(e) => updateEjercicio(i, "nombre", e.target.value)}
                    />
                    <input
                      className="input-field text-xs"
                      placeholder="Indicaciones"
                      value={ej.indicaciones}
                      onChange={(e) => updateEjercicio(i, "indicaciones", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeEjercicio(i)}
                      className="flex items-center justify-center w-7 h-7 rounded text-lg"
                      style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
                      disabled={ejercicios.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEjercicio}
                  className="text-sm mt-2"
                  style={{ color: "#2D7D5E", background: "none", border: "none", cursor: "pointer" }}
                >
                  + Añadir ejercicio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-between gap-3">
          <Link href={`/pacientes/${id}`} className="btn-secondary" style={{ textDecoration: "none" }}>
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "Guardar sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
