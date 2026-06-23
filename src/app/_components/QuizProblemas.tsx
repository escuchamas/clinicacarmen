"use client";

import { useState } from "react";
import { ChevronRight, Bone, Brain, Dumbbell, Zap, Stethoscope, Baby, X, type LucideIcon } from "lucide-react";

const AQUA = "#8E7D6B";
const AQUA_DARK = "#735E52";

type ProblemId = "espalda" | "cervicales" | "deportiva" | "hombro" | "postop" | "embarazo";
type ModalStep = "questions" | "profile";

interface Problem {
  id: ProblemId;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const PROBLEMS: Problem[] = [
  { id: "espalda",    icon: Bone,        title: "Dolor de espalda",      desc: "Lumbar, ciática, contracturas" },
  { id: "cervicales", icon: Brain,       title: "Cervicales y cabeza",   desc: "Tensión, cefaleas, rigidez" },
  { id: "deportiva",  icon: Dumbbell,    title: "Lesión deportiva",      desc: "Tendinitis, esguinces, sobrecargas" },
  { id: "hombro",     icon: Zap,         title: "Hombro y brazo",        desc: "Manguito, movilidad, dolor nocturno" },
  { id: "postop",     icon: Stethoscope, title: "Postoperatorio",        desc: "Rehabilitación, recuperación funcional" },
  { id: "embarazo",   icon: Baby,        title: "Embarazo y postparto",  desc: "Pelvis, suelo pélvico, postparto" },
];

type QuestionOption = { id: string; label: string };
type Question = { id: string; text: string; options: QuestionOption[] };

const QUESTIONS: Record<ProblemId, Question[]> = {
  espalda: [
    {
      id: "levantarse",
      text: "Cuando llevas un rato sentado y te levantas de la silla, ¿necesitas unos segundos para ponerte del todo recto?",
      options: [
        { id: "siempre", label: "Sí, siempre — me levanto encorvado" },
        { id: "aveces", label: "A veces, depende del día" },
        { id: "no", label: "No, me levanto bien" },
      ],
    },
    {
      id: "baja",
      text: "¿Notas que el dolor baja por el glúteo o la pierna, o a veces tienes hormigueo o entumecimiento?",
      options: [
        { id: "si", label: "Sí — me baja por la pierna" },
        { id: "aveces", label: "Alguna vez lo he notado" },
        { id: "no", label: "No, se queda en la espalda" },
      ],
    },
  ],
  cervicales: [
    {
      id: "final_dia",
      text: "Al final del día, ¿sientes el cuello como si llevaras encima el peso de todas las horas — tenso, cargado, con ganas de que alguien te lo apriete?",
      options: [
        { id: "si", label: "Sí, es exactamente esa sensación" },
        { id: "aveces", label: "A veces, no siempre" },
        { id: "no", label: "No tanto" },
      ],
    },
    {
      id: "cabeza",
      text: "¿El dolor de cabeza empieza en la nuca o en la base del cráneo y sube hacia la frente?",
      options: [
        { id: "si", label: "Sí, siempre empieza ahí" },
        { id: "aveces", label: "A veces sigue ese recorrido" },
        { id: "no", label: "No tengo ese patrón / no tengo dolor de cabeza" },
      ],
    },
  ],
  deportiva: [
    {
      id: "gesto",
      text: "¿Hay algún gesto concreto que ya evitas hacer — saltar, girar, frenar — porque sabes que va a doler o te da «miedo»?",
      options: [
        { id: "si", label: "Sí — hay gestos que esquivo sin pensarlo" },
        { id: "aveces", label: "Los pienso antes de hacerlos" },
        { id: "no", label: "No, lo hago todo igual que antes" },
      ],
    },
    {
      id: "reposo",
      text: "Cuando descansas unos días, ¿el dolor mejora pero vuelve en cuanto retomas la actividad?",
      options: [
        { id: "si", label: "Sí, exactamente — el reposo no lo cura" },
        { id: "parcial", label: "Mejora pero no desaparece del todo" },
        { id: "no", label: "No, con reposo mejora y no vuelve" },
      ],
    },
  ],
  hombro: [
    {
      id: "movimiento",
      text: "¿Hay algún movimiento cotidiano que ya haces diferente — ponerte el cinturón de seguridad, abrocharte por detrás, meterte la mano en el bolsillo trasero?",
      options: [
        { id: "si", label: "Sí — ya los hago de otra forma o los evito" },
        { id: "aveces", label: "Algunos me cuestan" },
        { id: "no", label: "No me limita así" },
      ],
    },
    {
      id: "noche",
      text: "Por la noche, si te giras y caes sobre ese hombro, ¿te despierta el dolor?",
      options: [
        { id: "si", label: "Sí — me despierta o me impide dormir de ese lado" },
        { id: "aveces", label: "A veces me molesta" },
        { id: "no", label: "No me afecta al dormir" },
      ],
    },
  ],
  postop: [
    {
      id: "confianza",
      text: "¿Confías en esa zona para hacer esfuerzo normal — cargar bolsas, subir escaleras, hacer deporte — o todavía la «proteges» sin darte cuenta?",
      options: [
        { id: "protejo", label: "La protejo todo el tiempo, casi sin darme cuenta" },
        { id: "aveces", label: "A veces la protejo, a veces no" },
        { id: "confio", label: "Ya confío bastante en ella" },
      ],
    },
    {
      id: "avance",
      text: "¿Llevas semanas haciendo los mismos ejercicios de rehabilitación sin notar que avanzas?",
      options: [
        { id: "si", label: "Sí — siento que me he estancado" },
        { id: "lento", label: "Avanzo, pero muy lento" },
        { id: "no", label: "Sigo progresando bien" },
      ],
    },
  ],
  embarazo: [
    {
      id: "actividad",
      text: "¿Hay alguna actividad del día a día — coger al bebé, subir escaleras, levantarte de la cama — que hayas empezado a hacer diferente por las molestias?",
      options: [
        { id: "si", label: "Sí — he cambiado muchas cosas" },
        { id: "algunas", label: "Alguna cosa, sí" },
        { id: "no", label: "No ha cambiado mi forma de moverme" },
      ],
    },
    {
      id: "antes",
      text: "¿Antes del embarazo o el parto ya tenías estas molestias, o son completamente nuevas?",
      options: [
        { id: "nuevas", label: "Son completamente nuevas" },
        { id: "peor", label: "Tenía algo, pero empeoró mucho" },
        { id: "antes", label: "Ya las tenía antes" },
      ],
    },
  ],
};

interface Profile { title: string; body: string; chips: string[] }

function buildProfile(problem: ProblemId, answers: Record<string, string>): Profile {
  if (problem === "espalda") {
    const baja = answers.baja;
    const nervio = baja === "si"
      ? " El hecho de que baje por la pierna o notes hormigueos indica que hay una estructura comprimiendo el nervio ciático. Ningún antiinflamatorio ni reposo va a liberar esa compresión — necesita tratamiento manual sobre el origen."
      : baja === "aveces"
      ? " El hormigueo ocasional puede ser una señal temprana de que algo roza el nervio. Cuanto antes se trate, más fácil es revertirlo."
      : " La zona lumbar acumula tensión postural, muscular y emocional. Sin tratamiento dirigido, el ciclo se repite: mejora, recae, mejora, recae.";
    return {
      title: "Así es tu situación con la espalda",
      body: `Has probado el reposo, el calor, los antiinflamatorios... y el problema regresa. No es mala suerte: el origen nunca se ha tratado.${nervio} Con fisioterapia manual específica podemos localizarlo y trabajar sobre él desde la primera sesión.`,
      chips: baja !== "no" ? ["Lumbalgia", "Ciática", "Nervio ciático"] : ["Lumbalgia", "Tensión postural", "Musculatura lumbar"],
    };
  }

  if (problem === "cervicales") {
    const cefalea = answers.final_dia;
    const patron = answers.cabeza;
    const apertura = cefalea === "si"
      ? "El cuello aguanta horas de tensión acumulada sin poder liberarla. El dolor de cabeza ya no te sorprende — forma parte del día."
      : "El cuello avisa: tensión, rigidez, molestia al girar. El dolor de cabeza aún no es constante, pero cuando aparece lo paraliza todo.";
    const patronText = patron === "si"
      ? " Que empiece en la nuca y suba hacia la frente es la firma de la cefalea cervicogénica: el origen no está en la cabeza, sino en las vértebras cervicales y la musculatura de la nuca."
      : " Un trabajo preciso sobre la columna cervical y la base del cráneo puede cambiar radicalmente cómo te sientes en el día a día.";
    return {
      title: "Así es tu situación con las cervicales",
      body: `${apertura}${patronText} Sin tratamiento, el ciclo se perpetúa: tensión → dolor de cabeza → más tensión. En pocas semanas de trabajo específico se puede romper ese patrón.`,
      chips: ["Cervicalgia", "Cefalea tensional", "Contractura cervical"],
    };
  }

  if (problem === "deportiva") {
    const reposo = answers.reposo;
    const tiempoText = reposo === "si"
      ? "El hecho de que mejore con reposo pero vuelva con la actividad confirma que el origen nunca se resolvió del todo. Cada recaída deja la zona más vulnerable."
      : reposo === "parcial"
      ? "Que no desaparezca del todo ni con reposo indica que el tejido necesita un estímulo activo — no solo tiempo — para regenerarse correctamente."
      : "Que el reposo lo resuelva no significa que el problema esté resuelto: puede volver con la próxima carga. Mejor evaluar el origen antes de que lo haga.";
    return {
      title: "Así es tu situación con la lesión deportiva",
      body: `${tiempoText} El objetivo no es solo que deje de doler: es que vuelvas a tu nivel anterior con confianza, sin miedo a recaer y sin compensaciones que generen otros problemas más adelante.`,
      chips: ["Lesión deportiva", "Rehabilitación funcional", "Vuelta al deporte"],
    };
  }

  if (problem === "hombro") {
    const noche = answers.noche;
    const movimiento = answers.movimiento;
    const apertura = noche === "si"
      ? "No poder dormir del lado que te duele es agotador. Llevas noches dando vueltas, buscando una postura que no duela, y por las mañanas el hombro está igual o peor."
      : movimiento === "si"
      ? "Levantar el brazo, ponerte la chaqueta, alcanzar el estante — gestos que antes hacías sin pensar ahora los calculas. Eso es una limitación funcional real, aunque el dolor no sea constante."
      : "El hombro avisa: algo no funciona como debería. Sin tratamiento, la articulación pierde rango de movimiento progresivamente.";
    return {
      title: "Así es tu situación con el hombro",
      body: `${apertura} Con terapia manual específica sobre la articulación glenohumeral y la musculatura periescapular podemos recuperar la movilidad y eliminar el dolor de forma progresiva — sin cirugía en la mayoría de los casos.`,
      chips: ["Hombro doloroso", "Manguito rotador", "Movilidad articular"],
    };
  }

  if (problem === "embarazo") {
    const actividad = answers.actividad;
    const antes = answers.antes;
    const apertura = actividad === "si"
      ? "Cuando el cuerpo empieza a compensar en las actividades del día a día, es una señal clara de que necesita ayuda para recuperar su función normal."
      : "El cuerpo ha hecho un esfuerzo enorme durante el embarazo y el parto. A veces los síntomas tardan en aparecer — pero cuando lo hacen, tienen tratamiento.";
    const antesText = antes === "nuevas"
      ? " Que sean nuevas desde el embarazo o el parto confirma que el origen está en los cambios hormonales, posturales y biomecánicos de este proceso."
      : antes === "peor"
      ? " Que hayan empeorado con el embarazo o el parto indica que el cuerpo tenía una debilidad previa que ahora está al descubierto."
      : " Aunque las tenías antes, el embarazo y el parto las han agravado. Hay mucho que hacer desde la fisioterapia especializada.";
    return {
      title: "Así es tu situación",
      body: `${apertura}${antesText} No tienes que aceptarlo como parte de 'ser madre'. Carmen trabaja con mujeres en todas las fases del embarazo y postparto con un enfoque personalizado y basado en evidencia.`,
      chips: ["Fisioterapia obstétrica", "Suelo pélvico", "Postparto"],
    };
  }

  // postop
  const avance = answers.avance;
  const confianza = answers.confianza;
  const apertura = confianza === "protejo"
    ? "Proteger la zona operada sin darte cuenta es normal al principio — pero si sigue pasando meses después, es una señal de que la rehabilitación no ha llegado hasta el fondo."
    : confianza === "aveces"
    ? "Que a veces la protejas y a veces no indica que el sistema nervioso todavía no ha integrado esa zona como segura. El trabajo en fisioterapia puede acelerar ese proceso."
    : "Confiar en la zona es una buena señal — pero confiar no es lo mismo que haber recuperado el 100% de la función.";
  const avanceText = avance === "si"
    ? " Llevar semanas sin avanzar es la señal más clara de que el proceso necesita un replanteamiento. No es normal estancarse, y tiene solución."
    : avance === "lento"
    ? " Una recuperación lenta casi siempre indica que falta el estímulo adecuado. El tejido necesita cargas progresivas para regenerarse — el reposo solo no lo hace."
    : " Que sigas progresando es buena señal. Una evaluación puede confirmar que estás en el camino correcto y acelerar los últimos pasos.";
  return {
    title: "Así es tu situación en el postoperatorio",
    body: `${apertura}${avanceText} Diseñamos un plan adaptado exactamente a tu intervención y al punto en el que estás — no un protocolo genérico, sino el tuyo.`,
    chips: ["Rehabilitación postquirúrgica", "Recuperación funcional", "Vuelta a la actividad"],
  };
}

export default function QuizProblemas() {
  const [selected, setSelected] = useState<ProblemId | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep>("questions");

  const currentQuestions = selected ? QUESTIONS[selected] : [];
  const allAnswered = currentQuestions.every(q => answers[q.id]);
  const selectedData = PROBLEMS.find(p => p.id === selected);
  const profile = modalStep === "profile" && selected ? buildProfile(selected, answers) : null;

  function openModal(id: ProblemId) {
    setSelected(id);
    setAnswers({});
    setModalStep("questions");
  }

  function closeModal() {
    setSelected(null);
    setAnswers({});
    setModalStep("questions");
  }

  function answer(questionId: string, optionId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }

  return (
    <section style={{ padding: "4.5rem 1.5rem", backgroundColor: "#F5EFE9" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
          <span style={{
            display: "inline-block", backgroundColor: AQUA, color: "white",
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0.35rem 1rem", borderRadius: 999, marginBottom: "1.25rem",
          }}>
            Encuentra tu tratamiento
          </span>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            ¿Qué zona te molesta?
          </h2>
          <p style={{ color: "#4b5563", fontSize: "1.0625rem", maxWidth: 520, margin: "0 auto" }}>
            Cuéntanos tu problema y te decimos si podemos ayudarte — en menos de un minuto.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
          {PROBLEMS.map(({ id, icon: Icon, title, desc }) => (
            <button
              key={id}
              onClick={() => openModal(id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "1rem",
                padding: "1.375rem 1.25rem",
                backgroundColor: "white",
                border: "1.5px solid #EDE0D8",
                borderRadius: "1rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, box-shadow 0.15s, transform 0.1s",
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = AQUA;
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(155,123,104,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = "#EDE0D8";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                flexShrink: 0, width: 44, height: 44, borderRadius: "0.75rem",
                backgroundColor: "#FAF6F2", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={22} color={AQUA} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1C1410", marginBottom: "0.25rem" }}>{title}</p>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.4 }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* Modal */}
      {selected && selectedData && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={closeModal}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "1.25rem",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
              <selectedData.icon size={20} color={AQUA} strokeWidth={1.75} />
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1C1410", flex: 1 }}>{selectedData.title}</span>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.25rem", lineHeight: 1 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>

              {/* PREGUNTAS */}
              {modalStep === "questions" && (
                <>
                  <div style={{ display: "grid", gap: "1.75rem" }}>
                    {currentQuestions.map((q, qi) => (
                      <div key={q.id}>
                        <p style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.875rem", color: "#1C1410", lineHeight: 1.6 }}>
                          <span style={{ color: AQUA, marginRight: "0.375rem" }}>{qi + 1}.</span>{q.text}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {q.options.map(opt => {
                            const sel = answers[q.id] === opt.id;
                            return (
                              <button key={opt.id} onClick={() => answer(q.id, opt.id)}
                                style={{ padding: "0.5625rem 1.125rem", borderRadius: "999px", border: `1.5px solid ${sel ? AQUA : "#e5e7eb"}`, backgroundColor: sel ? "#EDE0D8" : "white", color: sel ? AQUA_DARK : "#374151", fontWeight: sel ? 700 : 500, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s" }}>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setModalStep("profile")}
                    disabled={!allAnswered}
                    style={{ width: "100%", marginTop: "2rem", padding: "0.9375rem", backgroundColor: allAnswered ? AQUA : "#e5e7eb", color: allAnswered ? "white" : "#9ca3af", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: "0.75rem", cursor: allAnswered ? "pointer" : "not-allowed", transition: "background-color 0.2s" }}
                  >
                    Ver mi situación →
                  </button>
                </>
              )}

              {/* PERFIL */}
              {modalStep === "profile" && profile && (
                <>
                  <div style={{ backgroundColor: "#FAF6F2", borderRadius: "1rem", padding: "1.5rem", border: `1.5px solid ${AQUA}`, marginBottom: "1.25rem" }}>
                    <p style={{ fontWeight: 800, fontSize: "1rem", color: "#1C1410", marginBottom: "0.875rem" }}>{profile.title}</p>
                    <p style={{ color: "#374151", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1rem" }}>{profile.body}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {profile.chips.map(c => (
                        <span key={c} style={{ fontSize: "0.8125rem", padding: "0.25rem 0.75rem", backgroundColor: "#EDE0D8", color: AQUA_DARK, borderRadius: 999, fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ backgroundColor: AQUA, borderRadius: "0.875rem", padding: "1.5rem", textAlign: "center", marginBottom: "0.75rem" }}>
                    <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "1rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                      Esto tiene solución. Carmen puede evaluarte esta semana.
                    </p>
                    <a href="#reservar" onClick={closeModal}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: "white", color: AQUA, fontWeight: 800, fontSize: "0.9375rem", padding: "0.75rem 1.75rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                      Reservar mi primera cita <ChevronRight size={16} />
                    </a>
                  </div>

                  <button onClick={() => setModalStep("questions")}
                    style={{ width: "100%", padding: "0.625rem", background: "none", border: "1.5px solid #e5e7eb", borderRadius: "0.625rem", color: "#6b7280", fontSize: "0.875rem", cursor: "pointer" }}>
                    ← Volver a las preguntas
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
