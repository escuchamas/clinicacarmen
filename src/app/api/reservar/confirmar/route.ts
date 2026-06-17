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

    // Comprobar si ya tiene una cita activa futura
    const hoy = new Date().toISOString().split("T")[0];
    const citasActivas = await db`
      SELECT id, fecha, hora FROM citas
      WHERE paciente_id = ${pacienteId}
        AND fecha >= ${hoy}
        AND estado NOT IN ('cancelada', 'no_vino')
      LIMIT 1
    `;
    if (citasActivas.length > 0) {
      const c = citasActivas[0];
      return NextResponse.json(
        { error: "ya_tiene_cita", citaId: c.id, fecha: c.fecha, hora: c.hora.slice(0, 5) },
        { status: 409 }
      );
    }

    const cita = await createCita({
      pacienteId,
      fecha,
      hora,
      duracion: duracion ?? 60,
      motivo: motivo || "Reserva online",
      estado: "agendada",
      notas: notas || "Reserva online",
      pagoEstado: "sin_pagar",
    });

    return NextResponse.json(cita, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 });
  }
}
