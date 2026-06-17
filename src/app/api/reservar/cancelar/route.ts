import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(req: NextRequest) {
  try {
    const { pacienteId, citaId } = await req.json();
    if (!pacienteId || !citaId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const db = sql();

    // Verificar que la cita pertenece a este paciente y está activa
    const rows = await db`
      SELECT id, fecha, hora FROM citas
      WHERE id = ${citaId}
        AND paciente_id = ${pacienteId}
        AND estado NOT IN ('cancelada', 'completada')
      LIMIT 1
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const cita = rows[0];

    // Verificar política de 24h
    const citaDateTime = new Date(`${cita.fecha}T${cita.hora}`);
    const horasRestantes = (citaDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (horasRestantes < 24) {
      return NextResponse.json({ error: "menos_24h" }, { status: 403 });
    }

    await db`UPDATE citas SET estado = 'cancelada' WHERE id = ${citaId}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al cancelar la cita" }, { status: 500 });
  }
}
