"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WizardProgress from "@/components/wizard/WizardProgress";
import { WizardData, BANDERAS_ROJAS_LISTA } from "@/lib/types";
import Link from "next/link";

const EMPTY_WIZARD: WizardData = {
  paso1: { dni: "", nombre: "", apellidos: "", email: "", telefono: "", fechaNacimiento: "", poblacion: "", lopdFirmada: false },
  paso2: { profesion: "", alergias: "", ejercicioFisico: "" },
  paso3: { motivoConsulta: "" },
  paso4: {
    antecedentesPersonalesFamiliares: "", calidadSueno: "", patologias: "",
    tabaquismo: "", medicacion: "", implantesMetalicos: "", embarazoLactancia: "", semanasEmbarazo: "",
  },
  paso5: { banderasRojas: [], pruebaTipo: "", pruebaFecha: "", pruebaDiagnostico: "" },
};

interface Warning {
  campos: string[];
  onContinuar: () => void;
}

// Campos opcionales a comprobar por paso
function getEmptyOptionalFields(step: number, data: WizardData): string[] {
  const empty: string[] = [];
  if (step === 1) {
    if (!data.paso1.telefono.trim()) empty.push("Teléfono");
    if (!data.paso1.email.trim()) empty.push("Email");
    if (!data.paso1.fechaNacimiento) empty.push("Fecha de nacimiento");
    if (!data.paso1.poblacion.trim()) empty.push("Población");
  }
  if (step === 2) {
    if (!data.paso2.profesion.trim()) empty.push("Profesión / Nivel de estrés");
    if (!data.paso2.alergias.trim()) empty.push("Alergias / Intolerancias");
    if (!data.paso2.ejercicioFisico.trim()) empty.push("Ejercicio físico");
  }
  if (step === 4) {
    if (!data.paso4.antecedentesPersonalesFamiliares.trim()) empty.push("Antecedentes personales y familiares");
    if (!data.paso4.calidadSueno.trim()) empty.push("Calidad del sueño");
    if (!data.paso4.patologias.trim()) empty.push("Patologías / Enfermedades");
    if (!data.paso4.tabaquismo.trim()) empty.push("Tabaquismo");
    if (!data.paso4.medicacion.trim()) empty.push("Medicación");
    if (!data.paso4.implantesMetalicos.trim()) empty.push("Implantes metálicos");
    if (!data.paso4.embarazoLactancia.trim()) empty.push("Embarazo / Lactancia");
  }
  if (step === 5) {
    if (!data.paso5.pruebaTipo.trim()) empty.push("Tipo de prueba de imagen");
  }
  return empty;
}

