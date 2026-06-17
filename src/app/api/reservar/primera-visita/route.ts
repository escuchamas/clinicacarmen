import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const { dni, telefono, nombre, apellidos, email, fecha, hora, cuestionario } = await req.json();

    if (!dni || !telefono || !nombre || !apellidos || !fecha || !hora) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const db = sql();

    // Verificar que el DNI no existe ya
    const existing = await db`SELECT id FROM pacientes WHERE LOWER(dni) = LOWER(${dni.trim()}) LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "ya_existe", pacienteId: existing[0].id }, { status: 409 });
    }

    // Crear paciente básico
    const pacienteId = generateId();
    await db`
      INSERT INTO pacientes (id, nombre, apellidos, dni, telefono, email, fecha_creacion)
      VALUES (${pacienteId}, ${nombre.trim()}, ${apellidos.trim()}, ${dni.trim()}, ${telefono.trim()}, ${email?.trim() ?? null}, NOW())
    `;

    // Construir notas con el cuestionario
    const notas = [
      "=== SOLICITUD PRIMERA VISITA ===",
      `Motivo: ${cuestionario.motivo}`,
      `Dolor actual: ${cuestionario.dolorActual}`,
      cuestionario.dolorActual === "Sí" ? `Desde hace: ${cuestionario.dolorDesde}` : null,
      `Fisioterapia previa: ${cuestionario.fisioPrevia}`,
      cuestionario.otrasNotas ? `Notas adicionales: ${cuestionario.otrasNotas}` : null,
    ].filter(Boolean).join("\n");

    // Crear cita pendiente de confirmación
    const citaId = generateId();
    await db`
      INSERT INTO citas (id, paciente_id, fecha, hora, duracion, motivo, estado, notas, fecha_creacion)
      VALUES (${citaId}, ${pacienteId}, ${fecha}, ${hora}, 30, 'Primera visita', 'pendiente', ${notas}, NOW())
    `;

    return NextResponse.json({ pacienteId, citaId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
