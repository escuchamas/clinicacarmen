import ReservaForm from "@/app/_components/ReservaForm";
import Link from "next/link";
import PublicHeader from "@/app/_components/PublicHeader";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto · Carmen Gómez Fisioterapia",
  description: "Reserva tu cita o contáctanos. Clínica de Fisioterapia en Avenida Santa María del Reposo, 1, Campillos, Málaga.",
};

const BRAND   = "#8E7D6B";
const BRAND_D = "#735E52";
const SAGE    = "#A8B89A";
const SAGE_D  = "#88997A";
const SAGE_BG = "#E6EDE2";
const CREAM   = "#F2ECE6";
const DARK    = "#1C1410";

const WA_URL      = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, me gustaría pedir información sobre una primera visita.")}`;

export default function ContactoPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white", color: DARK }}>

      <PublicHeader activePath="/contacto" />

      {/* Hero */}
      <section style={{ backgroundColor: CREAM, padding: "3.5rem 1.5rem 3rem", textAlign: "center" }}>
        <span style={{ display: "inline-block", backgroundColor: "#ECE0D4", color: BRAND_D, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.875rem", borderRadius: 999, marginBottom: "1.25rem" }}>
          Clínica de Fisioterapia · Campillos
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>
          ¿Hablamos?
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.0625rem", maxWidth: 520, margin: "0 auto" }}>
          Reserva tu cita, escríbenos o visítanos en nuestra clínica de Campillos.
        </p>
      </section>

      {/* Info rápida */}
      <section style={{ backgroundColor: "white", borderBottom: "1px solid #DCC8B2", padding: "1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
          {[
            { icon: "📍", label: "Dirección", value: "Av. Santa María del Reposo, 1\nCampillos, Málaga" },
            { icon: "📞", label: "Teléfono / WhatsApp", value: "652 591 116" },
            { icon: "🕐", label: "Horario", value: "Lunes a Viernes\n9:00 – 20:00" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ padding: "1rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>{icon}</div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND, marginBottom: "0.375rem" }}>{label}</p>
              <p style={{ fontSize: "0.9375rem", color: DARK, lineHeight: 1.5, whiteSpace: "pre-line" }}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reservar — bloque duplicado de portada */}
      <section style={{ backgroundColor: "white", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Pide tu cita ahora
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.0625rem", lineHeight: 1.6 }}>
              Seas paciente nuevo o de siempre, reservas tu cita online en 2 minutos.<br />
              Solo necesitas tu DNI y teléfono.
            </p>
          </div>

          {/* Dos vías */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
            {/* Paciente existente */}
            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: `2px solid ${BRAND}`, boxShadow: "0 4px 20px rgba(142,125,107,0.1)" }}>
              <span style={{ display: "inline-block", backgroundColor: "#ECE0D4", color: BRAND_D, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 999, marginBottom: "1rem" }}>
                Ya soy paciente
              </span>
              <h3 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>Reserva online</h3>
              <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Elige fecha y hora al momento. Solo necesitas tu DNI y teléfono.
              </p>
              <Link href="/pedir-cita" style={{ display: "block", textAlign: "center", backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                Reservar cita →
              </Link>
            </div>

            {/* Nuevo paciente */}
            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: `1.5px solid ${SAGE}` }}>
              <span style={{ display: "inline-block", backgroundColor: SAGE_BG, color: SAGE_D, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 999, marginBottom: "1rem" }}>
                Primera visita
              </span>
              <h3 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>Nuevo paciente</h3>
              <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Introduce tu DNI y teléfono. Si no te encontramos, te guiamos en un breve cuestionario para que Carmen llegue preparada a tu primera sesión.
              </p>
              <div style={{ display: "grid", gap: "0.625rem" }}>
                <Link href="/pedir-cita" style={{ display: "block", textAlign: "center", backgroundColor: SAGE, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                  Reservar primera cita →
                </Link>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "white", color: SAGE_D, fontWeight: 600, fontSize: "0.9375rem", padding: "0.75rem", borderRadius: "0.625rem", textDecoration: "none", border: `1.5px solid ${SAGE_BG}` }}>
                  <MessageCircle size={16} /> ¿Tienes dudas? Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Formulario clásico */}
          <details style={{ backgroundColor: "white", borderRadius: "1.25rem", border: "1px solid #DCC8B2" }}>
            <summary style={{ padding: "1.25rem 1.75rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9375rem", color: "#6b7280", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>O solicita tu primera visita y te la confirmamos en breve</span>
              <span style={{ fontSize: "0.75rem" }}>▼</span>
            </summary>
            <div style={{ padding: "0 1.75rem 1.75rem" }}>
              <ReservaForm />
            </div>
          </details>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
            Tus datos están protegidos y solo se utilizan para gestionar tu cita (LOPD/RGPD).
          </p>
        </div>
      </section>

      {/* Mapa */}
      <section style={{ backgroundColor: CREAM, padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif" }}>
            Cómo llegar
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Avenida Santa María del Reposo, 1 · Campillos, Málaga
          </p>
          <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid #DCC8B2", boxShadow: "0 4px 20px rgba(142,125,107,0.1)" }}>
            <iframe
              title="Localización clínica Carmen Gómez"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.2!2d-4.8605!3d37.0520!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72a6b0000000001%3A0x1!2sAvenida+Santa+Mar%C3%ADa+del+Reposo+1%2C+Campillos%2C+M%C3%A1laga!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
              width="100%"
              height="420"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <a
              href="https://maps.google.com/?q=Avenida+Santa+Mar%C3%ADa+del+Reposo+1+Campillos+M%C3%A1laga"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", backgroundColor: BRAND, color: "white", fontWeight: 600, fontSize: "0.9375rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}
            >
              Abrir en Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: DARK, color: "white", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ backgroundColor: CREAM, padding: "0.5rem 0.875rem", borderRadius: "0.5rem" }}>
            <img src="/logo-vianova.jpeg" alt="ViaNova · Clínica de Fisioterapia" style={{ height: 30, width: "auto", display: "block" }} />
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Inicio</Link>
            <Link href="/blog" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Blog</Link>
            <Link href="/contacto" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Contacto</Link>
            <a href="/login" style={{ color: "#4b5563", fontSize: "0.75rem", textDecoration: "none" }}>· acceso interno ·</a>
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.8125rem" }}>
            © {new Date().getFullYear()} ViaNova · Clínica de Fisioterapia, Campillos
          </p>
        </div>
      </footer>
    </div>
  );
}
