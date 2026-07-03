"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { BlogPost } from "@/lib/db";

const AQUA  = "#8E7D6B";
const DARK  = "#1C1410";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export default function EditarPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [extracto, setExtracto] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [publicado, setPublicado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then(r => r.json())
      .then((post: BlogPost) => {
        setTitulo(post.titulo);
        setSlug(post.slug);
        setExtracto(post.extracto || "");
        setContenido(post.contenido);
        setImagenUrl(post.imagenUrl || "");
        setPublicado(post.publicado);
      })
      .catch(() => setError("Error cargando artículo"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setImagenUrl(url);
    } catch {
      alert("Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !slug.trim() || !contenido.trim()) {
      setError("Título, slug y contenido son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo.trim(), slug: slug.trim(), extracto: extracto.trim(), contenido: contenido.trim(), imagenUrl: imagenUrl || null, publicado }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      router.push("/blog");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>Cargando artículo…</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 780, margin: "0 auto" }}>

      <div style={{ marginBottom: "1.5rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "0.875rem", cursor: "pointer", padding: 0, marginBottom: "0.75rem" }}>
          ← Volver al blog
        </button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>Editar artículo</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", padding: "0.875rem 1rem", color: "#dc2626", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: DARK, marginBottom: "0.375rem" }}>Título *</label>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #DCC8B2", fontSize: "1rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: DARK, marginBottom: "0.375rem" }}>
            URL (slug) *
            <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: "0.5rem" }}>— /blog/{slug || "…"}</span>
          </label>
          <input
            value={slug}
            onChange={e => setSlug(toSlug(e.target.value))}
            required
            style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #DCC8B2", fontSize: "0.9375rem", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: DARK, marginBottom: "0.375rem" }}>
            Extracto <span style={{ fontWeight: 400, color: "#9ca3af" }}>(resumen breve)</span>
          </label>
          <textarea
            value={extracto}
            onChange={e => setExtracto(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #DCC8B2", fontSize: "0.9375rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: DARK, marginBottom: "0.375rem" }}>Imagen de portada</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }} />
          {uploading && <p style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Subiendo imagen…</p>}
          {imagenUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
              <img src={imagenUrl} alt="preview" style={{ height: 72, width: 120, objectFit: "cover", borderRadius: "0.375rem", border: "1px solid #DCC8B2" }} />
              <button type="button" onClick={() => setImagenUrl("")} style={{ fontSize: "0.75rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>Quitar</button>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: DARK, marginBottom: "0.375rem" }}>
            Contenido * <span style={{ fontWeight: 400, color: "#9ca3af" }}>(párrafos separados por línea en blanco)</span>
          </label>
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            rows={14}
            required
            style={{ width: "100%", padding: "0.75rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #DCC8B2", fontSize: "0.9375rem", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
          <div
            onClick={() => setPublicado(p => !p)}
            style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: publicado ? AQUA : "#d1d5db", position: "relative", transition: "background-color 0.2s", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", top: 3, left: publicado ? 23 : 3, width: 18, height: 18, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: DARK }}>
            {publicado ? "Publicado (visible en la web)" : "Borrador (solo tú lo ves)"}
          </span>
        </label>

        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{ flex: 1, backgroundColor: saving ? "#9ca3af" : AQUA, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.75rem", borderRadius: "0.5rem", border: "none", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: "0.75rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #DCC8B2", backgroundColor: "white", color: "#6b7280", fontWeight: 600, fontSize: "0.9375rem", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
