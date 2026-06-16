import { neon } from "@neondatabase/serverless";
import { Paciente, HistoriaClinica, TratamientoEvolucion, InformePostSesion, Cita, EstadoCita, Coste, CategoriaCoste } from "./types";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Pacientes ────────────────────────────────────────────────────────────────

export async function getPacientes(): Promise<Paciente[]> {
  const db = sql();
  const rows = await db`SELECT * FROM pacientes ORDER BY fecha_alta DESC`;
  return rows.map(rowToPaciente);
}

export async function searchPacientes(q: string): Promise<Paciente[]> {
  const db = sql();
  const term = `%${q.toLowerCase()}%`;
  const rows = await db`
    SELECT * FROM pacientes
    WHERE LOWER(dni) LIKE ${term}
       OR LOWER(nombre) LIKE ${term}
       OR LOWER(apellidos) LIKE ${term}
       OR LOWER(email) LIKE ${term}
    ORDER BY fecha_alta DESC
  `;
  return rows.map(rowToPaciente);
}

export async function getPacienteById(id: string): Promise<Paciente | null> {
  const db = sql();
  const rows = await db`SELECT * FROM pacientes WHERE id = ${id}`;
  return rows.length > 0 ? rowToPaciente(rows[0]) : null;
}

export async function getPacienteByDni(dni: string): Promise<Paciente | null> {
  const db = sql();
  const rows = await db`SELECT * FROM pacientes WHERE LOWER(dni) = LOWER(${dni})`;
  return rows.length > 0 ? rowToPaciente(rows[0]) : null;
}

export async function createPaciente(data: Omit<Paciente, "id" | "fechaAlta">): Promise<Paciente> {
  const db = sql();
  const id = generateId();
  const fechaAlta = new Date().toISOString().split("T")[0];
  const fechaNacimiento = data.fechaNacimiento || null;
  const lopdFecha = data.lopdFirmada ? fechaAlta : null;
  await db`
    INSERT INTO pacientes (id, dni, nombre, apellidos, email, telefono, fecha_nacimiento, poblacion, fecha_alta, lopd_firmada, lopd_fecha)
    VALUES (${id}, ${data.dni}, ${data.nombre}, ${data.apellidos}, ${data.email}, ${data.telefono}, ${fechaNacimiento}, ${data.poblacion}, ${fechaAlta}, ${data.lopdFirmada}, ${lopdFecha})
  `;
  return { ...data, id, fechaAlta };
}

export async function updatePaciente(id: string, data: Partial<Omit<Paciente, "id" | "fechaAlta">>): Promise<void> {
  const db = sql();
  await db`
    UPDATE pacientes SET
      dni = COALESCE(${data.dni ?? null}, dni),
      nombre = COALESCE(${data.nombre ?? null}, nombre),
      apellidos = COALESCE(${data.apellidos ?? null}, apellidos),
      email = COALESCE(${data.email ?? null}, email),
      telefono = COALESCE(${data.telefono ?? null}, telefono),
      fecha_nacimiento = COALESCE(${data.fechaNacimiento ?? null}, fecha_nacimiento),
      poblacion = COALESCE(${data.poblacion ?? null}, poblacion),
      lopd_firmada = COALESCE(${data.lopdFirmada ?? null}, lopd_firmada),
      lopd_fecha = CASE WHEN ${data.lopdFirmada ?? null} = TRUE AND lopd_fecha IS NULL THEN CURRENT_DATE ELSE lopd_fecha END
    WHERE id = ${id}
  `;
}

// ─── Historia Clínica ─────────────────────────────────────────────────────────

export async function getHistoriaClinica(pacienteId: string): Promise<HistoriaClinica | null> {
  const db = sql();
  const rows = await db`SELECT * FROM historia_clinica WHERE paciente_id = ${pacienteId}`;
  return rows.length > 0 ? rowToHistoria(rows[0]) : null;
}

