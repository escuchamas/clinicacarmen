import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReservaForm from "./_components/ReservaForm";
import QuizProblemas from "./_components/QuizProblemas";
import Link from "next/link";
import {
  Zap, Target, CalendarCheck,
  Fingerprint, MessageCircle, BadgeEuro,
} from "lucide-react";

const WA_URL = `https://wa.me/34608622236?text=${encodeURIComponent("Hola Carmen, me gustaría pedir información sobre una primera visita.")}`;
const WA_CITA_URL = `https://wa.me/34608622236?text=${encodeURIComponent("Hola Carmen, me gustaría pedir cita.")}`;


const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";
const CREAM = "#F2EDE3";
const DARK = "#111827";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/pacientes");

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: DARK }}>

      {/* ── STICKY HEADER ───────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 1.5rem",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1rem" }}>M</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: DARK }}>Millennialfisio</span>
          </div>
          <a href="#reservar" style={{
            backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "0.9375rem",
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem", textDecoration: "none",
          }}>
            Reservar cita →
          </a>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ backgroundColor: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <span style={{
            display: "inline-block", backgroundColor: "#CFFAFE", color: AQUA_DARK,
            fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "0.35rem 1rem", borderRadius: 999, marginBottom: "1.5rem",
          }}>
            Fisioterapia en Campillos · Comarca de Guadalteba
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
            Deja de aguantar el dolor.<br />
            <span style={{ color: AQUA }}>Vuelve a moverte como antes.</span>
          </h1>
          <p style={{ fontSize: "1.1875rem", color: "#4b5563", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: 560, margin: "0 auto 2.5rem" }}>
            Fisioterapia manual personalizada en Campillos para pacientes de Teba, Ardales, Cañete la Real, Almargen y toda la comarca. Sin protocolos genéricos, sin listas de espera.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#reservar" style={{
              backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "1.0625rem",
              padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none",
              boxShadow: "0 4px 14px rgba(8,145,178,0.35)",
            }}>
              Pedir cita ahora →
            </a>
            <a href="#como-funciona" style={{
              backgroundColor: "white", color: DARK, fontWeight: 600, fontSize: "1rem",
              padding: "0.875rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none",
              border: "1.5px solid #e5e7eb",
            }}>
              ¿Cómo funciona?
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {[
            { icon: <Zap size={22} color={AQUA} strokeWidth={2} />, title: "Resultados desde las primeras sesiones", desc: "La mayoría de pacientes nota mejoría en 2-3 sesiones." },
            { icon: <Target size={22} color={AQUA} strokeWidth={2} />, title: "Sin protocolos genéricos", desc: "Cada tratamiento es distinto porque cada dolor es distinto." },
            { icon: <CalendarCheck size={22} color={AQUA} strokeWidth={2} />, title: "Cita en menos de 48h", desc: "Sin listas de espera. Reserva hoy, empieza esta semana." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>{icon}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{title}</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUIZ PROBLEMAS ──────────────────────────────── */}
      <QuizProblemas />

      {/* ── CÓMO FUNCIONA ───────────────────────────────── */}
      <section id="como-funciona" style={{ backgroundColor: CREAM, padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Tres pasos para dejar de tener dolor
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.0625rem" }}>Sin esperas, sin burocracia.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
            {[
              { num: "01", title: "Pides tu cita online", body: "Dos minutos. Rellenas el formulario aquí abajo y Carmen te confirma en menos de 2 horas." },
              { num: "02", title: "Primera evaluación a fondo", body: "Analizamos tu caso en detalle. El dolor tiene un origen y hay que encontrarlo antes de tratar." },
              { num: "03", title: "Tu plan de tratamiento", body: "Sesiones de 45-60 min de terapia manual + pauta de ejercicio personalizada para casa." },
            ].map(({ num, title, body }) => (
              <div key={num} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: AQUA, opacity: 0.2, lineHeight: 1, marginBottom: "1rem" }}>{num}</p>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6, fontSize: "0.9375rem" }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a href="#reservar" style={{ backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "1.0625rem", padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none", display: "inline-block" }}>
              Empezar ahora →
            </a>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ CARMEN ──────────────────────────────── */}
      <section style={{ backgroundColor: "white", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", backgroundColor: "#CFFAFE", color: AQUA_DARK, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.875rem", borderRadius: 999, marginBottom: "1.25rem" }}>
                Por qué Millennialfisio
              </span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1rem", lineHeight: 1.2 }}>
                No eres un número de expediente
              </h2>
              <p style={{ color: "#4b5563", lineHeight: 1.65, marginBottom: "2rem", fontSize: "1rem" }}>
                Soy Carmen, fisioterapeuta en Campillos especializada en terapia manual. Atiendo a pacientes de toda la Comarca de Guadalteba — Teba, Ardales, Cañete la Real, Almargen, Carratraca. En Millennialfisio eres mi único paciente en cada sesión: sin asistentes, sin protocolos genéricos, sin prisas.
              </p>
              <div style={{ display: "grid", gap: "1rem" }}>
                {[
                  { icon: <Fingerprint size={20} color={AQUA} strokeWidth={1.75} />, title: "Sin protocolo genérico", desc: "Cada paciente tiene un tratamiento diseñado específicamente para su caso." },
                  { icon: <MessageCircle size={20} color={AQUA} strokeWidth={1.75} />, title: "Seguimiento entre sesiones", desc: "Puedes escribirme si tienes dudas sobre los ejercicios o notas algún cambio." },
                  { icon: <BadgeEuro size={20} color={AQUA} strokeWidth={1.75} />, title: "Precio claro, sin sorpresas", desc: "Sabes exactamente lo que cuesta antes de venir. Sin tarifas ocultas." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{icon}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.125rem" }}>{title}</p>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: CREAM, borderRadius: "1.25rem", padding: "2.5rem", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "2rem", margin: "0 auto 1.5rem" }}>C</div>
              <p style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.25rem" }}>Carmen</p>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.75rem" }}>Fisioterapeuta · Millennialfisio</p>
              <blockquote style={{ fontStyle: "italic", color: "#374151", lineHeight: 1.65, fontSize: "0.9375rem", borderLeft: `3px solid ${AQUA}`, paddingLeft: "1rem", textAlign: "left" }}>
                &ldquo;Cuando un paciente me dice que puede volver a dormir bien, a practicar deporte o a jugar con sus hijos sin dolor, es el mejor resultado que puedo obtener.&rdquo;
              </blockquote>
              <a href="#reservar" style={{ display: "block", marginTop: "1.5rem", backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}>
                Reservar con Carmen →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESERVAR ────────────────────────────────────── */}
      <section id="reservar" style={{ backgroundColor: CREAM, padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Pide tu cita ahora
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.0625rem", lineHeight: 1.6 }}>
              ¿Ya eres paciente? Reserva tu cita en 2 minutos.<br />
              ¿Primera vez? Escríbenos y te explicamos todo.
            </p>
          </div>

          {/* Dos vías */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
            {/* Paciente existente */}
            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: `2px solid ${AQUA}`, boxShadow: "0 4px 20px rgba(8,145,178,0.1)" }}>
              <span style={{ display: "inline-block", backgroundColor: "#CFFAFE", color: AQUA_DARK, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 999, marginBottom: "1rem" }}>
                Ya soy paciente
              </span>
              <h3 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>Reserva online</h3>
              <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Elige fecha y hora al momento. Solo necesitas tu DNI y teléfono.
              </p>
              <Link href="/pedir-cita" style={{ display: "block", textAlign: "center", backgroundColor: AQUA, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                Reservar cita →
              </Link>
            </div>

            {/* Nuevo paciente */}
            <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid #e5e7eb" }}>
              <span style={{ display: "inline-block", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 999, marginBottom: "1rem" }}>
                Primera visita
              </span>
              <h3 style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>Nuevo paciente</h3>
              <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                La primera visita incluye evaluación completa. Escríbenos y te reservamos el primer hueco disponible.
              </p>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "#16a34a", color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Formulario clásico (fallback) */}
          <details style={{ backgroundColor: "white", borderRadius: "1.25rem", border: "1px solid #e5e7eb" }}>
            <summary style={{ padding: "1.25rem 1.75rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9375rem", color: "#6b7280", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>O solicita cita por formulario (Carmen te confirma en &lt;2h)</span>
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

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{ backgroundColor: DARK, color: "white", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "0.875rem" }}>M</div>
            <span style={{ fontWeight: 700, color: "white" }}>Millennialfisio</span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <a href="#reservar" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Reservar cita</a>
            <a href="/login" style={{ color: "#4b5563", fontSize: "0.75rem", textDecoration: "none" }}>· acceso interno ·</a>
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.8125rem" }}>
            © {new Date().getFullYear()} Millennialfisio · Campillos, Málaga
          </p>
        </div>
      </footer>

    </div>
  );
}
