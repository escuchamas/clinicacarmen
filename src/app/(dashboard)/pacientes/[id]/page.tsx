"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Paciente, HistoriaClinica, TratamientoEvolucion, Cita, EstadoCita, ESTADO_CITA_LABELS, ESTADO_CITA_COLORS, PagoEstado, PAGO_LABELS, PAGO_COLORS, BANDERAS_ROJAS_LISTA } from "@/lib/types";

interface PacienteDetalle {
  paciente: Paciente;
  historia: HistoriaClinica | null;
}

interface EditForm {
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  poblacion: string;
}

export default function PacienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PacienteDetalle | null>(null);
  const [sesiones, setSesiones] = useState<TratamientoEvolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"registro" | "historia" | "tratamiento" | "citas">("registro");
  const [editingSesion, setEditingSesion] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [showCitaForm, setShowCitaForm] = useState(false);
  const [citaForm, setCitaForm] = useState({ fecha: "", hora: "10:00", duracion: 60, motivo: "", notas: "" });
  const [savingCita, setSavingCita] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ nombre: "", apellidos: "", dni: "", email: "", telefono: "", fechaNacimiento: "", poblacion: "" });
  const [savingEdit2, setSavingEdit2] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [detRes, sesRes, citasRes] = await Promise.all([
        fetch(`/api/pacientes/${id}`),
        fetch(`/api/pacientes/${id}/sesiones`),
        fetch(`/api/pacientes/${id}/citas`),
      ]);
      const detData = await detRes.json();
      const sesData = await sesRes.json();
      const citasData = await citasRes.json();
      setData(detData);
      setSesiones(Array.isArray(sesData) ? sesData : []);
      setCitas(Array.isArray(citasData) ? citasData : []);
      setLoading(false);
    }
    load();
  }, [id]);

  function openEditModal(paciente: Paciente) {
    setEditForm({
      nombre: paciente.nombre,
      apellidos: paciente.apellidos,
      dni: paciente.dni,
      email: paciente.email ?? "",
      telefono: paciente.telefono ?? "",
      fechaNacimiento: paciente.fechaNacimiento ?? "",
      poblacion: paciente.poblacion ?? "",
    });
    setShowEditModal(true);
  }

  async function saveEditPaciente() {
    setSavingEdit2(true);
    const res = await fetch(`/api/pacientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seccion: "datos", datos: editForm }),
    });
    if (res.ok) {
      setData(prev => prev ? { ...prev, paciente: { ...prev.paciente, ...editForm } } : prev);
      setShowEditModal(false);
    }
    setSavingEdit2(false);
  }

  async function handleEliminar() {
    if (!confirm("¿Seguro que quieres eliminar este paciente? Se borrarán todos sus datos, historia clínica y sesiones. Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/pacientes");
    } else {
      alert("Error al eliminar el paciente.");
      setDeleting(false);
    }
  }

  async function saveCita() {
    if (!citaForm.fecha || !citaForm.hora) return;
    setSavingCita(true);
    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...citaForm, pacienteId: id }),
    });
    if (res.ok) {
      const nueva = await res.json();
      setCitas(prev => [nueva, ...prev]);
      setShowCitaForm(false);
      setCitaForm({ fecha: "", hora: "10:00", duracion: 60, motivo: "", notas: "" });
    }
    setSavingCita(false);
  }

  async function cambiarEstadoCita(citaId: string, estado: EstadoCita) {
    await fetch("/api/citas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "estado", id: citaId, estado }),
    });
    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado } : c));
  }

  async function cambiarPagoCita(citaId: string, pagoEstado: PagoEstado) {
    await fetch("/api/citas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pago", id: citaId, pagoEstado }),
    });
    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, pagoEstado } : c));
  }

  async function uploadImagen(file: File) {
    setUploadingImg(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("pacienteId", id);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { setUploadError(json.error ?? "Error al subir"); return; }
      await fetch(`/api/pacientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seccion: "historia", datos: { pruebaImagenUrl: json.url } }),
      });
      setData((prev) => prev ? { ...prev, historia: prev.historia ? { ...prev.historia, pruebaImagenUrl: json.url } : prev.historia } : prev);
    } catch {
      setUploadError("Error al subir la imagen");
    } finally {
      setUploadingImg(false);
    }
  }

  async function saveEditSesion() {
    if (!editingSesion) return;
    setSavingEdit(true);
    await fetch(`/api/pacientes/${id}/sesiones`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sesionId: editingSesion, contenido: editContent }),
    });
    setSesiones((prev) =>
      prev.map((s) => (s.id === editingSesion ? { ...s, contenido: editContent } : s))
    );
    setEditingSesion(null);
    setSavingEdit(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#2D7D5E", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20" style={{ color: "#6b7280" }}>Paciente no encontrado</div>;
  }

  const { paciente, historia } = data;
  const totalSesiones = sesiones.length + (historia ? 1 : 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="card p-6 w-full max-w-lg">
            <h3 className="font-bold text-base mb-4" style={{ color: "#1a1a1a" }}>Editar datos del paciente</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre *</label>
                  <input className="input-field" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Apellidos *</label>
                  <input className="input-field" value={editForm.apellidos} onChange={e => setEditForm(f => ({ ...f, apellidos: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">DNI / NIE</label>
                <input className="input-field" value={editForm.dni} onChange={e => setEditForm(f => ({ ...f, dni: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input-field" value={editForm.telefono} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fecha de nacimiento</label>
                  <input className="input-field" type="date" value={editForm.fechaNacimiento} onChange={e => setEditForm(f => ({ ...f, fechaNacimiento: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Población</label>
                  <input className="input-field" value={editForm.poblacion} onChange={e => setEditForm(f => ({ ...f, poblacion: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-primary flex-1 justify-center" onClick={saveEditPaciente} disabled={savingEdit2 || !editForm.nombre || !editForm.apellidos}>
                {savingEdit2 ? "Guardando..." : "Guardar cambios"}
              </button>
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-sm" style={{ color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#2D7D5E", textDecoration: "none" }}>Pacientes</Link>
        <span>/</span>
        <span>{paciente.nombre} {paciente.apellidos}</span>
      </div>

      {/* Cabecera del paciente */}
      <div className="card p-5 mb-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: "#2D7D5E" }}
          >
            {paciente.nombre.charAt(0)}{paciente.apellidos.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>
                {paciente.nombre} {paciente.apellidos}
              </h1>
              <LopdBadge
                firmada={paciente.lopdFirmada}
                fecha={paciente.lopdFecha}
                onFirmar={async () => {
                  await fetch(`/api/pacientes/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ seccion: "datos", datos: { lopdFirmada: true } }),
                  });
                  setData((prev) => prev ? { ...prev, paciente: { ...prev.paciente, lopdFirmada: true, lopdFecha: new Date().toISOString().split("T")[0] } } : prev);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: "#6b7280" }}>
              {paciente.dni && <span>DNI: {paciente.dni}</span>}
              {paciente.email && <span>{paciente.email}</span>}
              {paciente.telefono && <span>{paciente.telefono}</span>}
              {paciente.poblacion && <span>{paciente.poblacion}</span>}
            </div>
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: "#2D7D5E" }}>{totalSesiones}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>sesiones</p>
              </div>
              {paciente.fechaNacimiento && (
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>
                    {paciente.fechaNacimiento}
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>nacimiento</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              className="btn-ghost text-sm py-1.5 px-3"
              onClick={() => openEditModal(paciente)}
            >
              Editar
            </button>
            <button
              onClick={handleEliminar}
              disabled={deleting}
              className="text-sm py-1.5 px-3 rounded-lg font-medium"
              style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5", cursor: deleting ? "not-allowed" : "pointer" }}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ backgroundColor: "white", border: "1px solid #e2ddd3" }}>
        {([
          ["registro", "Registro de sesiones"],
          ["historia", "Historia clínica"],
          ["tratamiento", "Tratamiento y evolución"],
          ["citas", "Citas"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: tab === key ? "#2D7D5E" : "transparent",
              color: tab === key ? "white" : "#6b7280",
              border: "none",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── TAB: Registro de sesiones ──────────────────────────────────── */}
      {tab === "registro" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#1a1a1a" }}>Registro de sesiones</h2>
            <Link
              href={`/pacientes/${id}/sesion/nueva`}
              className="btn-primary text-sm"
              style={{ textDecoration: "none" }}
            >
              + Nueva sesión
            </Link>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-white w-32">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-white">Motivo de consulta</th>
                </tr>
              </thead>
              <tbody>
                {historia && (
                  <tr
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#a7f3d0" }}
                    onClick={() => setTab("historia")}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "#1a1a1a" }}>
                      {historia.fechaCreacion || paciente.fechaAlta}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold underline" style={{ color: "#1a1a1a" }}>
                      1ª SESIÓN — Historia Clínica
                    </td>
                  </tr>
                )}
                {sesiones.map((s, i) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: i % 2 === 0 ? "#d1fae5" : "#f0fdf4" }}
                    onClick={() => {
                      setTab("tratamiento");
                      setEditingSesion(null);
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "#1a1a1a" }}>
                      {s.fecha}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold underline" style={{ color: "#1a1a1a" }}>
                      {s.nSesion}ª SESIÓN — Tratamiento y evolución
                    </td>
                  </tr>
                ))}
                {!historia && sesiones.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-sm" style={{ color: "#9ca3af" }}>
                      No hay sesiones registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: Historia clínica ──────────────────────────────────────── */}
      {tab === "historia" && (
        <div>
          {historia ? (
            <div className="space-y-4">
              <HistoriaSection title="Profesión / Nivel de estrés" value={historia.profesion} />
              <HistoriaSection title="Alergias / Intolerancias" value={historia.alergias} />
              <HistoriaSection title="Ejercicio físico y frecuencia" value={historia.ejercicioFisico} />
              <HistoriaSection title="Motivo de consulta" value={historia.motivoConsulta} large />
              <HistoriaSection title="Antecedentes personales y familiares" value={historia.antecedentesPersonalesFamiliares} large />
              <HistoriaSection title="Calidad del sueño" value={historia.calidadSueno} />
              <HistoriaSection title="Patologías / Enfermedades" value={historia.patologias} large />
              <HistoriaSection title="Tabaquismo" value={historia.tabaquismo} />
              <HistoriaSection title="Medicación" value={historia.medicacion} large />
              <HistoriaSection title="Implantes metálicos" value={historia.implantesMetalicos} large />
              <HistoriaSection title="Embarazo / Lactancia" value={historia.embarazoLactancia} />
              {historia.banderasRojas?.length > 0 && (
                <div className="card p-4" style={{ border: "1px solid #fca5a5" }}>
                  <p className="section-title" style={{ color: "#ef4444" }}>🚩 Banderas rojas</p>
                  <ul className="space-y-1">
                    {historia.banderasRojas.map((b) => (
                      <li key={b} className="text-sm flex items-start gap-2">
                        <span style={{ color: "#ef4444" }}>▶</span>
                        <span style={{ color: "#374151" }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="section-title" style={{ marginBottom: 0 }}>Pruebas de imagen</p>
                  <label
                    className="btn-ghost text-xs py-1 px-3"
                    style={{ cursor: uploadingImg ? "default" : "pointer", opacity: uploadingImg ? 0.6 : 1 }}
                  >
                    {uploadingImg ? "Subiendo..." : historia.pruebaImagenUrl ? "Reemplazar archivo" : "+ Subir archivo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                      style={{ display: "none" }}
                      disabled={uploadingImg}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImagen(f); e.target.value = ""; }}
                    />
                  </label>
                </div>
                {uploadError && <p className="text-xs mb-2" style={{ color: "#ef4444" }}>{uploadError}</p>}
                {historia.pruebaTipo && <p className="text-sm" style={{ color: "#6b7280" }}><strong>Tipo:</strong> {historia.pruebaTipo}</p>}
                {historia.pruebaFecha && <p className="text-sm" style={{ color: "#6b7280" }}><strong>Fecha:</strong> {historia.pruebaFecha}</p>}
                {historia.pruebaDiagnostico && <p className="text-sm mt-1" style={{ color: "#374151", whiteSpace: "pre-wrap" }}>{historia.pruebaDiagnostico}</p>}
                {historia.pruebaImagenUrl && (
                  <div className="mt-3">
                    {historia.pruebaImagenUrl.endsWith(".pdf") ? (
                      <a href={historia.pruebaImagenUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium"
                        style={{ color: "#2D7D5E", textDecoration: "underline" }}>
                        Ver PDF de la prueba
                      </a>
                    ) : (
                      <a href={historia.pruebaImagenUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={historia.pruebaImagenUrl}
                          alt="Prueba de imagen"
                          style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8, border: "1px solid #e2ddd3", objectFit: "contain" }}
                        />
                      </a>
                    )}
                  </div>
                )}
                {!historia.pruebaTipo && !historia.pruebaImagenUrl && (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>No hay pruebas de imagen registradas</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-sm" style={{ color: "#6b7280" }}>No hay historia clínica registrada</p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Tratamiento y evolución ───────────────────────────────── */}
      {tab === "tratamiento" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#1a1a1a" }}>Tratamiento y evolución</h2>
            <Link href={`/pacientes/${id}/sesion/nueva`} className="btn-primary text-sm" style={{ textDecoration: "none" }}>
              + Nueva sesión
            </Link>
          </div>

          {sesiones.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-sm" style={{ color: "#6b7280" }}>Aún no hay registros de tratamiento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sesiones.map((s) => {
                const citaDelDia = citas.find(c => c.fecha === s.fecha);
                const mostrarCobro = citaDelDia &&
                  (citaDelDia.fecha < new Date().toISOString().split("T")[0] || citaDelDia.estado === "vino") &&
                  citaDelDia.estado !== "cancelada" && citaDelDia.estado !== "no_vino";
                return (
                  <div key={s.id} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#2D7D5E" }}>
                          Sesión {s.nSesion}
                        </span>
                        <span className="text-sm font-medium" style={{ color: "#6b7280" }}>{s.fecha}</span>
                        {citaDelDia && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: PAGO_COLORS[citaDelDia.pagoEstado ?? "sin_pagar"] + "20", color: PAGO_COLORS[citaDelDia.pagoEstado ?? "sin_pagar"] }}>
                            {PAGO_LABELS[citaDelDia.pagoEstado ?? "sin_pagar"]}
                          </span>
                        )}
                      </div>
                      {editingSesion !== s.id && (
                        <button className="btn-ghost text-xs py-1 px-3" onClick={() => { setEditingSesion(s.id); setEditContent(s.contenido); }}>
                          Editar
                        </button>
                      )}
                    </div>

                    {editingSesion === s.id ? (
                      <div>
                        <textarea className="textarea-field" rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <div className="flex gap-2 mt-2 justify-end">
                          <button className="btn-secondary text-sm" onClick={() => setEditingSesion(null)}>Cancelar</button>
                          <button className="btn-primary text-sm" onClick={saveEditSesion} disabled={savingEdit}>
                            {savingEdit ? "Guardando..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "#374151", whiteSpace: "pre-wrap" }}>
                        {s.contenido || <span style={{ color: "#9ca3af" }}>Sin contenido</span>}
                      </p>
                    )}

                    {mostrarCobro && citaDelDia && (
                      <div className="flex gap-1 mt-3 flex-wrap items-center" style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.5rem" }}>
                        <span className="text-xs font-semibold mr-1" style={{ color: "#9ca3af" }}>Cobro:</span>
                        {(["sin_pagar", "parcial", "pagado"] as PagoEstado[]).map(p => (
                          <button key={p} onClick={() => cambiarPagoCita(citaDelDia.id, p)}
                            className="text-xs px-2.5 py-1 rounded-full transition-all"
                            style={{
                              backgroundColor: citaDelDia.pagoEstado === p ? PAGO_COLORS[p] : "#f3f4f6",
                              color: citaDelDia.pagoEstado === p ? "white" : "#6b7280",
                              border: "none", cursor: "pointer", fontWeight: citaDelDia.pagoEstado === p ? 600 : 400,
                            }}>
                            {PAGO_LABELS[p]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* ─── TAB: Citas ─────────────────────────────────────────────────── */}
      {tab === "citas" && (
        <div>
          {showCitaForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
              <div className="card p-6 w-full max-w-md">
                <h3 className="font-bold text-base mb-4" style={{ color: "#1a1a1a" }}>Nueva cita</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Fecha *</label>
                    <input className="input-field" type="date" value={citaForm.fecha} onChange={e => setCitaForm(f => ({ ...f, fecha: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Hora *</label>
                      <input className="input-field" type="time" value={citaForm.hora} onChange={e => setCitaForm(f => ({ ...f, hora: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Duración</label>
                      <select className="input-field" value={citaForm.duracion} onChange={e => setCitaForm(f => ({ ...f, duracion: parseInt(e.target.value) }))}>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                        <option value={90}>90 min</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Motivo</label>
                    <input className="input-field" value={citaForm.motivo} onChange={e => setCitaForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Motivo de la cita..." />
                  </div>
                  <div>
                    <label className="label">Notas</label>
                    <textarea className="textarea-field" rows={2} value={citaForm.notas} onChange={e => setCitaForm(f => ({ ...f, notas: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="btn-primary flex-1 justify-center" onClick={saveCita} disabled={savingCita || !citaForm.fecha}>
                    {savingCita ? "Guardando..." : "Guardar"}
                  </button>
                  <button className="btn-secondary" onClick={() => setShowCitaForm(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#1a1a1a" }}>Citas del paciente</h2>
            <button className="btn-primary text-sm" onClick={() => setShowCitaForm(true)}>+ Nueva cita</button>
          </div>

          {citas.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-sm" style={{ color: "#6b7280" }}>No hay citas registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map(cita => (
                <div key={cita.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
                          {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span className="text-sm" style={{ color: "#6b7280" }}>· {cita.hora} ({cita.duracion} min)</span>
                      </div>
                      {cita.motivo && <p className="text-sm" style={{ color: "#374151" }}>{cita.motivo}</p>}
                      {cita.notas && <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{cita.notas}</p>}
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2"
                      style={{ backgroundColor: ESTADO_CITA_COLORS[cita.estado] + "20", color: ESTADO_CITA_COLORS[cita.estado] }}>
                      {ESTADO_CITA_LABELS[cita.estado]}
                    </span>
                  </div>

                  {/* Estado */}
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {(["agendada", "vino", "no_vino", "cancelada"] as EstadoCita[]).map(e => (
                      <button key={e} onClick={() => cambiarEstadoCita(cita.id, e)}
                        className="text-xs px-2.5 py-1 rounded-full transition-all"
                        style={{
                          backgroundColor: cita.estado === e ? ESTADO_CITA_COLORS[e] : "#f3f4f6",
                          color: cita.estado === e ? "white" : "#6b7280",
                          border: "none", cursor: "pointer", fontWeight: cita.estado === e ? 600 : 400,
                        }}>
                        {ESTADO_CITA_LABELS[e]}
                      </button>
                    ))}
                  </div>

                  {/* Cobro — visible en citas pasadas o que vinieron, salvo cancelada/no_vino */}
                  {(cita.fecha < new Date().toISOString().split("T")[0] || cita.estado === "vino") &&
                    cita.estado !== "cancelada" && cita.estado !== "no_vino" && (
                    <div className="flex gap-1 mt-2 flex-wrap items-center" style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.5rem" }}>
                      <span className="text-xs font-semibold mr-1" style={{ color: "#9ca3af" }}>Cobro:</span>
                      {(["sin_pagar", "parcial", "pagado"] as PagoEstado[]).map(p => (
                        <button key={p} onClick={() => cambiarPagoCita(cita.id, p)}
                          className="text-xs px-2.5 py-1 rounded-full transition-all"
                          style={{
                            backgroundColor: cita.pagoEstado === p ? PAGO_COLORS[p] : "#f3f4f6",
                            color: cita.pagoEstado === p ? "white" : "#6b7280",
                            border: "none", cursor: "pointer", fontWeight: cita.pagoEstado === p ? 600 : 400,
                          }}>
                          {PAGO_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HistoriaSection({ title, value, large }: { title: string; value: string; large?: boolean }) {
  if (!value) return null;
  return (
    <div className="card p-4">
      <p className="section-title">{title}</p>
      <p className={`text-sm ${large ? "whitespace-pre-wrap" : ""}`} style={{ color: "#374151" }}>{value}</p>
    </div>
  );
}

function LopdBadge({ firmada, fecha, onFirmar }: { firmada: boolean; fecha?: string; onFirmar: () => void }) {
  if (firmada) {
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        title={fecha ? `Firmado el ${fecha}` : "Consentimiento firmado"}
        style={{ backgroundColor: "#dcfce7", color: "#16a34a", cursor: "default" }}
      >
        ✓ LOPD firmada
      </span>
    );
  }
  return (
    <button
      onClick={onFirmar}
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "none", cursor: "pointer" }}
      title="Marcar consentimiento como firmado"
    >
      ⚠ LOPD pendiente
    </button>
  );
}
