import ReservaForm from "./_components/ReservaForm";
import QuizProblemas from "./_components/QuizProblemas";
import WhatsAppButton from "./_components/WhatsAppButton";
import Link from "next/link";
import {
  Zap, Target, CalendarCheck,
  Fingerprint, MessageCircle, BadgeEuro,
  Users, Dumbbell,
} from "lucide-react";
import HeroSlider from "./_components/HeroSlider";

const WA_URL = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, me gustaría pedir información sobre una primera visita.")}`;
const WA_CITA_URL = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, me gustaría pedir cita.")}`;
const WA_PILATES_URL = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, me gustaría apuntarme a las clases de pilates. ¿Hay plazas disponibles?")}`;

/* Paleta guía de diseño */
const BRAND   = "#8E7D6B";  /* Taupe */
const BRAND_D = "#735E52";  /* Taupe oscuro */
const SAGE    = "#A8B89A";  /* Verde Salvia */
const SAGE_D  = "#88997A";  /* Verde Salvia oscuro */
const SAGE_BG = "#E6EDE2";  /* Fondo sage */
const CREAM   = "#F2ECE6";  /* Beige Claro */
const DARK    = "#1C1410";

export default async function HomePage() {
  return (
    <div style={{ color: DARK }}>

      {/* ── STICKY HEADER ───────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: CREAM,
        borderBottom: "1px solid #DCC8B2",
        padding: "0 1.5rem",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <img
            src="/brand-logo.jpeg"
            alt="ViaNova · Clínica de Fisioterapia"
            style={{ height: 40, width: "auto", display: "block", flexShrink: 0 }}
          />
          {/* Nav links — ocultas en móvil */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1, justifyContent: "center" }} className="hidden sm:flex">
            <a href="#servicios" className="nav-link">Servicios</a>
            <a href="#pilates" className="nav-link">Pilates</a>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/contacto" className="nav-link">Contacto</Link>
          </nav>
          <a href="#reservar" style={{
            flexShrink: 0, backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "0.9375rem",
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem", textDecoration: "none",
          }}>
            Reservar cita →
          </a>
        </div>
      </header>

      {/* ── HERO SLIDER ─────────────────────────────────── */}
      <HeroSlider />

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ backgroundColor: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <span style={{
            display: "inline-block", backgroundColor: "#ECE0D4", color: BRAND_D,
            fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "0.35rem 1rem", borderRadius: 999, marginBottom: "1.5rem",
          }}>
            Fisioterapia en Campillos
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
            Deja de aguantar el dolor.<br />
            <span style={{ color: BRAND }}>Vuelve a moverte como antes.</span>
          </h1>
          <p style={{ fontSize: "1.1875rem", color: "#4b5563", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: 560, margin: "0 auto 2.5rem" }}>
            Fisioterapia manual personalizada en Campillos para pacientes de Teba, Ardales, Cañete la Real, Almargen y toda la comarca. Sin protocolos genéricos, sin listas de espera.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#reservar" style={{
              backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "1.0625rem",
              padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none",
              boxShadow: "0 4px 14px rgba(142, 125, 107, 0.35)",
            }}>
              Pedir cita ahora →
            </a>
            <a href="#como-funciona" style={{
              backgroundColor: "white", color: SAGE_D, fontWeight: 600, fontSize: "1rem",
              padding: "0.875rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none",
              border: `1.5px solid ${SAGE}`,
            }}>
              ¿Cómo funciona?
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────── */}
      <section id="servicios" style={{ backgroundColor: "white", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {[
            { icon: <Zap size={22} color={BRAND} strokeWidth={2} />, title: "Resultados desde las primeras sesiones", desc: "La mayoría de pacientes nota mejoría en 2-3 sesiones." },
            { icon: <Target size={22} color={SAGE} strokeWidth={2} />, title: "Sin protocolos genéricos", desc: "Cada tratamiento es distinto porque cada dolor es distinto." },
            { icon: <CalendarCheck size={22} color={BRAND} strokeWidth={2} />, title: "Cita en menos de 48h", desc: "Sin listas de espera. Reserva hoy, empieza esta semana." },
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
      <section id="como-funciona" style={{ backgroundColor: "white", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Tres pasos para dejar de tener dolor
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.0625rem" }}>Sin esperas, sin burocracia.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
            {[
              { num: "01", title: "Pides tu cita online", body: "Dos minutos, con tu DNI y teléfono. Si ya eres paciente, la cita queda confirmada al instante. Si es tu primera vez, el sistema te guía paso a paso." },
              { num: "02", title: "Primera evaluación a fondo", body: "Analizamos tu caso en detalle. El dolor tiene un origen y hay que encontrarlo antes de tratar." },
              { num: "03", title: "Tu plan de tratamiento", body: "Sesiones de 45-60 min de terapia manual + pauta de ejercicio personalizada para casa." },
            ].map(({ num, title, body }, i) => (
              <div key={num} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "2rem", border: "1px solid #DCC8B2", boxShadow: i === 1 ? `inset 0 3px 0 ${SAGE}` : "none" }}>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: i === 1 ? SAGE : BRAND, opacity: 0.25, lineHeight: 1, marginBottom: "1rem" }}>{num}</p>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6, fontSize: "0.9375rem" }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a href="#reservar" style={{ backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "1.0625rem", padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none", display: "inline-block" }}>
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
              <span style={{ display: "inline-block", backgroundColor: "#ECE0D4", color: BRAND_D, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.875rem", borderRadius: 999, marginBottom: "1.25rem" }}>
                Por qué elegir a Carmen
              </span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "1rem", lineHeight: 1.2 }}>
                No eres un número de expediente
              </h2>
              <p style={{ color: "#4b5563", lineHeight: 1.65, marginBottom: "2rem", fontSize: "1rem" }}>
                Soy Carmen Gómez, fisioterapeuta en Campillos especializada en terapia manual. Atiendo a pacientes de toda la Comarca de Guadalteba — Teba, Ardales, Cañete la Real, Almargen, Carratraca. Eres mi único paciente en cada sesión: sin asistentes, sin protocolos genéricos, sin prisas.
              </p>
              <div style={{ display: "grid", gap: "1rem" }}>
                {[
                  { icon: <Fingerprint size={20} color={BRAND} strokeWidth={1.75} />, title: "Sin protocolo genérico", desc: "Cada paciente tiene un tratamiento diseñado específicamente para su caso." },
                  { icon: <MessageCircle size={20} color={SAGE} strokeWidth={1.75} />, title: "Seguimiento entre sesiones", desc: "Puedes escribirme si tienes dudas sobre los ejercicios o notas algún cambio." },
                  { icon: <BadgeEuro size={20} color={BRAND} strokeWidth={1.75} />, title: "Plan personalizado desde el primer día", desc: "En la primera visita evaluamos tu caso y te proponemos el plan más adecuado. Sin compromisos previos." },
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

            <div style={{ backgroundColor: CREAM, borderRadius: "1.25rem", padding: "2.5rem", textAlign: "center", border: "1px solid #DCC8B2", boxShadow: `inset 0 3px 0 ${SAGE}` }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", backgroundColor: "#F2ECE6", border: `2px solid ${SAGE}`, overflow: "hidden", margin: "0 auto 1rem" }}>
                <img src="/logo-isotipo.jpeg" alt="Isotipo Carmen Gómez" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <p style={{ fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.125rem", fontFamily: "var(--font-heading, 'Cormorant Garamond'), Georgia, serif", letterSpacing: "0.04em" }}>Carmen Gómez</p>
              <p style={{ fontSize: "0.8125rem", color: BRAND, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.75rem" }}>Fisioterapeuta · Campillos</p>
              <blockquote style={{ fontStyle: "italic", color: "#374151", lineHeight: 1.65, fontSize: "0.9375rem", borderLeft: `3px solid ${BRAND}`, paddingLeft: "1rem", textAlign: "left" }}>
                &ldquo;Cuando un paciente me dice que puede volver a dormir bien, a practicar deporte o a jugar con sus hijos sin dolor, es el mejor resultado que puedo obtener.&rdquo;
              </blockquote>
              <a href="#reservar" style={{ display: "block", marginTop: "1.5rem", backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "0.9375rem", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none" }}>
                Reservar con Carmen →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILATES ─────────────────────────────────────── */}
      <section id="pilates" style={{ backgroundColor: "white", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{
              display: "inline-block", backgroundColor: SAGE_BG, color: SAGE_D,
              fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "0.35rem 1rem", borderRadius: 999, marginBottom: "1.5rem",
            }}>
              Clases de Pilates
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Pilates en grupos pequeños
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.0625rem", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 0" }}>
              Clases de pilates en grupos de máximo 8 personas para trabajar el control postural, la fuerza del core y la movilidad articular. Carmen supervisa cada ejercicio de forma personalizada.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            {[
              { icon: <Users size={24} color={SAGE_D} strokeWidth={1.75} />, title: "Grupos reducidos", desc: "Máximo 8 personas por clase. Las plazas son limitadas para que Carmen pueda corregirte en cada ejercicio." },
              { icon: <Target size={24} color={SAGE_D} strokeWidth={1.75} />, title: "Todos los niveles", desc: "Sin experiencia previa necesaria. La clase se adapta al nivel del grupo, desde iniciación hasta avanzado." },
              { icon: <Dumbbell size={24} color={SAGE_D} strokeWidth={1.75} />, title: "Complemento perfecto", desc: "Ideal como mantenimiento tras el tratamiento de fisioterapia o como práctica independiente." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: SAGE_BG, borderRadius: "1rem", padding: "1.75rem", border: `1px solid ${SAGE}` }}>
                <div style={{ marginBottom: "0.875rem" }}>{icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem", color: DARK }}>{title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: SAGE_BG, borderRadius: "1.25rem", padding: "2rem", border: `1px solid ${SAGE}`, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", color: DARK }}>
              Las plazas se gestionan directamente con Carmen
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
              Escríbele por WhatsApp para consultar disponibilidad y horarios de las próximas clases.
            </p>
            <a href={WA_PILATES_URL} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: SAGE, color: "white", fontWeight: 700, fontSize: "1rem",
              padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Preguntar por plazas
            </a>
          </div>
        </div>
      </section>

      {/* ── RESERVAR ────────────────────────────────────── */}
      <section id="reservar" style={{ backgroundColor: "white", padding: "5rem 1.5rem" }}>
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
                <Link href="/pedir-cita"
                  style={{ display: "block", textAlign: "center", backgroundColor: SAGE, color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                  Reservar primera cita →
                </Link>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "white", color: SAGE_D, fontWeight: 600, fontSize: "0.9375rem", padding: "0.75rem", borderRadius: "0.625rem", textDecoration: "none", border: `1.5px solid ${SAGE_BG}` }}>
                  <MessageCircle size={16} /> ¿Tienes dudas? Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Formulario clásico (fallback) */}
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

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{ backgroundColor: DARK, color: "white", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ backgroundColor: "#F2ECE6", padding: "0.5rem 0.875rem", borderRadius: "0.5rem" }}>
            <img
              src="/brand-logo.jpeg"
              alt="ViaNova · Clínica de Fisioterapia"
              style={{ height: 30, width: "auto", display: "block" }}
            />
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <a href="#reservar" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>Reservar cita</a>
            <a href="/login" style={{ color: "#4b5563", fontSize: "0.75rem", textDecoration: "none" }}>· acceso interno ·</a>
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.8125rem" }}>
            © {new Date().getFullYear()} ViaNova · Clínica de Fisioterapia, Campillos
          </p>
        </div>
      </footer>

      <WhatsAppButton href={WA_URL} />

    </div>
  );
}