export default function NuevoPacientePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(EMPTY_WIZARD);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warning, setWarning] = useState<Warning | null>(null);
  const [dniDuplicado, setDniDuplicado] = useState<string | null>(null);

  function updatePaso<K extends keyof WizardData>(paso: K, field: string, value: string | string[] | boolean) {
    setData((prev) => ({ ...prev, [paso]: { ...(prev[paso] as object), [field]: value } }));
    if (errors[field]) setErrors((e) => { const c = { ...e }; delete c[field]; return c; });
  }

  function validateRequired(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.paso1.nombre.trim()) e.nombre = "El nombre es obligatorio";
      if (!data.paso1.apellidos.trim()) e.apellidos = "Los apellidos son obligatorios";
      if (!data.paso1.dni.trim()) e.dni = "El DNI es obligatorio";
    }
    if (s === 3) {
      if (!data.paso3.motivoConsulta.trim()) e.motivoConsulta = "El motivo de consulta es obligatorio";
    }
    return e;
  }

  function advanceStep() {
    setErrors({});
    setCompletedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
    setStep((s) => Math.min(s + 1, 6));
    setEditingStep(null);
    setWarning(null);
  }

  function goNext() {
    const e = validateRequired(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const camposVacios = getEmptyOptionalFields(step, data);
    if (camposVacios.length > 0) {
      setWarning({ campos: camposVacios, onContinuar: advanceStep });
      return;
    }
    advanceStep();
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
    setEditingStep(null);
    setWarning(null);
  }

  function jumpToStep(s: number) {
    setStep(s);
    setEditingStep(s);
    setWarning(null);
  }

  async function doSave() {
    setWarning(null);
    setSaving(true);
    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 409) {
        const json = await res.json();
        setDniDuplicado(json.pacienteId ?? "");
        setSaving(false);
        return;
      }
      if (!res.ok) throw new Error("Error al guardar");
      const paciente = await res.json();
      router.push(`/pacientes/${paciente.id}`);
    } catch {
      alert("Error al guardar el paciente. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit() {
    // Comprobar campos vacíos globales antes de guardar
    const allEmpty: string[] = [];
    for (let s = 1; s <= 5; s++) {
      allEmpty.push(...getEmptyOptionalFields(s, data));
    }
    if (allEmpty.length > 0) {
      setWarning({ campos: allEmpty, onContinuar: doSave });
      return;
    }
    doSave();
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Modal de advertencia campos vacíos */}
      {warning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-bold text-base" style={{ color: "#1a1a1a" }}>
                Campos sin completar
              </h3>
            </div>
            <p className="text-sm mb-3" style={{ color: "#6b7280" }}>
              Los siguientes campos están vacíos. ¿Quieres completarlos antes de continuar?
            </p>
            <ul className="mb-5 space-y-1">
              {warning.campos.map((c) => (
                <li key={c} className="text-sm flex items-center gap-2" style={{ color: "#374151" }}>
                  <span style={{ color: "#0891B2" }}>·</span> {c}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                className="btn-primary flex-1 justify-center"
                onClick={() => setWarning(null)}
              >
                Volver a completar
              </button>
              <button
                className="btn-secondary flex-1 justify-center"
                onClick={warning.onContinuar}
              >
                Continuar sin completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal DNI duplicado */}
      {dniDuplicado !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⛔</span>
              <h3 className="font-bold text-base" style={{ color: "#1a1a1a" }}>DNI ya registrado</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
              Ya existe un paciente con el DNI <strong style={{ color: "#1a1a1a" }}>{data.paso1.dni}</strong>. No se pueden crear duplicados.
            </p>
            <div className="flex gap-3">
              {dniDuplicado && (
                <Link
                  href={`/pacientes/${dniDuplicado}`}
                  className="btn-primary flex-1 justify-center"
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Ver paciente existente
                </Link>
              )}
              <button className="btn-secondary flex-1 justify-center" onClick={() => { setDniDuplicado(null); jumpToStep(1); }}>
                Cambiar DNI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#9ca3af" }}>
        <Link href="/pacientes" style={{ color: "#0891B2", textDecoration: "none" }}>Pacientes</Link>
        <span>/</span>
        <span>Nuevo paciente</span>
      </div>

      <WizardProgress
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={step === 6 ? jumpToStep : undefined}
      />

      {/* ─── PASO 1 ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <StepCard title="Datos del paciente" icon="👤">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre *" error={errors.nombre}>
              <input className="input-field" value={data.paso1.nombre} onChange={(e) => updatePaso("paso1", "nombre", e.target.value)} placeholder="Carmen" />
            </Field>
            <Field label="Apellidos *" error={errors.apellidos}>
              <input className="input-field" value={data.paso1.apellidos} onChange={(e) => updatePaso("paso1", "apellidos", e.target.value)} placeholder="García López" />
            </Field>
            <Field label="DNI / NIE *" error={errors.dni}>
              <input className="input-field" value={data.paso1.dni} onChange={(e) => updatePaso("paso1", "dni", e.target.value)} placeholder="12345678A" />
            </Field>
            <Field label="Teléfono">
              <input className="input-field" value={data.paso1.telefono} onChange={(e) => updatePaso("paso1", "telefono", e.target.value)} placeholder="600 000 000" type="tel" />
            </Field>
            <Field label="Email">
              <input className="input-field" value={data.paso1.email} onChange={(e) => updatePaso("paso1", "email", e.target.value)} placeholder="correo@ejemplo.com" type="email" />
            </Field>
            <Field label="Fecha de nacimiento">
              <input className="input-field" value={data.paso1.fechaNacimiento} onChange={(e) => updatePaso("paso1", "fechaNacimiento", e.target.value)} type="date" />
            </Field>
            <Field label="Población" className="sm:col-span-2">
              <input className="input-field" value={data.paso1.poblacion} onChange={(e) => updatePaso("paso1", "poblacion", e.target.value)} placeholder="Ciudad o municipio" />
            </Field>
          </div>
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: data.paso1.lopdFirmada ? "#ECFEFF" : "#fff8f0", border: `1px solid ${data.paso1.lopdFirmada ? "#86efac" : "#DDD8CE"}` }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.paso1.lopdFirmada}
                onChange={(e) => updatePaso("paso1", "lopdFirmada", e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                style={{ accentColor: "#10b981" }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Consentimiento de protección de datos (LOPD / RGPD)</p>
                <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                  El paciente ha sido informado y consiente el tratamiento de sus datos personales y de salud con fines de atención fisioterapéutica, conforme al Reglamento General de Protección de Datos (UE) 2016/679 y la Ley Orgánica 3/2018.
                </p>
              </div>
            </label>
          </div>
        </StepCard>
      )}

      {/* ─── PASO 2 ────────────────────────────────────────────────────── */}
      {step === 2 && (
        <StepCard title="Información personal" icon="💼">
          <Field label="Profesión (nivel de estrés)">
            <textarea className="textarea-field" rows={3} value={data.paso2.profesion} onChange={(e) => updatePaso("paso2", "profesion", e.target.value)} placeholder="Profesión y descripción del nivel de estrés laboral..." />
          </Field>
          <Field label="Alergias / Intolerancias">
            <textarea className="textarea-field" rows={3} value={data.paso2.alergias} onChange={(e) => updatePaso("paso2", "alergias", e.target.value)} placeholder="Alergias conocidas, intolerancias..." />
          </Field>
          <Field label="Ejercicio físico y frecuencia de entrenamiento">
            <textarea className="textarea-field" rows={3} value={data.paso2.ejercicioFisico} onChange={(e) => updatePaso("paso2", "ejercicioFisico", e.target.value)} placeholder="Tipo de ejercicio, días por semana, intensidad..." />
          </Field>
        </StepCard>
      )}

      {/* ─── PASO 3 ────────────────────────────────────────────────────── */}
      {step === 3 && (
        <StepCard title="Motivo de consulta" icon="🩺">
          <Field label="Motivo de consulta *" error={errors.motivoConsulta}>
            <textarea className="textarea-field" rows={8} value={data.paso3.motivoConsulta} onChange={(e) => updatePaso("paso3", "motivoConsulta", e.target.value)} placeholder="Describe el motivo de consulta del paciente..." />
          </Field>
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#F2EDE3", border: "1px solid #DDD8CE" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#0891B2" }}>📝 CHULETA — Aspectos a explorar</p>
            <ul className="space-y-1">
              {["Mecanismo lesional","Localización y extensión del dolor","Intensidad y tipo de dolor","Comportamiento 24h y estadio","Factores agravantes y de alivio","¿Cuál crees tú que es la causa de tu dolor?","¿Por qué crees que no estás mejorando?","Miedo y dudas sobre tu problema"].map((item) => (
                <li key={item} className="text-xs flex items-start gap-1.5" style={{ color: "#6b7280" }}>
                  <span style={{ color: "#0891B2" }}>·</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </StepCard>
      )}

      {/* ─── PASO 4 ────────────────────────────────────────────────────── */}
      {step === 4 && (
        <StepCard title="Antecedentes" icon="📋">
          <Field label="Antecedentes personales y familiares">
            <textarea className="textarea-field" rows={4} value={data.paso4.antecedentesPersonalesFamiliares} onChange={(e) => updatePaso("paso4", "antecedentesPersonalesFamiliares", e.target.value)} placeholder="Antecedentes relevantes personales y familiares..." />
          </Field>
          <Field label="Calidad del sueño">
            <textarea className="textarea-field" rows={2} value={data.paso4.calidadSueno} onChange={(e) => updatePaso("paso4", "calidadSueno", e.target.value)} placeholder="Horas de sueño, calidad, insomnio..." />
          </Field>
          <Field label="Patologías / Enfermedades">
            <textarea className="textarea-field" rows={4} value={data.paso4.patologias} onChange={(e) => updatePaso("paso4", "patologias", e.target.value)} placeholder="Enfermedades actuales o pasadas..." />
          </Field>
          <Field label="Tabaquismo">
            <input className="input-field" value={data.paso4.tabaquismo} onChange={(e) => updatePaso("paso4", "tabaquismo", e.target.value)} placeholder="No fumador / Fumador (X cig/día) / Ex-fumador..." />
          </Field>
          <Field label="Medicación">
            <textarea className="textarea-field" rows={3} value={data.paso4.medicacion} onChange={(e) => updatePaso("paso4", "medicacion", e.target.value)} placeholder="Medicación actual (nombre y dosis)..." />
          </Field>
          <Field label="Implantes metálicos">
            <textarea className="textarea-field" rows={2} value={data.paso4.implantesMetalicos} onChange={(e) => updatePaso("paso4", "implantesMetalicos", e.target.value)} placeholder="Prótesis, placas, tornillos, marcapasos, stent, DAI, DIU..." />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Embarazo / Lactancia">
              <input className="input-field" value={data.paso4.embarazoLactancia} onChange={(e) => updatePaso("paso4", "embarazoLactancia", e.target.value)} placeholder="No / Embarazada / Lactancia" />
            </Field>
            <Field label="Semanas de embarazo">
              <input className="input-field" value={data.paso4.semanasEmbarazo} onChange={(e) => updatePaso("paso4", "semanasEmbarazo", e.target.value)} placeholder="Número de semanas" />
            </Field>
          </div>
        </StepCard>
      )}

      {/* ─── PASO 5 ────────────────────────────────────────────────────── */}
      {step === 5 && (
        <StepCard title="Banderas y pruebas de imagen" icon="🚩">
          <div className="mb-6">
            <p className="section-title">🚩 Banderas rojas</p>
            <p className="text-xs mb-3" style={{ color: "#6b7280" }}>Marca si el paciente presenta alguna de estas señales de alerta</p>
            <div className="space-y-2.5">
              {BANDERAS_ROJAS_LISTA.map((bandera) => (
                <label key={bandera} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.paso5.banderasRojas.includes(bandera)}
                    onChange={(e) => {
                      const current = data.paso5.banderasRojas;
                      updatePaso("paso5", "banderasRojas", e.target.checked ? [...current, bandera] : current.filter((b) => b !== bandera));
                    }}
                    className="mt-0.5 h-4 w-4 rounded flex-shrink-0"
                    style={{ accentColor: "#0891B2" }}
                  />
                  <span className="text-sm" style={{ color: "#374151" }}>{bandera}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-4" style={{ borderTop: "1px solid #DDD8CE" }}>
            <p className="section-title">Pruebas de imagen</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tipo de prueba">
                <input className="input-field" value={data.paso5.pruebaTipo} onChange={(e) => updatePaso("paso5", "pruebaTipo", e.target.value)} placeholder="Radiografía, resonancia, eco..." />
              </Field>
              <Field label="Fecha de la prueba">
                <input className="input-field" value={data.paso5.pruebaFecha} onChange={(e) => updatePaso("paso5", "pruebaFecha", e.target.value)} type="date" />
              </Field>
            </div>
            <Field label="Diagnóstico">
              <textarea className="textarea-field" rows={4} value={data.paso5.pruebaDiagnostico} onChange={(e) => updatePaso("paso5", "pruebaDiagnostico", e.target.value)} placeholder="Resultado e interpretación de la prueba..." />
            </Field>
          </div>
        </StepCard>
      )}

      {/* ─── PASO 6: Revisión final ───────────────────────────────────── */}
      {step === 6 && !editingStep && (
        <div>
          <div className="card p-5 mb-4">
            <h2 className="text-lg font-bold mb-4" style={{ color: "#1a1a1a" }}>Revisión de la historia clínica</h2>
            <ReviewSection title="Datos del paciente" icon="👤" onEdit={() => jumpToStep(1)}>
              <ReviewRow label="Nombre" value={`${data.paso1.nombre} ${data.paso1.apellidos}`} />
              <ReviewRow label="DNI" value={data.paso1.dni} />
              <ReviewRow label="Email" value={data.paso1.email} />
              <ReviewRow label="Teléfono" value={data.paso1.telefono} />
              <ReviewRow label="Nacimiento" value={data.paso1.fechaNacimiento} />
              <ReviewRow label="Población" value={data.paso1.poblacion} />
            </ReviewSection>
            <ReviewSection title="Información personal" icon="💼" onEdit={() => jumpToStep(2)}>
              <ReviewRow label="Profesión" value={data.paso2.profesion} multiline />
              <ReviewRow label="Alergias" value={data.paso2.alergias} multiline />
              <ReviewRow label="Ejercicio" value={data.paso2.ejercicioFisico} multiline />
            </ReviewSection>
            <ReviewSection title="Motivo de consulta" icon="🩺" onEdit={() => jumpToStep(3)}>
              <ReviewRow label="Motivo" value={data.paso3.motivoConsulta} multiline />
            </ReviewSection>
            <ReviewSection title="Antecedentes" icon="📋" onEdit={() => jumpToStep(4)}>
              <ReviewRow label="Antecedentes" value={data.paso4.antecedentesPersonalesFamiliares} multiline />
              <ReviewRow label="Sueño" value={data.paso4.calidadSueno} multiline />
              <ReviewRow label="Patologías" value={data.paso4.patologias} multiline />
              <ReviewRow label="Tabaquismo" value={data.paso4.tabaquismo} />
              <ReviewRow label="Medicación" value={data.paso4.medicacion} multiline />
              <ReviewRow label="Implantes" value={data.paso4.implantesMetalicos} multiline />
              <ReviewRow label="Embarazo" value={data.paso4.embarazoLactancia} />
            </ReviewSection>
            <ReviewSection title="Banderas y pruebas" icon="🚩" onEdit={() => jumpToStep(5)}>
              <ReviewRow label="Banderas rojas" value={data.paso5.banderasRojas.length > 0 ? data.paso5.banderasRojas.join("\n") : "Ninguna"} multiline />
              <ReviewRow label="Prueba" value={data.paso5.pruebaTipo} />
              <ReviewRow label="Diagnóstico" value={data.paso5.pruebaDiagnostico} multiline />
            </ReviewSection>
          </div>
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={goBack}>Atrás</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Confirmar y guardar"}
            </button>
          </div>
        </div>
      )}

      {step === 6 && editingStep && (
        <div className="flex justify-end gap-3 mt-4">
          <button className="btn-secondary" onClick={() => { setStep(6); setEditingStep(null); }}>
            ← Volver a revisión
          </button>
        </div>
      )}

      {step < 6 && (
        <div className="flex justify-between mt-4">
          <button className="btn-secondary" onClick={goBack} disabled={step === 1}>← Atrás</button>
          <button className="btn-primary" onClick={goNext}>
            {step === 5 ? "Ver revisión →" : "Siguiente →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StepCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 mb-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-5" style={{ color: "#1a1a1a" }}>
        <span>{icon}</span>{title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, error, className }: { label: string; children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

function ReviewSection({ title, icon, onEdit, children }: { title: string; icon: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5" style={{ borderBottom: "1px solid #f3f4f6" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "#1a1a1a" }}>
          <span>{icon}</span>{title}
        </p>
        <button className="btn-ghost text-xs py-1 px-2" onClick={onEdit}>Editar</button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div className={`grid gap-1 ${multiline ? "" : "grid-cols-3"}`}>
      <p className="text-xs font-medium" style={{ color: "#9ca3af" }}>{label}</p>
      <p className={`text-sm ${multiline ? "mt-0.5" : "col-span-2"}`} style={{ color: "#374151", whiteSpace: multiline ? "pre-wrap" : "normal" }}>
        {value}
      </p>
    </div>
  );
}
