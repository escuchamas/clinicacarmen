export interface Paciente {
  id: string;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  poblacion: string;
  fechaAlta: string;
  lopdFirmada: boolean;
  lopdFecha?: string;
}

export interface HistoriaClinica {
  pacienteId: string;
  profesion: string;
  alergias: string;
  ejercicioFisico: string;
  motivoConsulta: string;
  antecedentesPersonalesFamiliares: string;
  calidadSueno: string;
  patologias: string;
  tabaquismo: string;
  medicacion: string;
  implantesMetalicos: string;
  embarazoLactancia: string;
  semanasEmbarazo: string;
  banderasRojas: string[];
  pruebaTipo: string;
  pruebaFecha: string;
  pruebaDiagnostico: string;
  pruebaImagenUrl?: string;
  fechaCreacion: string;
}

export interface TratamientoEvolucion {
  id: string;
  pacienteId: string;
  fecha: string;
  nSesion: number;
  contenido: string;
  fechaCreacion: string;
}

export interface EjercicioPostSesion {
  nombre: string;
  dosis: string;
  indicaciones: string;
}

export interface InformePostSesion {
  id: string;
  pacienteId: string;
  sesionId: string;
  fecha: string;
  ejercicios: EjercicioPostSesion[];
  fechaCreacion: string;
}

export interface WizardData {
  paso1: {
    dni: string;
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    fechaNacimiento: string;
    poblacion: string;
    lopdFirmada: boolean;
  };
  paso2: {
    profesion: string;
    alergias: string;
    ejercicioFisico: string;
  };
  paso3: {
    motivoConsulta: string;
  };
  paso4: {
    antecedentesPersonalesFamiliares: string;
    calidadSueno: string;
    patologias: string;
    tabaquismo: string;
    medicacion: string;
    implantesMetalicos: string;
    embarazoLactancia: string;
    semanasEmbarazo: string;
  };
  paso5: {
    banderasRojas: string[];
    pruebaTipo: string;
    pruebaFecha: string;
    pruebaDiagnostico: string;
  };
}

export type EstadoCita = "pendiente" | "confirmada" | "cancelada" | "completada";

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  fecha: string;
  hora: string;
  duracion: number;
  motivo: string;
  estado: EstadoCita;
  notas: string;
  fechaCreacion: string;
}

export const ESTADO_CITA_LABELS: Record<EstadoCita, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
};

export const ESTADO_CITA_COLORS: Record<EstadoCita, string> = {
  pendiente: "#f59e0b",
  confirmada: "#10b981",
  cancelada: "#ef4444",
  completada: "#6b7280",
};

export type CategoriaCoste = "alquiler" | "material" | "suministros" | "formacion" | "marketing" | "otro";

export interface Coste {
  id: string;
  fecha: string;
  concepto: string;
  importe: number;
  categoria: CategoriaCoste;
  notas: string;
  fechaCreacion: string;
}

export const CATEGORIA_COSTE_LABELS: Record<CategoriaCoste, string> = {
  alquiler: "Alquiler",
  material: "Material clínico",
  suministros: "Suministros",
  formacion: "Formación",
  marketing: "Marketing",
  otro: "Otro",
};

export const TARIFA_POR_30MIN = 35; // €

export type EstadoClase = "activa" | "cancelada";
export type EstadoInscripcion = "inscrita" | "cancelada" | "penalizada";

export interface ClasePilates {
  id: string;
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  notas: string;
  estado: EstadoClase;
  inscritosCount: number;
  fechaCreacion: string;
}

export interface InscripcionPilates {
  id: string;
  pacienteId: string;
  claseId: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
  fechaCancelacion?: string;
  pacienteNombre?: string;
  pacienteEmail?: string;
  pacienteTelefono?: string;
}

export const BANDERAS_ROJAS_LISTA = [
  "Psiquiatría: Estrés post traumático, adicción a las drogas/alcohol, trastornos de personalidad",
  "Dolor repentino severo",
  "Dolor tras traumatismo. Dolor continuo que no mejora con nada y/o deformidades",
  "Mayor de 50 años",
  "Fiebre",
  "Diabetes, tuberculosis o infecciones recientes",
  "Antecedentes de cáncer",
  "Pérdida de peso rápida e inexplicable, dolor nocturno injustificado y otros factores asociados",
  "Déficits neurológicos severos bilaterales, en silla de montar o incontinencia fecal o urinaria",
];
