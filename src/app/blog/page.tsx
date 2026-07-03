import { getBlogPosts } from "@/lib/db";
import Link from "next/link";
import PublicHeader from "@/app/_components/PublicHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog · Carmen Gómez Fisioterapia",
  description: "Artículos sobre fisioterapia manual, pilates terapéutico, suelo pélvico y lesiones deportivas.",
};

const BRAND = "#8E7D6B";
const DARK  = "#1C1410";

export default async function BlogPage() {
  const posts = await getBlogPosts(true);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white", color: DARK }}>

      <PublicHeader activePath="/blog" />

      {/* Hero */}
      <section style={{ backgroundColor: "#F2ECE6", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
        <span style={{ display: "inline-block", backgroundColor: "#ECE0D4", color: "#735E52", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.875rem", borderRadius: 999, marginBottom: "1.25rem" }}>
          Fisioterapia · Bienestar · Movimiento
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "0.75rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>
          Blog de Carmen Gómez
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.0625rem", maxWidth: 520, margin: "0 auto" }}>
          Artículos sobre fisioterapia manual, pilates terapéutico, lesiones deportivas y bienestar.
        </p>
      </section>

      {/* Posts */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#9ca3af" }}>
            <p style={{ fontSize: "1.125rem" }}>Pronto publicaremos los primeros artículos.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ border: "1px solid #DCC8B2", borderRadius: "1rem", overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s", backgroundColor: "white" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(142,125,107,0.15)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>

                  {/* Imagen */}
                  <div style={{ height: 200, backgroundColor: "#F2ECE6", overflow: "hidden" }}>
                    {post.imagenUrl ? (
                      <img src={post.imagenUrl} alt={post.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="/logo-isotipo.jpeg" alt="" style={{ height: 64, opacity: 0.3 }} />
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div style={{ padding: "1.5rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{post.createdAt}</p>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.35, marginBottom: "0.625rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>{post.titulo}</h2>
                    {post.extracto && (
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.extracto}</p>
                    )}
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: BRAND }}>Leer artículo →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer simple */}
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
