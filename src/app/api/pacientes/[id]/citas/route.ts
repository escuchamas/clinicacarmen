import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCitasByPaciente } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const citas = await getCitasByPaciente(id);
    return NextResponse.json(citas);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 });
  }
}
