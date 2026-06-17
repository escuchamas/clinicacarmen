import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInscripcionesByPaciente } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string; pacienteId?: string } | undefined;
  if (!user || user.role !== "patient" || !user.pacienteId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inscripciones = await getInscripcionesByPaciente(user.pacienteId);
  return NextResponse.json(inscripciones.map(i => ({ claseId: i.claseId, estado: i.estado })));
}
