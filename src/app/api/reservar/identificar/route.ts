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
    return NextResponse.json({ id: p.id, nombre: p.nombre, apellidos: p.apellidos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al buscar paciente" }, { status: 500 });
  }
}
