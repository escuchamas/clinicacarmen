"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/db";

const AQUA     = "#8E7D6B";
const AQUA_D   = "#735E52";
const CREAM    = "#F2ECE6";
const DARK     = "#1C1410";

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data);
    } catch {
      setError("Error cargando posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, titulo: string) {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Error al eliminar");
    } finally {
      setDeleting(null);
    }
  }

  async function togglePublicado(post: BlogPost) {
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, publicado: !post.publicado }),
      });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, publicado: !p.publicado } : p));
    } catch {
      alert("Error actualizando estado");
    }
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>Blog</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            {posts.length} artículo{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/entradas/nuevo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.5rem 1.25rem", borderRadius: "0.5rem", textDecoration: "none" }}>
          + Nuevo artículo
        </Link>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <div className="card" style={{ display: "inline-block", padding: "1rem 2rem" }}>Cargando…</div>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", padding: "1rem", color: "#dc2626", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Todavía no hay artículos.</p>
          <Link href="/entradas/nuevo" style={{ color: AQUA, fontWeight: 600, textDecoration: "none" }}>Crea el primero →</Link>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {posts.map(post => (
            <div key={post.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>

              {/* Imagen miniatura */}
              <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: "0.5rem", overflow: "hidden", backgroundColor: CREAM }}>
                {post.imagenUrl ? (
                  <img src={post.imagenUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src="/logo-isotipo.jpeg" alt="" style={{ height: 32, opacity: 0.3 }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 600, color: DARK, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.titulo}</h2>
                  <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 999, backgroundColor: post.publicado ? "#dcfce7" : "#f3f4f6", color: post.publicado ? "#16a34a" : "#9ca3af" }}>
                    {post.publicado ? "● Publicado" : "○ Borrador"}
                  </span>
                </div>
                {post.extracto && (
                  <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: "0.25rem 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.extracto}</p>
                )}
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.25rem 0 0" }}>{post.createdAt} · /blog/{post.slug}</p>
              </div>

              {/* Acciones */}
              <div style={{ flexShrink: 0, display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => togglePublicado(post)}
                  style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: "0.375rem", border: `1px solid ${post.publicado ? "#fca5a5" : "#A8B89A"}`, backgroundColor: "transparent", color: post.publicado ? "#dc2626" : "#527044", cursor: "pointer" }}
                >
                  {post.publicado ? "Ocultar" : "Publicar"}
                </button>
                <Link href={`/entradas/${post.id}/editar`} style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: "0.375rem", border: `1px solid ${AQUA}`, color: AQUA, textDecoration: "none" }}>
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.titulo)}
                  disabled={deleting === post.id}
                  style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #fca5a5", backgroundColor: "transparent", color: deleting === post.id ? "#9ca3af" : "#dc2626", cursor: "pointer" }}
                >
                  {deleting === post.id ? "…" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
