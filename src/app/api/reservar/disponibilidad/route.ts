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

    const db = sql();
    const rows = await db`
      SELECT hora FROM citas
      WHERE fecha = ${fecha}
        AND estado != 'cancelada'
    `;

    const ocupados = new Set(rows.map((r) => r.hora.slice(0, 5)));

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