export async function createHistoriaClinica(data: HistoriaClinica): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO historia_clinica (
      paciente_id, profesion, alergias, ejercicio_fisico, motivo_consulta,
      antecedentes_personales_familiares, calidad_sueno, patologias, tabaquismo,
      medicacion, implantes_metalicos, embarazo_lactancia, semanas_embarazo,
      banderas_rojas, prueba_tipo, prueba_fecha, prueba_diagnostico, prueba_imagen_url, fecha_creacion
    ) VALUES (
      ${data.pacienteId}, ${data.profesion}, ${data.alergias}, ${data.ejercicioFisico},
      ${data.motivoConsulta}, ${data.antecedentesPersonalesFamiliares}, ${data.calidadSueno},
      ${data.patologias}, ${data.tabaquismo}, ${data.medicacion}, ${data.implantesMetalicos},
      ${data.embarazoLactancia}, ${data.semanasEmbarazo},
      ${JSON.stringify(data.banderasRojas)}, ${data.pruebaTipo}, ${data.pruebaFecha || null},
      ${data.pruebaDiagnostico}, ${data.pruebaImagenUrl ?? null}, NOW()
    )
  `;
}

export async function updateHistoriaClinica(pacienteId: string, data: Partial<HistoriaClinica>): Promise<void> {
  const db = sql();
  const current = await getHistoriaClinica(pacienteId);
  if (!current) throw new Error("Historia clínica no encontrada");
  const merged = { ...current, ...data };
  await db`
    UPDATE historia_clinica SET
      profesion = ${merged.profesion},
      alergias = ${merged.alergias},
      ejercicio_fisico = ${merged.ejercicioFisico},
      motivo_consulta = ${merged.motivoConsulta},
      antecedentes_personales_familiares = ${merged.antecedentesPersonalesFamiliares},
      calidad_sueno = ${merged.calidadSueno},
      patologias = ${merged.patologias},
      tabaquismo = ${merged.tabaquismo},
      medicacion = ${merged.medicacion},
      implantes_metalicos = ${merged.implantesMetalicos},
      embarazo_lactancia = ${merged.embarazoLactancia},
      semanas_embarazo = ${merged.semanasEmbarazo},
      banderas_rojas = ${JSON.stringify(merged.banderasRojas)},
      prueba_tipo = ${merged.pruebaTipo},
      prueba_fecha = ${merged.pruebaFecha},
      prueba_diagnostico = ${merged.pruebaDiagnostico},
      prueba_imagen_url = ${merged.pruebaImagenUrl ?? null}
    WHERE paciente_id = ${pacienteId}
  `;
}

// ─── Tratamiento y Evolución ──────────────────────────────────────────────────

export async function getTratamientosByPaciente(pacienteId: string): Promise<TratamientoEvolucion[]> {
  const db = sql();
  const rows = await db`
    SELECT * FROM tratamiento_evolucion WHERE paciente_id = ${pacienteId} ORDER BY n_sesion ASC
  `;
  return rows.map(rowToTratamiento);
}

export async function createTratamiento(pacienteId: string, contenido: string): Promise<TratamientoEvolucion> {
  const db = sql();
  const existing = await getTratamientosByPaciente(pacienteId);
  const nSesion = existing.length + 2;
  const id = generateId();
  const fecha = new Date().toISOString().split("T")[0];
  await db`
    INSERT INTO tratamiento_evolucion (id, paciente_id, fecha, n_sesion, contenido, fecha_creacion)
    VALUES (${id}, ${pacienteId}, ${fecha}, ${nSesion}, ${contenido}, NOW())
  `;
  return { id, pacienteId, fecha, nSesion, contenido, fechaCreacion: fecha };
}

export async function updateTratamiento(id: string, contenido: string): Promise<void> {
  const db = sql();
  await db`UPDATE tratamiento_evolucion SET contenido = ${contenido} WHERE id = ${id}`;
}

// ─── Informe Post Sesión ──────────────────────────────────────────────────────

export async function createInformePostSesion(data: Omit<InformePostSesion, "id" | "fechaCreacion">): Promise<void> {
  const db = sql();
  const id = generateId();
  await db`
    INSERT INTO informe_post_sesion (id, paciente_id, sesion_id, fecha, ejercicios, fecha_creacion)
    VALUES (${id}, ${data.pacienteId}, ${data.sesionId}, ${data.fecha}, ${JSON.stringify(data.ejercicios)}, NOW())
  `;
}

export async function getInformeByTratamiento(sesionId: string): Promise<InformePostSesion | null> {
  const db = sql();
  const rows = await db`SELECT * FROM informe_post_sesion WHERE sesion_id = ${sesionId}`;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    pacienteId: r.paciente_id,
    sesionId: r.sesion_id,
    fecha: r.fecha,
    ejercicios: typeof r.ejercicios === "string" ? JSON.parse(r.ejercicios) : r.ejercicios,
    fechaCreacion: r.fecha_creacion,
  };
}

// ─── Citas ───────────────────────────────────────────────────────────────────

export async function getCitasByMes(year: number, month: number): Promise<Cita[]> {
  const db = sql();
  const desde = `${year}-${String(month).padStart(2, "0")}-01`;
  const hasta = `${year}-${String(month).padStart(2, "0")}-31`;
  const rows = await db`
    SELECT c.*, p.nombre || ' ' || p.apellidos AS paciente_nombre
    FROM citas c
    JOIN pacientes p ON p.id = c.paciente_id
    WHERE c.fecha BETWEEN ${desde} AND ${hasta}
    ORDER BY c.fecha ASC, c.hora ASC
  `;
  return rows.map(rowToCita);
}

export async function getCitasByPaciente(pacienteId: string): Promise<Cita[]> {
  const db = sql();
  const rows = await db`
    SELECT * FROM citas WHERE paciente_id = ${pacienteId} ORDER BY fecha DESC, hora ASC
  `;
  return rows.map(rowToCita);
}

export async function createCita(data: Omit<Cita, "id" | "fechaCreacion" | "pacienteNombre">): Promise<Cita> {
  const db = sql();
  const id = generateId();
  await db`
    INSERT INTO citas (id, paciente_id, fecha, hora, duracion, motivo, estado, notas, fecha_creacion)
    VALUES (${id}, ${data.pacienteId}, ${data.fecha}, ${data.hora}, ${data.duracion}, ${data.motivo}, ${data.estado}, ${data.notas}, NOW())
  `;
  return { ...data, id, fechaCreacion: new Date().toISOString().split("T")[0] };
}

export async function updateCitaEstado(id: string, estado: EstadoCita): Promise<void> {
  const db = sql();
  await db`UPDATE citas SET estado = ${estado} WHERE id = ${id}`;
}

export async function deleteCita(id: string): Promise<void> {
  const db = sql();
  await db`DELETE FROM citas WHERE id = ${id}`;
}

// ─── Costes ──────────────────────────────────────────────────────────────────

export async function getCostes(year: number, month: number): Promise<Coste[]> {
  const db = sql();
  const desde = `${year}-${String(month).padStart(2, "0")}-01`;
  const hasta = `${year}-${String(month).padStart(2, "0")}-31`;
  const rows = await db`
    SELECT * FROM costes WHERE fecha BETWEEN ${desde} AND ${hasta} ORDER BY fecha DESC
  `;
  return rows.map(rowToCoste);
}

export async function createCoste(data: Omit<Coste, "id" | "fechaCreacion">): Promise<Coste> {
  const db = sql();
  const id = generateId();
  await db`
    INSERT INTO costes (id, fecha, concepto, importe, categoria, notas, fecha_creacion)
    VALUES (${id}, ${data.fecha}, ${data.concepto}, ${data.importe}, ${data.categoria}, ${data.notas}, NOW())
  `;
  return { ...data, id, fechaCreacion: new Date().toISOString().split("T")[0] };
}

export async function deleteCoste(id: string): Promise<void> {
  const db = sql();
  await db`DELETE FROM costes WHERE id = ${id}`;
}

export async function getIngresosPorCitas(year: number, month: number): Promise<{ total: number; sesiones: number }> {
  const db = sql();
  const desde = `${year}-${String(month).padStart(2, "0")}-01`;
  const hasta = `${year}-${String(month).padStart(2, "0")}-31`;
  const rows = await db`
    SELECT COALESCE(SUM(duracion), 0) AS total_minutos, COUNT(*) AS total_sesiones
    FROM citas
    WHERE fecha BETWEEN ${desde} AND ${hasta}
    AND estado IN ('confirmada', 'completada')
  `;
  const minutos = Number(rows[0]?.total_minutos ?? 0);
  const sesiones = Number(rows[0]?.total_sesiones ?? 0);
  const total = (minutos / 30) * 35;
  return { total, sesiones };
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function rowToCoste(r: Record<string, unknown>): Coste {
  return {
    id: String(r.id),
    fecha: toDateStr(r.fecha),
    concepto: String(r.concepto ?? ""),
    importe: Number(r.importe ?? 0),
    categoria: (r.categoria as CategoriaCoste) ?? "otro",
    notas: String(r.notas ?? ""),
    fechaCreacion: toDateStr(r.fecha_creacion),
  };
}


function rowToCita(r: Record<string, unknown>): Cita {
  return {
    id: String(r.id),
    pacienteId: String(r.paciente_id),
    pacienteNombre: r.paciente_nombre ? String(r.paciente_nombre) : undefined,
    fecha: toDateStr(r.fecha),
    hora: r.hora ? String(r.hora).slice(0, 5) : "",
    duracion: Number(r.duracion ?? 60),
    motivo: String(r.motivo ?? ""),
    estado: (r.estado as EstadoCita) ?? "pendiente",
    notas: String(r.notas ?? ""),
    fechaCreacion: toDateStr(r.fecha_creacion),
  };
}


function toDateStr(val: unknown): string {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  const s = String(val);
  // ISO string: "2026-06-15T00:00:00.000Z"
  if (s.includes("T")) return s.split("T")[0];
  // Already "2026-06-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Fallback: parse as date
  try { return new Date(s).toISOString().split("T")[0]; } catch { return ""; }
}

function rowToPaciente(r: Record<string, unknown>): Paciente {
  return {
    id: String(r.id),
    dni: String(r.dni ?? ""),
    nombre: String(r.nombre ?? ""),
    apellidos: String(r.apellidos ?? ""),
    email: String(r.email ?? ""),
    telefono: String(r.telefono ?? ""),
    fechaNacimiento: toDateStr(r.fecha_nacimiento),
    poblacion: String(r.poblacion ?? ""),
    fechaAlta: toDateStr(r.fecha_alta),
    lopdFirmada: Boolean(r.lopd_firmada),
    lopdFecha: r.lopd_fecha ? toDateStr(r.lopd_fecha) : undefined,
  };
}

function rowToHistoria(r: Record<string, unknown>): HistoriaClinica {
  let banderas: string[] = [];
  try {
    banderas = typeof r.banderas_rojas === "string"
      ? JSON.parse(r.banderas_rojas)
      : (r.banderas_rojas as string[]) ?? [];
  } catch { banderas = []; }
  return {
    pacienteId: String(r.paciente_id),
    profesion: String(r.profesion ?? ""),
    alergias: String(r.alergias ?? ""),
    ejercicioFisico: String(r.ejercicio_fisico ?? ""),
    motivoConsulta: String(r.motivo_consulta ?? ""),
    antecedentesPersonalesFamiliares: String(r.antecedentes_personales_familiares ?? ""),
    calidadSueno: String(r.calidad_sueno ?? ""),
    patologias: String(r.patologias ?? ""),
    tabaquismo: String(r.tabaquismo ?? ""),
    medicacion: String(r.medicacion ?? ""),
    implantesMetalicos: String(r.implantes_metalicos ?? ""),
    embarazoLactancia: String(r.embarazo_lactancia ?? ""),
    semanasEmbarazo: String(r.semanas_embarazo ?? ""),
    banderasRojas: banderas,
    pruebaTipo: String(r.prueba_tipo ?? ""),
    pruebaFecha: toDateStr(r.prueba_fecha),
    pruebaDiagnostico: String(r.prueba_diagnostico ?? ""),
    pruebaImagenUrl: r.prueba_imagen_url ? String(r.prueba_imagen_url) : undefined,
    fechaCreacion: toDateStr(r.fecha_creacion),
  };
}

function rowToTratamiento(r: Record<string, unknown>): TratamientoEvolucion {
  return {
    id: String(r.id),
    pacienteId: String(r.paciente_id),
    fecha: toDateStr(r.fecha),
    nSesion: Number(r.n_sesion),
    contenido: String(r.contenido ?? ""),
    fechaCreacion: toDateStr(r.fecha_creacion),
  };
}
