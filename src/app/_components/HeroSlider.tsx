"use client";

import { useState, useEffect, useCallback } from "react";

const AQUA = "#9B7B68";
const WA_CITA = `https://wa.me/34652591116?text=${encodeURIComponent("Hola Carmen, me gustaría pedir cita.")}`;

interface Slide {
  tag: string;
  headline: string;
  sub: string;
  cta: string;
  ctaHref: string;
  bg: string;       // gradient fallback when image fails
  overlay: string;  // colored semi-transparent veil over the photo
  imageSrc: string;
}

const SLIDES: Slide[] = [
  {
    tag: "Fisioterapia manual",
    headline: "Dolor de espalda o cuello que no cede",
    sub: "Tratamiento personalizado desde la primera sesión. Sin protocolos genéricos, sin listas de espera.",
    cta: "Pedir cita ahora →",
    ctaHref: "#reservar",
    bg: "linear-gradient(135deg, #6B4E3E 0%, #9B7B68 60%, #B8977F 100%)",
    overlay: "linear-gradient(to right, rgba(155,123,104,0.82) 0%, rgba(155,123,104,0.38) 100%)",
    imageSrc: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1400&q=80",
  },
  {
    tag: "Lesiones deportivas",
    headline: "Vuelve a entrenar sin miedo a recaer",
    sub: "Recuperación de lesiones musculares, tendinitis, esguinces y sobrecargas. Metodología basada en evidencia.",
    cta: "Reservar primera visita →",
    ctaHref: "#reservar",
    bg: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)",
    overlay: "linear-gradient(to right, rgba(29,78,216,0.82) 0%, rgba(29,78,216,0.38) 100%)",
    imageSrc: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1400&q=80",
  },
  {
    tag: "Clases de Pilates",
    headline: "Pilates terapéutico en grupos reducidos",
    sub: "Máximo 8 personas por clase. Mejora tu postura, fortalece el core y complementa tu rehabilitación.",
    cta: "Ver clases disponibles →",
    ctaHref: "#reservar",
    bg: "linear-gradient(135deg, #4c1d95 0%, #7C3AED 60%, #a855f7 100%)",
    overlay: "linear-gradient(to right, rgba(124,58,237,0.82) 0%, rgba(124,58,237,0.38) 100%)",
    imageSrc: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1400&q=80",
  },
  {
    tag: "Suelo pélvico",
    headline: "Fisioterapia especializada en suelo pélvico",
    sub: "Incontinencia, dolor pélvico, recuperación postparto. Abordaje íntimo y profesional en consulta privada.",
    cta: "Solicitar información →",
    ctaHref: WA_CITA,
    bg: "linear-gradient(135deg, #9d174d 0%, #db2777 60%, #f472b6 100%)",
    overlay: "linear-gradient(to right, rgba(157,23,77,0.82) 0%, rgba(157,23,77,0.38) 100%)",
    imageSrc: "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  // track which images failed so we fall back to gradient
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "clamp(280px, 48vw, 520px)", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, i) => {
        const useImage = s.imageSrc && !imgFailed[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute", inset: 0,
              opacity: i === current ? 1 : 0,
              transition: "opacity 0.7s ease",
              display: "flex", alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* Photo layer */}
            {useImage && (
              <img
                src={s.imageSrc}
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                }}
                onError={() => setImgFailed(prev => ({ ...prev, [i]: true }))}
              />
            )}

            {/* Color veil / fallback gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: useImage ? s.overlay : s.bg,
            }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "2rem 2rem 2rem 2.5rem", width: "100%" }}>
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
                color: "rgba(255,255,255,0.9)", fontSize: "clamp(0.875rem, 1.5vw, 1.0625rem)",
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
                }}
              >
                {s.cta}
              </a>
            </div>
          </div>
        );
      })}

      {/* Arrows */}
      <button
        onClick={prev}
        style={{
          position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
          width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)",
          border: "none", cursor: "pointer", color: "white", fontSize: "1.1rem",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
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
          zIndex: 2,
        }}
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem", zIndex: 2 }}>
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
