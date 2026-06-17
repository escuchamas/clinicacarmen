import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getClasePilatesById, getInscripcionByPacienteAndClase, inscribirPaciente, cancelarInscripcion } from "@/lib/db";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

async function verificarPaciente(dni: string, telefono: string): Promise<string | null> {
  const db = sql();
  const rows = await db`
    SELECT id FROM pacientes
    WHERE LOWER(dni) = LOWER(${dni.trim()})
      AND REPLACE(REPLACE(telefono, ' ', ''), '-', '') = REPLACE(REPLACE(${telefono.trim()}, ' ', ''), '-', '')
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].id : null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: claseId } = await params;
  const body = await req.json();
  const { dni, telefono } = body ?? {};
  if (!dni || !telefono) return NextResponse.json({ error: "DNI y teléfono requeridos" }, { status: 400 });

  const pacienteId = await verificarPaciente(dni, telefono);
  if (!pacienteId) return NextResponse.json({ error: "No encontramos ningún paciente con ese DNI y teléfono." }, { status: 401 });

  const clase = await getClasePilatesById(claseId);
  if (!clase || clase.estado === "cancelada") return NextResponse.json({ error: "Clase no disponible" }, { status: 404 });
  if (clase.inscritosCount >= clase.capacidad) return NextResponse.json({ error: "Clase completa" }, { status: 409 });

  const existing = await getInscripcionByPacienteAndClase(pacienteId, claseId);
  if (existing?.estado === "inscrita") return NextResponse.json({ error: "Ya estás inscrito en esta clase" }, { status: 409 });

  const inscripcion = await inscribirPaciente(pacienteId, claseId);
  return NextResponse.json(inscripcion, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: claseId } = await params;
  const body = await req.json();
  const { dni, telefono } = body ?? {};
  if (!dni || !telefono) return NextResponse.json({ error: "DNI y teléfono requeridos" }, { status: 400 });

  const pacienteId = await verificarPaciente(dni, telefono);
  if (!pacienteId) return NextResponse.json({ error: "No encontramos ningún paciente con ese DNI y teléfono." }, { status: 401 });

  const clase = await getClasePilatesById(claseId);
  if (!clase) return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });

  const claseDateTime = new Date(`${clase.fecha}T${clase.horaInicio}:00`);
  const horasRestantes = (claseDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const penalizar = horasRestantes < 8;

  await cancelarInscripcion(pacienteId, claseId, penalizar);
  return NextResponse.json({ ok: true, penalizada: penalizar });
}
