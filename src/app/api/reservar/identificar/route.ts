import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(req: NextRequest) {
  try {
    const { dni, telefono } = await req.json();
    if (!dni?.trim() || !telefono?.trim()) {
      return NextResponse.json({ error: "DNI y teléfono son obligatorios" }, { status: 400 });
    }

    const db = sql();
    const rows = await db`
      SELECT id, nombre, apellidos, email, telefono
      FROM pacientes
      WHERE LOWER(dni) = LOWER(${dni.trim()})
        AND REPLACE(REPLACE(telefono, ' ', ''), '-', '') = REPLACE(REPLACE(${telefono.trim()}, ' ', ''), '-', '')
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "No encontramos ningún paciente con ese DNI y teléfono." }, { status: 404 });
    }

    const p = rows[0];

    const hoy = new Date().toISOString().split("T")[0];
    const citas = await db`
      SELECT id, fecha, hora FROM citas
      WHERE paciente_id = ${p.id}
        AND fecha >= ${hoy}
        AND estado NOT IN ('cancelada', 'no_vino', 'vino')
      ORDER BY fecha ASC, hora ASC
      LIMIT 1
    `;
    const citaActiva = citas.length > 0
      ? { citaId: citas[0].id, fecha: citas[0].fecha, hora: (citas[0].hora as string).slice(0, 5) }
      : null;

    return NextResponse.json({ id: p.id, nombre: p.nombre, apellidos: p.apellidos, citaActiva });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al buscar paciente" }, { status: 500 });
  }
}
