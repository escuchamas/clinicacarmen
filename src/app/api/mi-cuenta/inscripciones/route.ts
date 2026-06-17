import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getInscripcionesByPaciente } from "@/lib/db";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dni = searchParams.get("dni");
  const telefono = searchParams.get("telefono");
  if (!dni || !telefono) return NextResponse.json({ error: "DNI y teléfono requeridos" }, { status: 400 });

  const db = sql();
  const rows = await db`
    SELECT id FROM pacientes
    WHERE LOWER(dni) = LOWER(${dni.trim()})
      AND REPLACE(REPLACE(telefono, ' ', ''), '-', '') = REPLACE(REPLACE(${telefono.trim()}, ' ', ''), '-', '')
    LIMIT 1
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });

  const pacienteId = rows[0].id;
  const inscripciones = await getInscripcionesByPaciente(pacienteId);
  return NextResponse.json({ pacienteId, inscripciones: inscripciones.map(i => ({ claseId: i.claseId, estado: i.estado })) });
}
