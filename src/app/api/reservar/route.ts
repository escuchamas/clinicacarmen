import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createLead } from "@/lib/db";

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

    // Insert only guaranteed base columns
    await db`
      INSERT INTO pacientes (id, dni, nombre, apellidos, email, telefono)
      VALUES (${pacienteId}, ${dniWeb}, ${nombre.trim()}, '', ${email?.trim() ?? ''}, ${telefono.trim()})
    `;

    // Optional columns — graceful if not yet migrated
    try {
      await db`
        UPDATE pacientes SET fecha_alta = ${fechaAlta}, lopd_firmada = false WHERE id = ${pacienteId}
      `;
    } catch { /* columnas opcionales no migradas todavía */ }

    const citaId = generateId();
    const horaMap: Record<string, string> = {
      manana: "10:00",
      tarde: "17:00",
      indistinto: "10:00",
    };
    const hora = horaMap[franja ?? "indistinto"] ?? "10:00";
    const fechaCita = fecha || fechaAlta;
    const notasCita = `Solicitud landing${motivo ? ` · ${motivo}` : ""}`;

    await db`
      INSERT INTO citas (id, paciente_id, fecha, hora, duracion, motivo, estado, notas, fecha_creacion)
      VALUES (${citaId}, ${pacienteId}, ${fechaCita}, ${hora}, 60, ${motivo ?? "Primera consulta"}, 'pendiente', ${notasCita}, NOW())
    `;

    // Guardar como lead (tabla leads debe existir en Neon)
    await createLead({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email?.trim(),
      mensaje: motivo?.trim(),
      origen: "landing",
      pacienteId,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[reservar]", e);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
