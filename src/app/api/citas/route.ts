import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCitasByMes, createCita, updateCitaEstado, deleteCita } from "@/lib/db";
import { EstadoCita } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const citas = await getCitasByMes(year, month);
    return NextResponse.json(citas);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const cita = await createCita({
      pacienteId: body.pacienteId,
      fecha: body.fecha,
      hora: body.hora,
      duracion: body.duracion ?? 60,
      motivo: body.motivo ?? "",
      estado: body.estado ?? "pendiente",
      notas: body.notas ?? "",
    });
    return NextResponse.json(cita, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear cita" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    if (body.action === "estado") {
      await updateCitaEstado(body.id, body.estado as EstadoCita);
    } else if (body.action === "delete") {
      await deleteCita(body.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar cita" }, { status: 500 });
  }
}
