import { getBlogPostBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/app/_components/PublicHeader";
import type { Metadata } from "next";

const BRAND = "#8E7D6B";
const DARK  = "#1C1410";
const CREAM = "#F2ECE6";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: `${post.titulo} · ViaNova Fisioterapia`,
    description: post.extracto || undefined,
    openGraph: post.imagenUrl ? { images: [post.imagenUrl] } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.contenido.split(/\n\n+/).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white", color: DARK }}>

      <PublicHeader activePath="/blog" />

      {/* Hero imagen */}
      {post.imagenUrl && (
        <div style={{ width: "100%", maxHeight: 420, overflow: "hidden" }}>
          <img src={post.imagenUrl} alt={post.titulo} style={{ width: "100%", height: 420, objectFit: "cover" }} />
        </div>
      )}

      {/* Contenido */}
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: "1.5rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Inicio</Link>
          {" / "}
          <Link href="/blog" style={{ color: "#9ca3af", textDecoration: "none" }}>Blog</Link>
          {" / "}
          <span>{post.titulo}</span>
        </nav>

        {/* Fecha */}
        <p style={{ fontSize: "0.8125rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
          {post.createdAt}
        </p>

        {/* Título */}
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "2rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>
          {post.titulo}
        </h1>

        {/* Extracto */}
        {post.extracto && (
          <p style={{ fontSize: "1.125rem", color: "#4b5563", lineHeight: 1.7, marginBottom: "2rem", borderLeft: `3px solid ${BRAND}`, paddingLeft: "1.25rem" }}>
            {post.extracto}
          </p>
        )}

        {/* Cuerpo */}
        <div style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "#374151" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: "1.5rem" }}>{p}</p>
          ))}
        </div>

        {/* Firma autora */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #DCC8B2", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo-isotipo.jpeg" alt="Carmen Gómez" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: DARK }}>Carmen Gómez</p>
            <p style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Fisioterapeuta · ViaNova Campillos</p>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section style={{ backgroundColor: CREAM, padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "0.75rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>
          ¿Quieres mejorar tu bienestar?
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "1.75rem", maxWidth: 480, margin: "0 auto 1.75rem" }}>
          Reserva tu cita en ViaNova y recibe atención personalizada de Carmen.
        </p>
        <Link href="/pedir-cita" style={{ display: "inline-block", backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none" }}>
          Reservar cita →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: DARK, color: "white", padding: "2rem 1.5rem", textAlign: "center" }}>
        <Link href="/">
          <div style={{ display: "inline-block", backgroundColor: CREAM, padding: "0.4rem 0.75rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
            <img src="/brand-logo.jpeg" alt="ViaNova · Clínica de Fisioterapia" style={{ height: 28, display: "block" }} />
          </div>
        </Link>
        <p style={{ color: "#6b7280", fontSize: "0.8125rem" }}>© {new Date().getFullYear()} ViaNova · Clínica de Fisioterapia, Campillos</p>
      </footer>

    </div>
  );
}
