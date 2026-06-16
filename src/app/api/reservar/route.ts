import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, telefono, email, motivo, fecha, franja } = body;

    if (!nombre?.trim() || !telefono?.trim()) {
      return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
    }

    const db = sql();
    const pacienteId = generateId();
    const fechaAlta = new Date().toISOString().split("T")[0];
    const dniWeb = `WEB-${pacienteId}`;

    await db`
      INSERT INTO pacientes (id, dni, nombre, apellidos, email, telefono, fecha_alta, lopd_firmada)
      VALUES (${pacienteId}, ${dniWeb}, ${nombre.trim()}, '', ${email?.trim() ?? ''}, ${telefono.trim()}, ${fechaAlta}, false)
    `;

    const citaId = generateId();
    const horaMap: Record<string, string> = {
      manana: "10:00",
      tarde: "17:00",
      indistinto: "10:00",
    };
    const hora = horaMap[franja ?? "indistinto"] ?? "10:00";
    const fechaCita = fecha || fechaAlta;
    const notasCita = `Reserva online${motivo ? ` · ${motivo}` : ""}`;

    await db`
      INSERT INTO citas (id, paciente_id, fecha, hora, duracion, motivo, estado, notas, fecha_creacion)
      VALUES (${citaId}, ${pacienteId}, ${fechaCita}, ${hora}, 60, ${motivo ?? "Primera consulta"}, 'pendiente', ${notasCita}, NOW())
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
