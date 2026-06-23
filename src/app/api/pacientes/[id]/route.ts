import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPacienteById, updatePaciente, deletePaciente, getHistoriaClinica, updateHistoriaClinica } from "@/lib/db";
import { sendConsentimientoEmail, sendConsentimientosPdf } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const [paciente, historia] = await Promise.all([
      getPacienteById(id),
      getHistoriaClinica(id),
    ]);
    if (!paciente) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    return NextResponse.json({ paciente, historia });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener paciente" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    await deletePaciente(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar paciente" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    if (body.seccion === "datos") {
      await updatePaciente(id, body.datos);
    } else if (body.seccion === "historia") {
      await updateHistoriaClinica(id, body.datos);
    } else if (body.seccion === "consentimiento") {
      const paciente = await getPacienteById(id);
      if (!paciente?.email) return NextResponse.json({ error: "El paciente no tiene email" }, { status: 400 });
      await sendConsentimientoEmail(paciente.email, paciente.nombre, paciente.apellidos);
    } else if (body.seccion === "consentimientos_pdf") {
      const paciente = await getPacienteById(id);
      if (!paciente?.email) return NextResponse.json({ error: "El paciente no tiene email" }, { status: 400 });
      await sendConsentimientosPdf(paciente.email, paciente.nombre, paciente.apellidos, body.docs as { nombre: string; url: string }[]);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
