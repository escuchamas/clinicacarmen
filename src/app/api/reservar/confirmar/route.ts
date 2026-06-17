import { NextRequest, NextResponse } from "next/server";
import { createCita } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(req: NextRequest) {
  try {
    const { pacienteId, fecha, hora, duracion, motivo, notas } = await req.json();
    if (!pacienteId || !fecha || !hora) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que el paciente existe
    const db = sql();
    const rows = await db`SELECT id FROM pacientes WHERE id = ${pacienteId} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    const cita = await createCita({
      pacienteId,
      fecha,
      hora,
      duracion: duracion ?? 60,
      motivo: motivo || "Reserva online",
      estado: "pendiente",
      notas: notas || "Reserva online — pago pendiente de confirmar",
    });

    return NextResponse.json(cita, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 });
  }
}
