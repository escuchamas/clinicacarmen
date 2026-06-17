import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export async function GET(req: NextRequest) {
  try {
    const fecha = new URL(req.url).searchParams.get("fecha");
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    // No permitir fechas pasadas
    const hoy = new Date().toISOString().split("T")[0];
    if (fecha < hoy) {
      return NextResponse.json({ disponibles: [] });
    }

    // Bloquear sábados (6) y domingos (0) por defecto
    const diaSemana = new Date(fecha + "T12:00:00").getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return NextResponse.json({ disponibles: [], bloqueado: true, motivo: "Fin de semana" });
    }

    const db = sql();

    // Comprobar bloqueos manuales (día completo u horas)
    let bloqueadoDia = false;
    let motivoBloqueado = "";
    const horasBloqueadas: { inicio: string; fin: string }[] = [];
    try {
      const bloqueos = await db`
        SELECT hora_inicio, hora_fin, motivo FROM dias_bloqueados WHERE fecha = ${fecha}
      `;
      for (const b of bloqueos) {
        if (!b.hora_inicio) {
          bloqueadoDia = true;
          motivoBloqueado = b.motivo ? String(b.motivo) : "Día no disponible";
        } else {
          horasBloqueadas.push({ inicio: String(b.hora_inicio).slice(0, 5), fin: String(b.hora_fin ?? "23:59").slice(0, 5) });
        }
      }
    } catch { /* tabla no existe todavía */ }

    if (bloqueadoDia) {
      return NextResponse.json({ disponibles: [], bloqueado: true, motivo: motivoBloqueado });
    }

    // Horas ocupadas por citas individuales
    const rows = await db`
      SELECT hora FROM citas
      WHERE fecha = ${fecha}
        AND estado != 'cancelada'
    `;
    const ocupados = new Set(rows.map((r) => String(r.hora).slice(0, 5)));

    // Horas bloqueadas manualmente (rangos parciales)
    for (const b of horasBloqueadas) {
      for (const slot of ALL_SLOTS) {
        if (slot >= b.inicio && slot < b.fin) ocupados.add(slot);
      }
    }

    // Horas ocupadas por clases de pilates
    try {
      const clases = await db`
        SELECT hora_inicio, hora_fin FROM clases_pilates
        WHERE fecha = ${fecha} AND estado = 'activa'
      `;
      for (const clase of clases) {
        const inicio = String(clase.hora_inicio).slice(0, 5);
        const fin = String(clase.hora_fin).slice(0, 5);
        for (const slot of ALL_SLOTS) {
          if (slot >= inicio && slot < fin) ocupados.add(slot);
        }
      }
    } catch { /* tabla no existe todavía */ }

    // Si es hoy, filtrar horas ya pasadas
    let slots = ALL_SLOTS;
    if (fecha === hoy) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
      slots = slots.filter((s) => s > horaActual);
    }

    const disponibles = slots.filter((s) => !ocupados.has(s));
    return NextResponse.json({ disponibles });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al consultar disponibilidad" }, { status: 500 });
  }
}
