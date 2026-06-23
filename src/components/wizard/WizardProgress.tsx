"use client";

interface Step {
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { label: "Datos", icon: "👤" },
  { label: "Personal", icon: "💼" },
  { label: "Consulta", icon: "🩺" },
  { label: "Antecedentes", icon: "📋" },
  { label: "Banderas", icon: "🚩" },
  { label: "Revisión", icon: "✅" },
];

interface Props {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps: number[];
}

export default function WizardProgress({ currentStep, onStepClick, completedSteps }: Props) {
  return (
    <div className="w-full mb-8">
      {/* Barra de progreso */}
      <div className="relative">
        <div
          className="absolute top-5 left-0 h-0.5 transition-all duration-500"
          style={{
            backgroundColor: "#9B7B68",
            width: `${(Math.max(currentStep - 1, 0) / (STEPS.length - 1)) * 100}%`,
          }}
        />
        <div
          className="absolute top-5 left-0 right-0 h-0.5"
          style={{ backgroundColor: "#DDD8CE" }}
        />

        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isCompleted = completedSteps.includes(stepNum);
            const isCurrent = stepNum === currentStep;
            const isClickable = isCompleted && onStepClick;

            return (
              <button
                key={i}
                onClick={() => isClickable && onStepClick(stepNum)}
                disabled={!isCompleted || !onStepClick}
                className="flex flex-col items-center gap-1.5"
                style={{ background: "none", border: "none", cursor: isClickable ? "pointer" : "default" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-200 border-2"
                  style={{
                    backgroundColor: isCompleted || isCurrent ? "#9B7B68" : "white",
                    borderColor: isCompleted || isCurrent ? "#9B7B68" : "#DDD8CE",
                    transform: isCurrent ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {isCompleted && !isCurrent ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: isCurrent ? "#9B7B68" : isCompleted ? "#6b7280" : "#9ca3af" }}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
