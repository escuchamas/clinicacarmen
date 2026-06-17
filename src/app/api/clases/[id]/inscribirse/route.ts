import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClasePilatesById, getInscripcionByPacienteAndClase, inscribirPaciente, cancelarInscripcion } from "@/lib/db";

function getPacienteId(session: Awaited<ReturnType<typeof auth>>): string | null {
  const user = session?.user as { role?: string; pacienteId?: string } | undefined;
  if (!user) return null;
  if (user.role === "patient") return user.pacienteId ?? null;
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const pacienteId = getPacienteId(session);
  if (!pacienteId) return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });

  const { id: claseId } = await params;
  const clase = await getClasePilatesById(claseId);
  if (!clase || clase.estado === "cancelada") return NextResponse.json({ error: "Clase no disponible" }, { status: 404 });
  if (clase.inscritosCount >= clase.capacidad) return NextResponse.json({ error: "Clase completa" }, { status: 409 });

  const existing = await getInscripcionByPacienteAndClase(pacienteId, claseId);
  if (existing?.estado === "inscrita") return NextResponse.json({ error: "Ya estás inscrito" }, { status: 409 });

  const inscripcion = await inscribirPaciente(pacienteId, claseId);
  return NextResponse.json(inscripcion, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const pacienteId = getPacienteId(session);
  if (!pacienteId) return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });

  const { id: claseId } = await params;
  const clase = await getClasePilatesById(claseId);
  if (!clase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check 8-hour cancellation policy
  const claseDateTime = new Date(`${clase.fecha}T${clase.horaInicio}:00`);
  const horasRestantes = (claseDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const penalizar = horasRestantes < 8;

  await cancelarInscripcion(pacienteId, claseId, penalizar);
  return NextResponse.json({ ok: true, penalizada: penalizar });
}
