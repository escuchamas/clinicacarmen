import { getBlogPostBySlug, getBlogPosts } from "@/lib/db";
import Link from "next/link";
import PublicHeader from "@/app/_components/PublicHeader";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: `${post.titulo} · Carmen Gómez Fisioterapia`,
    description: post.extracto || undefined,
    openGraph: {
      title: post.titulo,
      description: post.extracto || undefined,
      images: post.imagenUrl ? [post.imagenUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts(true);
  return posts.map(p => ({ slug: p.slug }));
}

const BRAND = "#8E7D6B";
const DARK  = "#1C1410";

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.contenido.split(/\n\n+/).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white", color: DARK }}>

      <PublicHeader activePath="/blog" />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: "#F2ECE6", padding: "0.75rem 1.5rem", borderBottom: "1px solid #DCC8B2" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8125rem", color: "#6b7280" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Inicio</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: "#6b7280", textDecoration: "none" }}>Blog</Link>
          <span>›</span>
          <span style={{ color: BRAND }}>{post.titulo}</span>
        </div>
      </div>

      {/* Imagen portada */}
      {post.imagenUrl && (
        <div style={{ width: "100%", maxHeight: 420, overflow: "hidden", backgroundColor: "#F2ECE6" }}>
          <img src={post.imagenUrl} alt={post.titulo} style={{ width: "100%", height: 420, objectFit: "cover" }} />
        </div>
      )}

      {/* Artículo */}
      <article style={{ maxWidth: 780, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

        {/* Meta */}
        <p style={{ fontSize: "0.8125rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>{post.createdAt}</p>

        {/* Título */}
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>
          {post.titulo}
        </h1>

        {/* Extracto destacado */}
        {post.extracto && (
          <p style={{ fontSize: "1.125rem", color: "#4b5563", lineHeight: 1.7, borderLeft: `4px solid ${BRAND}`, paddingLeft: "1.25rem", marginBottom: "2.5rem", fontStyle: "italic" }}>
            {post.extracto}
          </p>
        )}

        {/* Contenido */}
        <div style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "#374151" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: "1.25rem" }}>{p}</p>
          ))}
        </div>

        {/* Firma */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #DCC8B2", display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src="/logo-isotipo.jpeg" alt="Carmen Gómez" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid #DCC8B2` }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: DARK, margin: 0 }}>Carmen Gómez</p>
            <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0 }}>Fisioterapeuta · Campillos</p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "2.5rem", backgroundColor: "#F2ECE6", borderRadius: "1rem", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>¿Tienes alguna consulta?</h2>
          <p style={{ color: "#6b7280", marginBottom: "1.25rem", fontSize: "0.9375rem" }}>Reserva una primera visita y te ayudo personalmente.</p>
          <Link href="/#reservar" style={{ display: "inline-block", backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.75rem 2rem", borderRadius: "0.5rem", textDecoration: "none" }}>
            Reservar cita →
          </Link>
        </div>

        {/* Volver */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href="/blog" style={{ color: BRAND, fontWeight: 600, textDecoration: "none", fontSize: "0.9375rem" }}>
            ← Volver al blog
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ backgroundColor: DARK, color: "white", padding: "2rem 1.5rem", textAlign: "center" }}>
        <Link href="/">
          <div style={{ display: "inline-block", backgroundColor: "#F2ECE6", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
            <img src="/logo-fino.jpeg" alt="Carmen Gómez" style={{ height: 28, display: "block" }} />
          </div>
        </Link>
        <p style={{ color: "#6b7280", fontSize: "0.8125rem" }}>© {new Date().getFullYear()} Carmen Gómez · Clínica de Fisioterapia, Campillos</p>
      </footer>
    </div>
  );
}
