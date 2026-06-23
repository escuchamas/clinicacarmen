import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { sendLopdEmail } from "@/lib/email";
import { createLead } from "@/lib/db";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dni, telefono, nombre, apellidos, email, fecha, hora, cuestionario } = body;

    if (!dni || !telefono || !nombre || !apellidos || !fecha || !hora) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const db = sql();

    // Verificar que el DNI no existe ya
    const existing = await db`SELECT id FROM pacientes WHERE LOWER(dni) = LOWER(${dni.trim()}) LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "ya_existe", pacienteId: existing[0].id }, { status: 409 });
    }

    // Crear paciente básico — solo columnas garantizadas en esquema original
    const pacienteId = generateId();
    await db`
      INSERT INTO pacientes (id, dni, nombre, apellidos, email, telefono)
      VALUES (
        ${pacienteId},
        ${dni.trim()},
        ${nombre.trim()},
        ${apellidos.trim()},
        ${email?.trim() ?? ""},
        ${telefono.trim()}
      )
    `;

    // Intentar rellenar columnas opcionales si existen (no falla si no existen)
    try {
      await db`
        UPDATE pacientes
        SET fecha_alta = CURRENT_DATE, lopd_firmada = false
        WHERE id = ${pacienteId}
          AND fecha_alta IS NULL
      `;
    } catch { /* columnas no creadas todavía, se ignora */ }

    // Construir notas con el cuestionario
    const cq = cuestionario ?? {};
    const notas = [
      "=== SOLICITUD PRIMERA VISITA ===",
      cq.motivo ? `Motivo: ${cq.motivo}` : null,
      cq.dolorActual ? `Dolor actual: ${cq.dolorActual}` : null,
      cq.dolorActual === "Sí" && cq.dolorDesde ? `Desde hace: ${cq.dolorDesde}` : null,
      cq.fisioPrevia ? `Fisioterapia previa: ${cq.fisioPrevia}` : null,
      cq.otrasNotas ? `Notas adicionales: ${cq.otrasNotas}` : null,
    ].filter(Boolean).join("\n");

    // Crear cita pendiente de confirmación
    const citaId = generateId();
    await db`
      INSERT INTO citas (id, paciente_id, fecha, hora, duracion, motivo, estado, notas, fecha_creacion)
      VALUES (${citaId}, ${pacienteId}, ${fecha}, ${hora}, 30, 'Primera visita', 'agendada', ${notas}, NOW())
    `;

    // Enviar email LOPD si el paciente facilitó correo
    if (email?.trim()) {
      sendLopdEmail(email.trim(), nombre.trim(), apellidos.trim()).catch((err) =>
        console.error("[lopd-email]", err)
      );
    }

    createLead({ nombre: nombre.trim(), telefono: telefono.trim(), email: email?.trim(), mensaje: (cuestionario as Record<string,string>)?.motivo, origen: "pedir_cita", pacienteId }).catch(() => {});

    return NextResponse.json({ pacienteId, citaId }, { status: 201 });
  } catch (e) {
    console.error("[primera-visita]", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
