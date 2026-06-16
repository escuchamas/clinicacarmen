import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTratamientosByPaciente, createTratamiento, updateTratamiento, createInformePostSesion } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const sesiones = await getTratamientosByPaciente(id);
    return NextResponse.json(sesiones);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener sesiones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const sesion = await createTratamiento(id, body.contenido);

    if (body.informe?.ejercicios?.length > 0) {
      await createInformePostSesion({
        pacienteId: id,
        sesionId: sesion.id,
        fecha: sesion.fecha,
        ejercicios: body.informe.ejercicios,
      });
    }
    return NextResponse.json(sesion, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    await params;
    const body = await req.json();
    await updateTratamiento(body.sesionId, body.contenido);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar sesión" }, { status: 500 });
  }
}
