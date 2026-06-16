"use client";

import { useState } from "react";
import { Activity, Brain, Dumbbell, HeartPulse, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";
const CREAM = "#F2EDE3";

type ProblemId = "espalda" | "cervicales" | "deportiva" | "postop";
type Step = "select" | "questions" | "profile";

interface Problem {
  id: ProblemId;
  icon: LucideIcon;
  title: string;
  teaser: string;
}

const PROBLEMS: Problem[] = [
  {
    id: "espalda",
    icon: Activity,
    title: "Dolor de espalda",
    teaser: "Lumbalgia, hernia, ciática o tensión lumbar que no desaparece.",
  },
  {
    id: "cervicales",
    icon: Brain,
    title: "Cervicales y cefaleas",
    teaser: "Cuello cargado, dolor de cabeza recurrente, rigidez al girar.",
  },
  {
    id: "deportiva",
    icon: Dumbbell,
    title: "Lesión deportiva",
    teaser: "Esguince, tendinitis, rotura muscular o sobrecarga que no sana.",
  },
  {
    id: "postop",
    icon: HeartPulse,
    title: "Postoperatorio",
    teaser: "Recuperación tras cirugía de rodilla, hombro, columna o cadera.",
  },
];

type QuestionOption = { id: string; label: string };
type Question = { id: string; text: string; options: QuestionOption[] };

const QUESTIONS: Record<ProblemId, Question[]> = {
  espalda: [
    {
      id: "duracion",
      text: "¿Cuánto llevas con este dolor?",
      options: [
        { id: "reciente", label: "Menos de 1 mes" },
        { id: "meses", label: "Entre 1 y 6 meses" },
        { id: "cronico", label: "Más de 6 meses" },
      ],
    },
    {
      id: "baja",
      text: "¿El dolor baja por la pierna o tienes hormigueos?",
      options: [
        { id: "si", label: "Sí, claramente" },
        { id: "aveces", label: "A veces, levemente" },
        { id: "no", label: "No, solo la zona lumbar" },
      ],
    },
  ],
  cervicales: [
    {
      id: "cefalea",
      text: "¿Con qué frecuencia tienes dolor de cabeza?",
      options: [
        { id: "diario", label: "Casi a diario" },
        { id: "frecuente", label: "Varias veces a la semana" },
        { id: "ocasional", label: "De vez en cuando" },
      ],
    },
    {
      id: "cuando",
      text: "¿Cuándo notas que el cuello empeora?",
      options: [
        { id: "ordenador", label: "Trabajando en el ordenador" },
        { id: "estres", label: "Al final del día, por estrés" },
        { id: "manana", label: "Por las mañanas al levantarme" },
        { id: "sinpatron", label: "Sin patrón claro" },
      ],
    },
  ],
  deportiva: [
    {
      id: "tiempo",
      text: "¿Cuándo ocurrió la lesión?",
      options: [
        { id: "aguda", label: "Hace menos de 2 semanas" },
        { id: "subaguda", label: "Entre 1 y 3 meses" },
        { id: "cronica", label: "Más de 3 meses (o es recurrente)" },
      ],
    },
    {
      id: "zona",
      text: "¿Qué zona te ha dado problemas?",
      options: [
        { id: "tren_inferior", label: "Tobillo, rodilla o cadera" },
        { id: "tren_superior", label: "Hombro, codo o muñeca" },
        { id: "muscular", label: "Muslo, isquio o gemelo" },
        { id: "otro", label: "Otra zona" },
      ],
    },
  ],
  postop: [
    {
      id: "tiempo",
      text: "¿Cuándo fue la operación?",
      options: [
        { id: "reciente", label: "Hace menos de 1 mes" },
        { id: "meses", label: "Entre 1 y 3 meses" },
        { id: "tardio", label: "Hace más de 3 meses" },
      ],
    },
    {
      id: "estado",
      text: "¿Cómo describes tu recuperación?",
      options: [
        { id: "bien", label: "Va bien, pero quiero asegurarme" },
        { id: "lenta", label: "Más lenta de lo esperado" },
        { id: "estancada", label: "Llevo semanas sin avanzar" },
      ],
    },
  ],
};

interface Profile {
  title: string;
  body: string;
  chips: string[];
}

function buildProfile(problem: ProblemId, answers: Record<string, string>): Profile {
  if (problem === "espalda") {
    const dur = answers.duracion;
    const baja = answers.baja;

    const apertura =
      dur === "reciente"
        ? "El dolor ha aparecido hace poco, pero ya está condicionando tu jornada: te levantas pensando en él y te acuestas sin que haya desaparecido."
        : dur === "meses"
        ? "Llevas varios meses conviviendo con un dolor que mejora un poco y vuelve. Ya has perdido la cuenta de las veces que has pensado que por fin se iba."
        : "Llevas más de medio año cargando con un dolor que ya sientes como parte de tu vida. Tan normalizado que casi ni lo mencionas, pero que limita todo: dormir, agacharte, coger peso, moverte con libertad.";

    const nervio =
      baja === "si"
        ? " El hecho de que baje por la pierna o notes hormigueos nos dice que hay una estructura comprimiendo el nervio ciático. Ningún antiinflamatorio ni reposo va a liberar esa compresión — necesita tratamiento manual directo sobre el origen."
        : baja === "aveces"
        ? " El hormigueo ocasional puede ser una señal temprana de que algo está rozando el nervio. Cuanto antes se trate, más fácil es revertirlo sin que se cronifique."
        : " La zona lumbar acumula tensión postural, muscular y emocional. Sin tratamiento dirigido, el ciclo se repite: mejora, recae, mejora, recae.";

    return {
      title: "Así es tu situación con la espalda",
      body: `${apertura}${nervio} Has probado el reposo, el calor, los antiinflamatorios... y el problema regresa. No es mala suerte: es que el origen nunca se ha tratado. Con fisioterapia manual específica podemos localizarlo y trabajar sobre él desde la primera sesión.`,
      chips: baja !== "no" ? ["Lumbalgia", "Ciática", "Nervio ciático"] : ["Lumbalgia", "Tensión postural", "Musculatura lumbar"],
    };
  }

  if (problem === "cervicales") {
    const cefalea = answers.cefalea;
    const cuando = answers.cuando;

    const apertura =
      cefalea === "diario"
        ? "El dolor de cabeza se ha convertido en parte de tu rutina. Tanto que ya no sabes si es normal o no, si hay que hacerle caso o ignorarlo."
        : cefalea === "frecuente"
        ? "Varias veces a la semana aparece ese dolor de cabeza que te quita concentración, energía y ganas de hacer cosas. Ya tienes el ibuprofeno cerca por costumbre."
        : "El cuello ya avisa: tensión, rigidez, molestia al girar. El dolor de cabeza aún no es constante, pero cuando aparece, lo paraliza todo.";

    const patron =
      cuando === "ordenador"
        ? " Que empeore trabajando en el ordenador no es casualidad: mantener la cabeza adelantada durante horas sobrecarga las vértebras cervicales altas y la base del cráneo. Ahí está el origen de la mayoría de cefaleas tensionales."
        : cuando === "estres"
        ? " Que empeore al final del día refleja una musculatura cervical que ha aguantado horas de tensión acumulada sin poder liberarla. El estrés no se va al cuello: ya está ahí desde el principio, esperando acumularse."
        : cuando === "manana"
        ? " Despertar con el cuello cargado indica que la musculatura no descansa durante el sueño. La postura, la tensión crónica y posiblemente el tipo de almohada perpetúan el ciclo noche tras noche."
        : " Sin un patrón claro, el origen puede ser postural, articular o muscular — o una combinación de los tres. Por eso es imprescindible una evaluación que vaya más allá del síntoma.";

    return {
      title: "Así es tu situación con las cervicales",
      body: `${apertura}${patron} Un trabajo preciso sobre la columna cervical, la base del cráneo y la musculatura de la nuca puede cambiar radicalmente cómo te sientes en el día a día — en pocas semanas.`,
      chips: ["Cervicalgia", "Cefalea tensional", "Contractura cervical"],
    };
  }

  if (problem === "deportiva") {
    const tiempo = answers.tiempo;
    const zona = answers.zona;

    const tiempoText =
      tiempo === "aguda"
        ? "La lesión acaba de ocurrir. Este momento es el más importante de toda la recuperación: lo que hagas —o no hagas— en estas primeras semanas determina si te recuperas al cien por cien o si el problema se arrastra durante meses."
        : tiempo === "subaguda"
        ? "Han pasado uno o tres meses desde la lesión. Sientes que ha mejorado, pero no estás al cien por cien. Quizás tienes miedo de recaer, o algo no termina de funcionar como antes."
        : "La lesión ya es crónica o vuelve a aparecer una y otra vez. Eso no es casualidad ni mala suerte: significa que el origen nunca se resolvió del todo. Cada recaída deja la zona más vulnerable que la anterior.";

    const zonaText =
      zona === "tren_inferior"
        ? " En tobillo, rodilla y cadera, una recuperación incompleta no solo limita el rendimiento — altera toda la cadena de movimiento y predispone a lesiones en otras zonas."
        : zona === "tren_superior"
        ? " Las lesiones de hombro, codo y muñeca mal tratadas se cronifican con facilidad. La articulación pierde rango, la musculatura se inhibe y el gesto deportivo nunca vuelve a ser el mismo."
        : zona === "muscular"
        ? " Isquios, gemelos, cuádriceps... las roturas o sobrecargas musculares necesitan una cicatrización dirigida. Sin estímulo adecuado, el tejido que queda es más rígido y más propenso a romperse de nuevo."
        : " Sea cual sea la zona, el principio es el mismo: el cuerpo necesita cargas controladas y progresivas para sanar bien, no solo reposo y tiempo.";

    return {
      title: "Así es tu situación con la lesión deportiva",
      body: `${tiempoText}${zonaText} El objetivo no es solo que deje de doler: es que vuelvas a tu nivel anterior con confianza, sin miedo a recaer y sabiendo que el problema está resuelto de verdad.`,
      chips: ["Lesión deportiva", "Rehabilitación funcional", "Vuelta al deporte"],
    };
  }

  // postop
  const tiempo = answers.tiempo;
  const estado = answers.estado;

  const apertura =
    tiempo === "reciente"
      ? "La operación es reciente y estás en la fase más determinante de toda la recuperación. Lo que hagas en estos primeros meses marca el resultado final — no el cirujano, sino el trabajo de rehabilitación."
      : tiempo === "meses"
      ? "Ya han pasado unos meses desde la intervención. Es el momento de pedirle más al cuerpo: ganar fuerza real, recuperar el rango completo de movimiento y empezar a confiar de nuevo en la zona operada."
      : "La operación fue hace tiempo, pero algo no termina de ir como esperabas. Puede que te hayas estancado, que notes inseguridad en el movimiento, o que simplemente no hayas vuelto a tu nivel de antes.";

  const estadoText =
    estado === "bien"
      ? " Que vaya bien no significa que no pueda ir mejor. Muchos pacientes se conforman con un 80% sin saber que un plan bien dirigido puede llevarlos al 100%."
      : estado === "lenta"
      ? " Una recuperación más lenta de lo esperado casi siempre indica que falta el estímulo adecuado. El tejido necesita cargas progresivas para regenerarse — el reposo solo no lo hace."
      : " Llevar semanas sin avanzar es la señal más clara de que el proceso de rehabilitación necesita un replanteamiento. No es normal estancarse, y tiene solución.";

  return {
    title: "Así es tu situación en el postoperatorio",
    body: `${apertura}${estadoText} Diseñamos un plan adaptado exactamente a tu intervención, a tu cirujano y al punto en el que estás ahora — no un protocolo genérico, sino el tuyo.`,
    chips: ["Rehabilitación postquirúrgica", "Recuperación funcional", "Vuelta a la actividad"],
  };
}

export default function QuizProblemas() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemId | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>("select");

  const currentQuestions = selectedProblem ? QUESTIONS[selectedProblem] : [];
  const allAnswered = Object.keys(answers).length === currentQuestions.length;
  const selectedData = PROBLEMS.find(p => p.id === selectedProblem);
  const profile = step === "profile" && selectedProblem ? buildProfile(selectedProblem, answers) : null;

  function selectProblem(id: ProblemId) {
    setSelectedProblem(id);
    setAnswers({});
    setStep("questions");
  }

  function answer(questionId: string, optionId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }

  function reset() {
    setSelectedProblem(null);
    setAnswers({});
    setStep("select");
  }

  const subtitle =
    step === "select"
      ? "Selecciona lo que mejor describe tu situación."
      : step === "questions"
      ? "Dos preguntas rápidas para entender mejor tu caso."
      : "Hemos entendido tu situación.";

  return (
    <section style={{ padding: "4.5rem 1.5rem", backgroundColor: "white" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            ¿Qué te está impidiendo vivir con normalidad?
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1.0625rem" }}>{subtitle}</p>
        </div>

        {/* ── PASO 1: SELECCIONAR PROBLEMA ── */}
        {step === "select" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {PROBLEMS.map(({ id, icon: Icon, title, teaser }) => (
              <button
                key={id}
                onClick={() => selectProblem(id)}
                style={{
                  textAlign: "left", padding: "1.5rem",
                  backgroundColor: "white",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "1rem",
                  cursor: "pointer",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseOver={e => {
                  (e.currentTarget).style.borderColor = AQUA;
                  (e.currentTarget).style.boxShadow = "0 4px 16px rgba(8,145,178,0.12)";
                }}
                onMouseOut={e => {
                  (e.currentTarget).style.borderColor = "#e5e7eb";
                  (e.currentTarget).style.boxShadow = "none";
                }}
              >
                <div style={{ marginBottom: "0.875rem" }}>
                  <Icon size={28} color={AQUA} strokeWidth={1.75} />
                </div>
                <p style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.375rem", color: "#111827" }}>{title}</p>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.5, marginBottom: "1rem" }}>{teaser}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: AQUA, fontSize: "0.8125rem", fontWeight: 700 }}>
                  Esto me describe <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── PASO 2: PREGUNTAS ── */}
        {step === "questions" && selectedData && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "2rem", padding: "0.875rem 1.25rem",
              backgroundColor: "#F0FDFA", borderRadius: "0.75rem",
              border: `1.5px solid ${AQUA}`,
            }}>
              <selectedData.icon size={20} color={AQUA} strokeWidth={1.75} />
              <span style={{ fontWeight: 700, color: AQUA_DARK, fontSize: "0.9375rem" }}>{selectedData.title}</span>
              <button
                onClick={reset}
                style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
              >
                Cambiar →
              </button>
            </div>

            <div style={{ display: "grid", gap: "2rem" }}>
              {currentQuestions.map((q, qi) => (
                <div key={q.id}>
                  <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.875rem", color: "#111827" }}>
                    <span style={{ color: AQUA, marginRight: "0.5rem" }}>{qi + 1}.</span>
                    {q.text}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {q.options.map(opt => {
                      const selected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => answer(q.id, opt.id)}
                          style={{
                            padding: "0.625rem 1.125rem",
                            borderRadius: "2rem",
                            border: `1.5px solid ${selected ? AQUA : "#e5e7eb"}`,
                            backgroundColor: selected ? "#CFFAFE" : "white",
                            color: selected ? AQUA_DARK : "#374151",
                            fontWeight: selected ? 700 : 500,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2.5rem" }}>
              <button
                onClick={() => setStep("profile")}
                disabled={!allAnswered}
                style={{
                  width: "100%", padding: "1rem",
                  backgroundColor: allAnswered ? AQUA : "#e5e7eb",
                  color: allAnswered ? "white" : "#9ca3af",
                  fontWeight: 700, fontSize: "1rem",
                  border: "none", borderRadius: "0.625rem",
                  cursor: allAnswered ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                }}
              >
                Ver mi situación →
              </button>
              {!allAnswered && (
                <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
                  Responde las dos preguntas para continuar
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── PASO 3: PERFIL PERSONALIZADO ── */}
        {step === "profile" && profile && selectedData && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{
              backgroundColor: "#F0FDFA", borderRadius: "1.25rem",
              padding: "2rem", border: `1.5px solid ${AQUA}`,
              marginBottom: "1.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <selectedData.icon size={22} color={AQUA} strokeWidth={1.75} />
                <span style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827" }}>{profile.title}</span>
              </div>
              <p style={{ color: "#374151", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.25rem" }}>
                {profile.body}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {profile.chips.map(c => (
                  <span key={c} style={{
                    fontSize: "0.8125rem", padding: "0.25rem 0.75rem",
                    backgroundColor: "#CFFAFE", color: AQUA_DARK,
                    borderRadius: 999, fontWeight: 600,
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: AQUA, borderRadius: "1rem",
              padding: "2rem", textAlign: "center", marginBottom: "1rem",
            }}>
              <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "1.25rem", fontSize: "1rem", lineHeight: 1.6 }}>
                Esto tiene solución. Carmen puede evaluarte esta semana.
              </p>
              <a
                href="#reservar"
                style={{
                  display: "inline-block", backgroundColor: "white",
                  color: AQUA, fontWeight: 800, fontSize: "1rem",
                  padding: "0.875rem 2rem", borderRadius: "0.625rem",
                  textDecoration: "none",
                }}
              >
                Reservar mi primera cita →
              </a>
            </div>

            <button
              onClick={reset}
              style={{
                width: "100%", padding: "0.75rem",
                background: "none", border: "1.5px solid #e5e7eb",
                borderRadius: "0.625rem", color: "#6b7280",
                fontSize: "0.875rem", cursor: "pointer",
              }}
            >
              ← Ver los otros problemas
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
