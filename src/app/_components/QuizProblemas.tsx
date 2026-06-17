"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";
const CREAM = "#F2EDE3";

type ProblemId = "espalda" | "cervicales" | "deportiva" | "hombro" | "postop" | "embarazo";
type Step = "select" | "questions" | "profile";

interface Problem {
  id: ProblemId;
  emoji: string;
  title: string;
  situaciones: string[];
}

const PROBLEMS: Problem[] = [
  {
    id: "espalda",
    emoji: "🔻",
    title: "Dolor de espalda",
    situaciones: [
      "Te duele al agacharte a coger algo del suelo",
      "Llevas semanas sin dormir bien por el dolor",
      "Por las mañanas tardas varios minutos en ponerte en marcha",
    ],
  },
  {
    id: "cervicales",
    emoji: "🔁",
    title: "Cervicales y cabeza",
    situaciones: [
      "Acabas el día con el cuello tan cargado que ya tienes dolor de cabeza por costumbre",
      "Te cuesta girar la cabeza del todo cuando aparcan o conduces",
      "El ibuprofeno ya es parte de tu rutina semanal",
    ],
  },
  {
    id: "deportiva",
    emoji: "🏃",
    title: "Lesión deportiva",
    situaciones: [
      "Llevas meses sin poder salir a correr, jugar al fútbol o entrenar con normalidad",
      "La lesión 'curó' pero nunca volviste al cien por cien",
      "Te da miedo hacer el mismo gesto que te lesionó",
    ],
  },
  {
    id: "hombro",
    emoji: "💪",
    title: "Hombro y brazo",
    situaciones: [
      "No puedes dormir del lado que te duele",
      "Coger algo de un estante alto ya lo piensas dos veces",
      "Llevas meses con el brazo limitado y ya lo das por normal",
    ],
  },
  {
    id: "postop",
    emoji: "🩹",
    title: "Postoperatorio",
    situaciones: [
      "La operación fue hace meses y sigues sin estar al cien por cien",
      "Sientes que la recuperación se ha estancado",
      "No terminas de confiar en la zona operada para hacer vida normal",
    ],
  },
  {
    id: "embarazo",
    emoji: "🤱",
    title: "Embarazo y postparto",
    situaciones: [
      "Desde que tuviste al bebé, tu cuerpo ya no es el de antes",
      "Notas pérdidas al toser, reír o saltar",
      "Tienes dolor de espalda o caderas que no remite",
    ],
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
        { id: "meses", label: "1 a 6 meses" },
        { id: "cronico", label: "Más de 6 meses" },
      ],
    },
    {
      id: "baja",
      text: "¿El dolor baja por la pierna o tienes hormigueos?",
      options: [
        { id: "si", label: "Sí, claramente" },
        { id: "aveces", label: "A veces" },
        { id: "no", label: "No, solo la espalda" },
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
        { id: "estres", label: "Al final del día" },
        { id: "manana", label: "Por las mañanas" },
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
        { id: "subaguda", label: "1 a 3 meses" },
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
  hombro: [
    {
      id: "cuando",
      text: "¿Cuándo molesta más el hombro?",
      options: [
        { id: "noche", label: "Por la noche / al dormir" },
        { id: "elevacion", label: "Al subir el brazo" },
        { id: "siempre", label: "Constantemente" },
      ],
    },
    {
      id: "duracion",
      text: "¿Cuánto llevas con esta molestia?",
      options: [
        { id: "semanas", label: "Menos de 1 mes" },
        { id: "meses", label: "1 a 6 meses" },
        { id: "largo", label: "Más de 6 meses" },
      ],
    },
  ],
  postop: [
    {
      id: "tiempo",
      text: "¿Cuándo fue la operación?",
      options: [
        { id: "reciente", label: "Hace menos de 1 mes" },
        { id: "meses", label: "1 a 3 meses" },
        { id: "tardio", label: "Más de 3 meses" },
      ],
    },
    {
      id: "estado",
      text: "¿Cómo describes tu recuperación?",
      options: [
        { id: "bien", label: "Va bien, pero quiero mejorar más" },
        { id: "lenta", label: "Más lenta de lo esperado" },
        { id: "estancada", label: "Llevas semanas sin avanzar" },
      ],
    },
  ],
  embarazo: [
    {
      id: "fase",
      text: "¿En qué momento estás?",
      options: [
        { id: "embarazo", label: "Estoy embarazada" },
        { id: "postparto_reciente", label: "Postparto reciente (menos de 6 meses)" },
        { id: "postparto_tardio", label: "Postparto hace más de 6 meses" },
      ],
    },
    {
      id: "molestia",
      text: "¿Qué te preocupa más?",
      options: [
        { id: "dolor", label: "Dolor de espalda o pelvis" },
        { id: "suelo_pelvico", label: "Suelo pélvico (pérdidas, presión...)" },
        { id: "vuelta", label: "Volver a hacer deporte o actividad" },
      ],
    },
  ],
};

interface Profile { title: string; body: string; chips: string[] }

function buildProfile(problem: ProblemId, answers: Record<string, string>): Profile {
  if (problem === "espalda") {
    const dur = answers.duracion;
    const baja = answers.baja;
    const apertura = dur === "reciente"
      ? "El dolor acaba de aparecer, pero ya está condicionando tu día a día. Te levantas pensando en él y te acuestas sin que haya desaparecido del todo."
      : dur === "meses"
      ? "Llevas meses conviviendo con un dolor que mejora un poco y vuelve. Ya has perdido la cuenta de las veces que has pensado que por fin se iba."
      : "Llevas más de medio año cargando con un dolor que ya sientes como parte de tu vida — tan normalizado que casi ni lo mencionas, pero que te limita para dormir, agacharte, coger a tus hijos o simplemente moverte con libertad.";
    const nervio = baja === "si"
      ? " El hecho de que baje por la pierna o notes hormigueos indica que hay una estructura comprimiendo el nervio ciático. Ningún antiinflamatorio ni reposo va a liberar esa compresión — necesita tratamiento manual sobre el origen."
      : baja === "aveces"
      ? " El hormigueo ocasional puede ser una señal temprana de que algo roza el nervio. Cuanto antes se trate, más fácil es revertirlo."
      : " La zona lumbar acumula tensión postural, muscular y emocional. Sin tratamiento dirigido, el ciclo se repite: mejora, recae, mejora, recae.";
    return {
      title: "Así es tu situación con la espalda",
      body: `${apertura}${nervio} Has probado el reposo, el calor, los antiinflamatorios... y el problema regresa. No es mala suerte: el origen nunca se ha tratado. Con fisioterapia manual específica podemos localizarlo y trabajar sobre él desde la primera sesión.`,
      chips: baja !== "no" ? ["Lumbalgia", "Ciática", "Nervio ciático"] : ["Lumbalgia", "Tensión postural", "Musculatura lumbar"],
    };
  }

  if (problem === "cervicales") {
    const cefalea = answers.cefalea;
    const cuando = answers.cuando;
    const apertura = cefalea === "diario"
      ? "El dolor de cabeza se ha convertido en parte de tu rutina. Tanto que ya no sabes si es normal o no, si hay que hacerle caso o ignorarlo."
      : cefalea === "frecuente"
      ? "Varias veces a la semana aparece ese dolor de cabeza que te quita concentración, energía y ganas. Ya tienes el ibuprofeno cerca por costumbre."
      : "El cuello avisa: tensión, rigidez, molestia al girar. El dolor de cabeza aún no es constante, pero cuando aparece lo paraliza todo.";
    const patron = cuando === "ordenador"
      ? " Que empeore en el ordenador no es casualidad: mantener la cabeza adelantada durante horas sobrecarga las vértebras cervicales y la base del cráneo."
      : cuando === "estres"
      ? " Que empeore al final del día refleja una musculatura que ha aguantado horas de tensión acumulada sin poder liberarla."
      : cuando === "manana"
      ? " Despertar con el cuello cargado indica que la musculatura no descansa durante el sueño. La postura crónica y la tensión perpetúan el ciclo noche tras noche."
      : " Sin un patrón claro, el origen puede ser postural, articular o muscular — o los tres a la vez. Por eso es imprescindible una evaluación que vaya más allá del síntoma.";
    return {
      title: "Así es tu situación con las cervicales",
      body: `${apertura}${patron} Un trabajo preciso sobre la columna cervical, la base del cráneo y la musculatura de la nuca puede cambiar radicalmente cómo te sientes en el día a día — en pocas semanas.`,
      chips: ["Cervicalgia", "Cefalea tensional", "Contractura cervical"],
    };
  }

  if (problem === "deportiva") {
    const tiempo = answers.tiempo;
    const zona = answers.zona;
    const tiempoText = tiempo === "aguda"
      ? "La lesión acaba de ocurrir. Este es el momento más importante de toda la recuperación: lo que hagas en estas primeras semanas determina si te recuperas al cien por cien o si el problema se arrastra durante meses."
      : tiempo === "subaguda"
      ? "Han pasado uno a tres meses. Sientes que ha mejorado, pero no estás al cien por cien. Quizás tienes miedo de recaer, o algo no termina de funcionar como antes."
      : "La lesión ya es crónica o vuelve una y otra vez. Eso no es mala suerte: significa que el origen nunca se resolvió del todo. Cada recaída deja la zona más vulnerable.";
    const zonaText = zona === "tren_inferior"
      ? " En tobillo, rodilla y cadera, una recuperación incompleta no solo limita el rendimiento — altera toda la cadena de movimiento."
      : zona === "muscular"
      ? " Las roturas o sobrecargas musculares necesitan una cicatrización dirigida. Sin estímulo adecuado, el tejido que queda es más rígido y propenso a romperse de nuevo."
      : " Sea cual sea la zona, el cuerpo necesita cargas controladas y progresivas para sanar bien, no solo reposo y tiempo.";
    return {
      title: "Así es tu situación con la lesión deportiva",
      body: `${tiempoText}${zonaText} El objetivo no es solo que deje de doler: es que vuelvas a tu nivel anterior con confianza, sin miedo a recaer.`,
      chips: ["Lesión deportiva", "Rehabilitación funcional", "Vuelta al deporte"],
    };
  }

  if (problem === "hombro") {
    const cuando = answers.cuando;
    const duracion = answers.duracion;
    const apertura = cuando === "noche"
      ? "No poder dormir del lado que te duele es agotador. Llevas noches dando vueltas, buscando una postura que no duela, y por las mañanas el hombro está igual o peor."
      : cuando === "elevacion"
      ? "Levantar el brazo se ha convertido en algo que evitas. Coger cosas del estante, ponerte la chaqueta, peinarte — gestos que antes hacías sin pensar ahora los mides."
      : "El dolor ya es constante. No hay postura cómoda ni momento del día en que el hombro descanse del todo.";
    const tiempo = duracion === "semanas"
      ? " Tratarlo ahora evita que se cronifique — cuanto antes se interviene, más rápida es la recuperación."
      : duracion === "meses"
      ? " Llevas meses aguantando. La articulación empieza a perder movilidad si no se trabaja a tiempo."
      : " Más de seis meses con el hombro limitado significa que el tejido se ha adaptado a la restricción. Se puede recuperar, pero necesita trabajo específico y progresivo.";
    return {
      title: "Así es tu situación con el hombro",
      body: `${apertura}${tiempo} Con terapia manual específica sobre la articulación glenohumeral y la musculatura periescapular podemos recuperar la movilidad y eliminar el dolor de forma progresiva.`,
      chips: ["Hombro doloroso", "Manguito rotador", "Movilidad articular"],
    };
  }

  if (problem === "embarazo") {
    const fase = answers.fase;
    const molestia = answers.molestia;
    const apertura = fase === "embarazo"
      ? "El embarazo transforma el cuerpo en pocos meses. El centro de gravedad cambia, la pelvis se adapta, los ligamentos se aflojan — y todo eso tiene consecuencias que se pueden tratar sin esperar a que pasen solos."
      : fase === "postparto_reciente"
      ? "Los primeros meses tras el parto son los más importantes para tu recuperación. El cuerpo ha hecho un esfuerzo enorme y necesita ayuda para volver a funcionar bien — por dentro y por fuera."
      : "Llevas más de seis meses en el postparto y todavía notas que algo no ha vuelto del todo. No es normal y no tienes que aceptarlo como parte de 'ser madre'.";
    const molestiaText = molestia === "dolor"
      ? " El dolor de espalda o pelvis durante o después del embarazo tiene un origen muy concreto y tratable — no es 'lo que toca pasar'."
      : molestia === "suelo_pelvico"
      ? " Las pérdidas, la presión o la sensación de pesadez son señales de que el suelo pélvico necesita atención. Se puede recuperar con trabajo específico."
      : " Volver al deporte o a la actividad física tras el embarazo necesita una progresión adecuada. Sin ella, el riesgo de lesión o recaída es mucho mayor.";
    return {
      title: "Así es tu situación",
      body: `${apertura}${molestiaText} Carmen trabaja con mujeres en todas las fases del embarazo y postparto con un enfoque personalizado y basado en evidencia.`,
      chips: ["Fisioterapia obstétrica", "Suelo pélvico", "Postparto"],
    };
  }

  // postop
  const tiempo = answers.tiempo;
  const estado = answers.estado;
  const apertura = tiempo === "reciente"
    ? "La operación es reciente y estás en la fase más determinante de toda la recuperación. Lo que hagas en estos primeros meses marca el resultado final — no el cirujano, sino la rehabilitación."
    : tiempo === "meses"
    ? "Ya han pasado unos meses. Es el momento de pedirle más al cuerpo: ganar fuerza real, recuperar el rango completo y empezar a confiar de nuevo en la zona operada."
    : "La operación fue hace tiempo, pero algo no termina de ir como esperabas. Puede que te hayas estancado o que simplemente no hayas vuelto a tu nivel de antes.";
  const estadoText = estado === "bien"
    ? " Que vaya bien no significa que no pueda ir mejor. Muchos pacientes se quedan en un 80% sin saber que con el estímulo adecuado pueden llegar al 100%."
    : estado === "lenta"
    ? " Una recuperación lenta casi siempre indica que falta el estímulo adecuado. El tejido necesita cargas progresivas para regenerarse — el reposo solo no lo hace."
    : " Llevar semanas sin avanzar es la señal más clara de que el proceso necesita un replanteamiento. No es normal estancarse, y tiene solución.";
  return {
    title: "Así es tu situación en el postoperatorio",
    body: `${apertura}${estadoText} Diseñamos un plan adaptado exactamente a tu intervención y al punto en el que estás — no un protocolo genérico, sino el tuyo.`,
    chips: ["Rehabilitación postquirúrgica", "Recuperación funcional", "Vuelta a la actividad"],
  };
}

export default function QuizProblemas() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemId | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>("select");

  const currentQuestions = selectedProblem ? QUESTIONS[selectedProblem] : [];
  const allAnswered = currentQuestions.every(q => answers[q.id]);
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

  return (
    <section style={{ padding: "4.5rem 1.5rem", backgroundColor: "white" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            ¿Te suena alguna de estas situaciones?
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1.0625rem" }}>
            {step === "select" && "Selecciona lo que mejor te describe. Recibirás una valoración personalizada."}
            {step === "questions" && "Dos preguntas rápidas para entender mejor tu caso."}
            {step === "profile" && "Hemos entendido tu situación."}
          </p>
        </div>

        {/* PASO 1: TARJETAS */}
        {step === "select" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {PROBLEMS.map(({ id, emoji, title, situaciones }) => (
              <button key={id} onClick={() => selectProblem(id)}
                style={{ textAlign: "left", padding: "1.5rem", backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "1rem", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = AQUA; e.currentTarget.style.boxShadow = "0 4px 16px rgba(8,145,178,0.12)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{emoji}</div>
                <p style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.875rem", color: "#111827" }}>{title}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem 0", display: "grid", gap: "0.5rem" }}>
                  {situaciones.map(s => (
                    <li key={s} style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.4, display: "flex", alignItems: "flex-start", gap: "0.375rem" }}>
                      <span style={{ color: AQUA, flexShrink: 0, marginTop: "0.1rem" }}>›</span>{s}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: AQUA, fontSize: "0.8125rem", fontWeight: 700 }}>
                  Esto me describe <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: PREGUNTAS */}
        {step === "questions" && selectedData && (
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "0.875rem 1.25rem", backgroundColor: "#F0FDFA", borderRadius: "0.75rem", border: `1.5px solid ${AQUA}` }}>
              <span style={{ fontSize: "1.25rem" }}>{selectedData.emoji}</span>
              <span style={{ fontWeight: 700, color: AQUA_DARK, fontSize: "0.9375rem" }}>{selectedData.title}</span>
              <button onClick={reset} style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
                Cambiar →
              </button>
            </div>

            <div style={{ display: "grid", gap: "2rem" }}>
              {currentQuestions.map((q, qi) => (
                <div key={q.id}>
                  <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.875rem", color: "#111827" }}>
                    <span style={{ color: AQUA, marginRight: "0.5rem" }}>{qi + 1}.</span>{q.text}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {q.options.map(opt => {
                      const selected = answers[q.id] === opt.id;
                      return (
                        <button key={opt.id} onClick={() => answer(q.id, opt.id)}
                          style={{ padding: "0.625rem 1.125rem", borderRadius: "2rem", border: `1.5px solid ${selected ? AQUA : "#e5e7eb"}`, backgroundColor: selected ? "#CFFAFE" : "white", color: selected ? AQUA_DARK : "#374151", fontWeight: selected ? 700 : 500, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s" }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2.5rem" }}>
              <button onClick={() => setStep("profile")} disabled={!allAnswered}
                style={{ width: "100%", padding: "1rem", backgroundColor: allAnswered ? AQUA : "#e5e7eb", color: allAnswered ? "white" : "#9ca3af", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: "0.625rem", cursor: allAnswered ? "pointer" : "not-allowed", transition: "background-color 0.2s" }}>
                Ver mi situación →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: PERFIL */}
        {step === "profile" && profile && selectedData && (
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <div style={{ backgroundColor: "#F0FDFA", borderRadius: "1.25rem", padding: "2rem", border: `1.5px solid ${AQUA}`, marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{selectedData.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#111827" }}>{profile.title}</span>
              </div>
              <p style={{ color: "#374151", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.25rem" }}>
                {profile.body}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {profile.chips.map(c => (
                  <span key={c} style={{ fontSize: "0.8125rem", padding: "0.25rem 0.75rem", backgroundColor: "#CFFAFE", color: AQUA_DARK, borderRadius: 999, fontWeight: 600 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: AQUA, borderRadius: "1rem", padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
              <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "1.25rem", fontSize: "1rem", lineHeight: 1.6 }}>
                Esto tiene solución. Carmen puede evaluarte esta semana.
              </p>
              <a href="#reservar" style={{ display: "inline-block", backgroundColor: "white", color: AQUA, fontWeight: 800, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                Reservar mi primera cita →
              </a>
            </div>

            <button onClick={reset} style={{ width: "100%", padding: "0.75rem", background: "none", border: "1.5px solid #e5e7eb", borderRadius: "0.625rem", color: "#6b7280", fontSize: "0.875rem", cursor: "pointer" }}>
              ← Ver otros problemas
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
