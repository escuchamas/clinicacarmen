import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// GET — lista de fechas bloqueadas
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = sql();
    // Asegurar que la tabla existe (primera vez)
    await db`
      CREATE TABLE IF NOT EXISTS dias_bloqueados (
        id TEXT PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        motivo TEXT,
        fecha_creacion TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    const rows = await db`SELECT * FROM dias_bloqueados ORDER BY fecha ASC`;
    return NextResponse.json(rows.map(r => ({
      id: String(r.id),
      fecha: r.fecha instanceof Date ? r.fecha.toISOString().split("T")[0] : String(r.fecha).slice(0, 10),
      motivo: r.motivo ? String(r.motivo) : "",
    })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener días bloqueados" }, { status: 500 });
  }
}

// POST — bloquear una fecha
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { fecha, motivo } = await req.json();
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }
    const db = sql();
    await db`
      CREATE TABLE IF NOT EXISTS dias_bloqueados (
        id TEXT PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        motivo TEXT,
        fecha_creacion TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    const id = generateId();
    await db`
      INSERT INTO dias_bloqueados (id, fecha, motivo)
      VALUES (${id}, ${fecha}, ${motivo ?? ""})
      ON CONFLICT (fecha) DO UPDATE SET motivo = ${motivo ?? ""}
    `;
    return NextResponse.json({ ok: true, id, fecha, motivo: motivo ?? "" }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al bloquear día" }, { status: 500 });
  }
}

// DELETE — desbloquear una fecha
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { fecha } = await req.json();
    if (!fecha) return NextResponse.json({ error: "Falta la fecha" }, { status: 400 });
    const db = sql();
    await db`DELETE FROM dias_bloqueados WHERE fecha = ${fecha}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al desbloquear día" }, { status: 500 });
  }
}
