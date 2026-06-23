"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const AQUA = "#0D9488";
const WA_CITA = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, me gustaría pedir cita.")}`;

interface Slide {
  tag: string;
  headline: string;
  sub: string;
  cta: string;
  ctaHref: string;
  bg: string;        // gradient fallback
  imageSrc: string;  // URL de Cloudinary cuando esté disponible — dejar vacío por ahora
}

const SLIDES: Slide[] = [
  {
    tag: "Fisioterapia manual",
    headline: "Dolor de espalda o cuello que no cede",
    sub: "Tratamiento personalizado desde la primera sesión. Sin protocolos genéricos, sin listas de espera.",
    cta: "Pedir cita ahora →",
    ctaHref: "#reservar",
    bg: "linear-gradient(135deg, #0f766e 0%, #0D9488 60%, #14b8a6 100%)",
    imageSrc: "",
  },
  {
    tag: "Lesiones deportivas",
    headline: "Vuelve a entrenar sin miedo a recaer",
    sub: "Recuperación de lesiones musculares, tendinitis, esguinces y sobrecargas. Metodología basada en evidencia.",
    cta: "Reservar primera visita →",
    ctaHref: "#reservar",
    bg: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)",
    imageSrc: "",
  },
  {
    tag: "Clases de Pilates",
    headline: "Pilates terapéutico en grupos reducidos",
    sub: "Máximo 8 personas por clase. Mejora tu postura, fortalece el core y complementa tu rehabilitación.",
    cta: "Ver clases disponibles →",
    ctaHref: "/clases",
    bg: "linear-gradient(135deg, #4c1d95 0%, #7C3AED 60%, #a855f7 100%)",
    imageSrc: "",
  },
  {
    tag: "Suelo pélvico",
    headline: "Fisioterapia especializada en suelo pélvico",
    sub: "Incontinencia, dolor pélvico, recuperación postparto. Abordaje íntimo y profesional en consulta privada.",
    cta: "Solicitar información →",
    ctaHref: WA_CITA,
    bg: "linear-gradient(135deg, #9d174d 0%, #db2777 60%, #f472b6 100%)",
    imageSrc: "",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <div
      style={{ position: "relative", width: "100%", height: "clamp(280px, 48vw, 520px)", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            background: s.imageSrc
              ? `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%), url(${s.imageSrc}) center/cover no-repeat`
              : s.bg,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease",
            display: "flex", alignItems: "center",
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "2rem 2rem 2rem 2.5rem", width: "100%" }}>
            <span style={{
              display: "inline-block", backgroundColor: "rgba(255,255,255,0.2)", color: "white",
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "0.3rem 0.875rem", borderRadius: 999, marginBottom: "1rem",
              backdropFilter: "blur(4px)",
            }}>
              {s.tag}
            </span>
            <h2 style={{
              color: "white", fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.02em",
              fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
              marginBottom: "0.875rem", maxWidth: 560,
            }}>
              {s.headline}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.875rem, 1.5vw, 1.0625rem)",
              lineHeight: 1.6, maxWidth: 480, marginBottom: "1.75rem",
            }}>
              {s.sub}
            </p>
            <a
              href={s.ctaHref}
              style={{
                display: "inline-block", backgroundColor: "white", color: AQUA,
                fontWeight: 700, fontSize: "0.9375rem",
                padding: "0.75rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                transition: "transform 0.15s",
              }}
            >
              {s.cta}
            </a>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        style={{
          position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
          width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)",
          border: "none", cursor: "pointer", color: "white", fontSize: "1.1rem",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
        }}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={next}
        style={{
          position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
          width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)",
          border: "none", cursor: "pointer", color: "white", fontSize: "1.1rem",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
        }}
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem" }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8, height: 8, borderRadius: 4,
              backgroundColor: i === current ? "white" : "rgba(255,255,255,0.4)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
