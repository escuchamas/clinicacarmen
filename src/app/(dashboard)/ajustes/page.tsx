"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Upload, FileText, X } from "lucide-react";

const AQUA = "#0D9488";

interface ConsentDoc {
  id: string;
  nombre: string;
  url: string;
  createdAt: string;
}

export default function AjustesPage() {
  const [docs, setDocs] = useState<ConsentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [nombre, setNombre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    const res = await fetch("/api/consentimientos");
    const data = await res.json();
    setDocs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadDocs(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  async function handleUpload() {
    if (!nombre.trim() || !file) {
      setUploadError("Pon un nombre y selecciona un archivo PDF.");
      return;
    }
    setUploadError("");
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", "consentimientos");

    const upRes = await fetch("/api/upload", { method: "POST", body: form });
    if (!upRes.ok) {
      const d = await upRes.json().catch(() => ({}));
      setUploadError(d.error ?? "Error al subir el archivo");
      setUploading(false);
      return;
    }
    const { url } = await upRes.json();

    const saveRes = await fetch("/api/consentimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), url }),
    });

    setUploading(false);
    if (saveRes.ok) {
      setShowUpload(false);
      setNombre("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadDocs();
      showToast("Consentimiento guardado correctamente");
    } else {
      const d = await saveRes.json().catch(() => ({}));
      setUploadError(d.error ?? "Error al guardar");
    }
  }

  async function handleDelete(id: string, docNombre: string) {
    if (!confirm(`¿Eliminar "${docNombre}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/consentimientos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocs(prev => prev.filter(d => d.id !== id));
      showToast("Documento eliminado");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-bold text-xl" style={{ color: "#1a1a1a" }}>Ajustes</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Configura documentos y opciones del sistema</p>
      </div>

      {/* Sección consentimientos */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-base" style={{ color: "#1a1a1a" }}>Consentimientos informados</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>PDFs que puedes enviar a los pacientes desde su perfil</p>
          </div>
          <button
            onClick={() => { setShowUpload(true); setUploadError(""); setNombre(""); setFile(null); }}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: AQUA, color: "white", border: "none", cursor: "pointer" }}
          >
            <Upload size={14} />
            Subir PDF
          </button>
        </div>

        {/* Formulario de subida */}
        {showUpload && (
          <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: "#f9fafb", border: "1px solid #e2ddd3" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-sm" style={{ color: "#1a1a1a" }}>Nuevo consentimiento</p>
              <button onClick={() => setShowUpload(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Nombre del documento *</label>
                <input
                  className="input-field"
                  placeholder="Ej: Punción Seca"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Archivo PDF *</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="input-field"
                  style={{ paddingTop: "0.375rem" }}
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {uploadError && (
                <p className="text-xs" style={{ color: "#dc2626" }}>{uploadError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                  style={{ opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? "Subiendo..." : "Guardar"}
                </button>
                <button className="btn-secondary" onClick={() => setShowUpload(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de documentos */}
        {loading ? (
          <p className="text-sm py-4 text-center" style={{ color: "#9ca3af" }}>Cargando...</p>
        ) : docs.length === 0 ? (
          <div className="py-8 text-center">
            <FileText size={32} strokeWidth={1.25} className="mx-auto mb-2" style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af" }}>No hay consentimientos guardados</p>
            <p className="text-xs mt-1" style={{ color: "#d1d5db" }}>Sube el primer PDF con el botón de arriba</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fef2f2" }}>
                  <FileText size={16} style={{ color: "#ef4444" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#1a1a1a" }}>{doc.nombre}</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>Subido el {doc.createdAt}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded-md font-medium flex-shrink-0"
                  style={{ color: AQUA, border: `1px solid ${AQUA}`, textDecoration: "none" }}
                >
                  Ver
                </a>
                <button
                  onClick={() => handleDelete(doc.id, doc.nombre)}
                  className="flex-shrink-0 p-1.5 rounded-lg"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 rounded-xl px-5 py-3 shadow-xl flex items-center gap-2" style={{ transform: "translateX(-50%)", backgroundColor: "#2D7D5E", color: "white" }}>
          <span style={{ fontSize: 16 }}>✓</span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
